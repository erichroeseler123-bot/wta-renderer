import assert from "node:assert/strict";
import { AsyncLocalStorage } from "node:async_hooks";
import fs from "node:fs";
import http from "node:http";
import path from "node:path";
import test from "node:test";
import { createRequire } from "node:module";
import { NextRequest } from "next/server";

const cjsRequire = createRequire(import.meta.url);
(globalThis as Record<string, unknown>).AsyncLocalStorage ??= AsyncLocalStorage;

import { GET as envCheckGet } from "../app/api/fareharbor/env-check/route";
import { POST as createIntentPost } from "../app/api/stripe/create-intent/route";
import nextConfig from "../next.config";
import {
  emitDccSatelliteEvent,
  normalizeAuthorizedDccHandoffId,
} from "../lib/dccSatellite";

test("GET /api/fareharbor/env-check returns 404 JSON with no-store and zero env-flag exposure", async () => {
  const prevApp = process.env.FAREHARBOR_APP_KEY;
  const prevUser = process.env.FAREHARBOR_USER_KEY;
  const prevVercelEnv = process.env.VERCEL_ENV;

  try {
    process.env.FAREHARBOR_APP_KEY = "sensitive-app-key-secret";
    process.env.FAREHARBOR_USER_KEY = "sensitive-user-key-secret";
    process.env.VERCEL_ENV = "production";

    const res = envCheckGet();
    assert.equal(res.status, 404);
    assert.equal(res.headers.get("Cache-Control"), "no-store");

    const body = (await res.json()) as Record<string, unknown>;
    assert.deepEqual(body, { ok: false, error: "Not found" });

    const serialized = JSON.stringify(body);
    assert.equal(serialized.includes("FAREHARBOR"), false);
    assert.equal(serialized.includes("FH_"), false);
    assert.equal(serialized.includes("effectiveAppKeyLen"), false);
    assert.equal(serialized.includes("effectiveUserKeyLen"), false);
    assert.equal(serialized.includes("vercelEnv"), false);
    assert.equal(serialized.includes("nodeEnv"), false);
  } finally {
    if (prevApp === undefined) delete process.env.FAREHARBOR_APP_KEY;
    else process.env.FAREHARBOR_APP_KEY = prevApp;
    if (prevUser === undefined) delete process.env.FAREHARBOR_USER_KEY;
    else process.env.FAREHARBOR_USER_KEY = prevUser;
    if (prevVercelEnv === undefined) delete process.env.VERCEL_ENV;
    else process.env.VERCEL_ENV = prevVercelEnv;
  }
});

test("emitDccSatelliteEvent blocks outbound DCC telemetry and strips all customer PII when handoffId is missing or invalid", async () => {
  const prevCallbackUrl = process.env.DCC_CALLBACK_URL;
  const prevEnabled = process.env.DCC_CALLBACKS_ENABLED;
  const originalFetch = globalThis.fetch;

  let dccFetchCount = 0;
  globalThis.fetch = (async () => {
    dccFetchCount += 1;
    return new Response(JSON.stringify({ ok: true }), { status: 200 });
  }) as typeof fetch;

  try {
    process.env.DCC_CALLBACK_URL = "https://www.destinationcommandcenter.com/api/internal/satellite-handoffs/events";
    process.env.DCC_CALLBACKS_ENABLED = "true";

    for (const badHandoffId of ["", "   ", "bad token with spaces", "../traversal"]) {
      assert.equal(normalizeAuthorizedDccHandoffId(badHandoffId), undefined);

      const row = await emitDccSatelliteEvent({
        handoffId: badHandoffId,
        satelliteId: "welcome-to-alaska",
        eventType: "lead_captured",
        externalReference: "ord_organic_1",
        traveler: {
          name: "Organic Alaska Customer",
          email: "organic.customer@example.com",
          phone: "907-555-0199",
          partySize: 4,
        },
        metadata: {
          order_id: "ord_organic_1",
          customerEmail: "organic.customer@example.com",
          customerName: "Organic Alaska Customer",
          customerPhone: "907-555-0199",
          telephone: "907-555-0199",
        },
      });

      assert.equal(dccFetchCount, 0, "Must never POST to DCC without valid handoffId");
      assert.equal(row.skipped, true);
      assert.equal(row.ok, false);
      assert.equal(row.error, "missing_handoff_id");

      const serializedAuditPayload = JSON.stringify(row.payload);
      assert.equal(serializedAuditPayload.includes("Organic Alaska Customer"), false);
      assert.equal(serializedAuditPayload.includes("organic.customer@example.com"), false);
      assert.equal(serializedAuditPayload.includes("907-555-0199"), false);
      assert.equal(row.payload.traveler?.email, undefined);
      assert.equal(row.payload.traveler?.name, undefined);
      assert.equal(row.payload.traveler?.phone, undefined);
      assert.equal(row.payload.traveler?.partySize, 4);
    }
  } finally {
    globalThis.fetch = originalFetch;
    if (prevCallbackUrl === undefined) delete process.env.DCC_CALLBACK_URL;
    else process.env.DCC_CALLBACK_URL = prevCallbackUrl;
    if (prevEnabled === undefined) delete process.env.DCC_CALLBACKS_ENABLED;
    else process.env.DCC_CALLBACKS_ENABLED = prevEnabled;
  }
});

test("Organic WTA create-intent never calls DCC referral minting or DCC satellite events and transmits zero PII to DCC, while explicit dcc_handoff_id works", async () => {
  const prevFh = process.env.FH_BOOKINGS_ENABLED;
  const prevVercel = process.env.VERCEL;
  const prevNodeEnv = process.env.NODE_ENV;
  const prevStripe = process.env.STRIPE_SECRET_KEY;
  const prevTurnstile = process.env.TURNSTILE_SECRET_KEY;
  const prevLocalKv = process.env.USE_LOCAL_KV;
  const prevDccCallbackUrl = process.env.DCC_CALLBACK_URL;
  const prevDccCallbacksEnabled = process.env.DCC_CALLBACKS_ENABLED;
  const prevDccLiveKey = process.env.DCC_WTA_AFFILIATE_LIVE_API_KEY;
  const prevDccPreviewKey = process.env.DCC_WTA_AFFILIATE_PREVIEW_API_KEY;
  const prevOrderSecret = process.env.ORDER_SIGNING_SECRET;

  const originalFetch = globalThis.fetch;

  const stripeServer = http.createServer((req, res) => {
    let raw = "";
    req.on("data", (chunk) => {
      raw += chunk;
    });
    req.on("end", () => {
      res.writeHead(200, { "content-type": "application/json" });
      res.end(
        JSON.stringify({
          id: "pi_test_containment_123",
          object: "payment_intent",
          amount: 91800,
          currency: "usd",
          client_secret: "pi_test_containment_123_secret_abc",
          status: "requires_payment_method",
          metadata: {},
        }),
      );
    });
  });

  await new Promise<void>((resolve) => stripeServer.listen(0, "127.0.0.1", () => resolve()));
  const addr = stripeServer.address();
  const stripePort = typeof addr === "object" && addr ? addr.port : 0;

  const outboundRequests: Array<{ url: string; body: string }> = [];

  globalThis.fetch = (async (input: string | URL | Request, init?: RequestInit) => {
    const url = typeof input === "string" ? input : input instanceof URL ? input.toString() : input.url;
    const body = typeof init?.body === "string" ? init.body : "";
    outboundRequests.push({ url, body });

    if (url.includes("/api/fareharbor/price")) {
      return new Response(
        JSON.stringify({
          ok: true,
          success: true,
          currency: "usd",
          lineTotalCents: 91800,
        }),
        { status: 200, headers: { "content-type": "application/json" } },
      );
    }

    if (url.includes("destinationcommandcenter.com")) {
      return new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: { "content-type": "application/json" },
      });
    }

    return originalFetch(input as any, init);
  }) as typeof fetch;

  try {
    process.env.FH_BOOKINGS_ENABLED = "1";
    delete process.env.VERCEL;
    (process.env as Record<string, string | undefined>).NODE_ENV = "test";
    process.env.USE_LOCAL_KV = "true";
    process.env.STRIPE_SECRET_KEY = "sk_test_containment_dummy";
    process.env.ORDER_SIGNING_SECRET = "test-order-signing-secret-containment-123456";
    delete process.env.TURNSTILE_SECRET_KEY;
    process.env.DCC_CALLBACK_URL = "https://www.destinationcommandcenter.com/api/internal/satellite-handoffs/events";
    process.env.DCC_CALLBACKS_ENABLED = "true";
    process.env.DCC_WTA_AFFILIATE_PREVIEW_API_KEY = "dcc_preview_affiliate_key_that_would_mint_if_called";
    process.env.DCC_WTA_AFFILIATE_LIVE_API_KEY = "dcc_live_affiliate_key_that_would_mint_if_called";

    // Redirect Stripe SDK HTTP traffic to local mock server so Stripe never hits external network
    const StripeMod = await import("stripe");
    const stripeProto = StripeMod.default.prototype as unknown as {
      _prepResources: () => void;
    };
    const origPrep = stripeProto._prepResources;
    stripeProto._prepResources = function patchedPrepResources(
      this: { _setApiField: (field: string, value: unknown) => void },
    ) {
      origPrep.call(this);
      this._setApiField("host", "127.0.0.1");
      this._setApiField("port", stripePort);
      this._setApiField("protocol", "http");
    };

    try {
      // 1. Organic WTA checkout (no dcc_handoff_id / handoffId)
      outboundRequests.length = 0;
      const organicReq = new NextRequest("https://www.welcometoalaskatours.com/api/stripe/create-intent", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-forwarded-for": "198.51.100.10",
        },
        body: JSON.stringify({
          contact: {
            name: "Alice Organic",
            email: "alice.organic@example.com",
            phone: "907-555-0100",
          },
          items: [
            {
              company: "coastalhelicopters",
              itemPk: 413056,
              availabilityPk: 9991,
              ratePk: 8881,
              qty: 2,
              handoffDate: "2026-07-15",
            },
          ],
        }),
      });

      const organicRes = await createIntentPost(organicReq);
      assert.equal(organicRes.status, 200);
      const organicJson = (await organicRes.json()) as Record<string, unknown>;
      assert.equal(organicJson.success, true);
      assert.equal(organicJson.handoff_id, null);
      assert.equal(organicJson.handoff_source, null);

      const dccCallsForOrganic = outboundRequests.filter((r) =>
        r.url.includes("destinationcommandcenter.com"),
      );
      assert.equal(
        dccCallsForOrganic.length,
        0,
        "Organic WTA checkout must make ZERO outbound requests to DCC",
      );

      // 2. Explicit authorized dcc_handoff_id checkout
      outboundRequests.length = 0;
      const explicitHandoffId = "ho_authorized_dcc_2026_11_11";
      const dccReq = new NextRequest("https://www.welcometoalaskatours.com/api/stripe/create-intent", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-forwarded-for": "198.51.100.11",
        },
        body: JSON.stringify({
          dcc_handoff_id: explicitHandoffId,
          contact: {
            name: "Bob Referred",
            email: "bob.referred@example.com",
            phone: "907-555-0200",
          },
          items: [
            {
              company: "coastalhelicopters",
              itemPk: 413056,
              availabilityPk: 9991,
              ratePk: 8881,
              qty: 2,
              handoffSource: "dcc",
              dcc_handoff_id: explicitHandoffId,
              portSlug: "juneau",
              handoffDate: "2026-07-15",
            },
          ],
        }),
      });

      const dccRes = await createIntentPost(dccReq);
      assert.equal(dccRes.status, 200);
      const dccJson = (await dccRes.json()) as Record<string, unknown>;
      assert.equal(dccJson.success, true);
      assert.equal(dccJson.handoff_id, explicitHandoffId);
      assert.equal(dccJson.handoff_source, "dcc");

      const dccCallsForReferred = outboundRequests.filter((r) =>
        r.url.includes("destinationcommandcenter.com"),
      );
      assert.equal(dccCallsForReferred.length, 1);
      const postedPayload = JSON.parse(dccCallsForReferred[0].body) as Record<string, any>;
      assert.equal(postedPayload.handoffId, explicitHandoffId);
      assert.equal(postedPayload.eventType, "lead_captured");
      assert.equal(postedPayload.traveler?.email, "bob.referred@example.com");
      assert.equal(postedPayload.traveler?.name, "Bob Referred");
      assert.equal(postedPayload.traveler?.phone, "907-555-0200");
    } finally {
      stripeProto._prepResources = origPrep;
    }
  } finally {
    globalThis.fetch = originalFetch;
    await new Promise<void>((resolve) => stripeServer.close(() => resolve()));

    if (prevFh === undefined) delete process.env.FH_BOOKINGS_ENABLED;
    else process.env.FH_BOOKINGS_ENABLED = prevFh;
    if (prevVercel === undefined) delete process.env.VERCEL;
    else process.env.VERCEL = prevVercel;
    (process.env as Record<string, string | undefined>).NODE_ENV = prevNodeEnv;
    if (prevStripe === undefined) delete process.env.STRIPE_SECRET_KEY;
    else process.env.STRIPE_SECRET_KEY = prevStripe;
    if (prevTurnstile === undefined) delete process.env.TURNSTILE_SECRET_KEY;
    else process.env.TURNSTILE_SECRET_KEY = prevTurnstile;
    if (prevLocalKv === undefined) delete process.env.USE_LOCAL_KV;
    else process.env.USE_LOCAL_KV = prevLocalKv;
    if (prevDccCallbackUrl === undefined) delete process.env.DCC_CALLBACK_URL;
    else process.env.DCC_CALLBACK_URL = prevDccCallbackUrl;
    if (prevDccCallbacksEnabled === undefined) delete process.env.DCC_CALLBACKS_ENABLED;
    else process.env.DCC_CALLBACKS_ENABLED = prevDccCallbacksEnabled;
    if (prevDccLiveKey === undefined) delete process.env.DCC_WTA_AFFILIATE_LIVE_API_KEY;
    else process.env.DCC_WTA_AFFILIATE_LIVE_API_KEY = prevDccLiveKey;
    if (prevDccPreviewKey === undefined) delete process.env.DCC_WTA_AFFILIATE_PREVIEW_API_KEY;
    else process.env.DCC_WTA_AFFILIATE_PREVIEW_API_KEY = prevDccPreviewKey;
    if (prevOrderSecret === undefined) delete process.env.ORDER_SIGNING_SECRET;
    else process.env.ORDER_SIGNING_SECRET = prevOrderSecret;
  }
});

test("WTA containment invariants: zero consolidation redirects, 503 checkout guard when FH_BOOKINGS_ENABLED unset, and all 156 sitemap URLs intact", async () => {
  const repoRoot = process.cwd();

  // 1. No proxy.ts or middleware.ts consolidation redirector
  assert.equal(fs.existsSync(path.join(repoRoot, "proxy.ts")), false, "proxy.ts must not exist");
  assert.equal(fs.existsSync(path.join(repoRoot, "app", "proxy.ts")), false, "app/proxy.ts must not exist");
  assert.equal(fs.existsSync(path.join(repoRoot, "middleware.ts")), false, "middleware.ts must not exist");

  // 2. next.config.ts only has internal /home and /contact redirects, zero external consolidation redirects
  const redirects = nextConfig.redirects ? await nextConfig.redirects() : [];
  assert.equal(redirects.length, 2);
  for (const rule of redirects) {
    assert.equal(rule.destination.startsWith("/"), true, `Redirect destination must stay internal: ${rule.destination}`);
    assert.equal(rule.destination.includes("destinationcommandcenter"), false);
    assert.equal(rule.destination.includes("juneauflightdeck"), false);
  }

  // 3. vercel.json has zero redirects/rewrites to external domains
  const vercelJsonRaw = fs.readFileSync(path.join(repoRoot, "vercel.json"), "utf8");
  const vercelConfig = JSON.parse(vercelJsonRaw) as Record<string, unknown>;
  assert.equal(vercelConfig.redirects, undefined);
  assert.equal(vercelConfig.rewrites, undefined);
  assert.equal(vercelJsonRaw.includes("destinationcommandcenter"), false);

  // 4. POST /api/stripe/create-intent returns 503 when FH_BOOKINGS_ENABLED is unset/disabled
  const prevFh = process.env.FH_BOOKINGS_ENABLED;
  try {
    delete process.env.FH_BOOKINGS_ENABLED;
    const req = new NextRequest("https://www.welcometoalaskatours.com/api/stripe/create-intent", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        contact: { name: "Test User", email: "test@example.com" },
        items: [{ company: "coastalhelicopters", itemPk: 1, availabilityPk: 2, ratePk: 3, qty: 1 }],
      }),
    });
    const res = await createIntentPost(req);
    assert.equal(res.status, 503);
    const body = (await res.json()) as Record<string, unknown>;
    assert.equal(body.code, "BOOKINGS_DISABLED");
  } finally {
    if (prevFh === undefined) delete process.env.FH_BOOKINGS_ENABLED;
    else process.env.FH_BOOKINGS_ENABLED = prevFh;
  }

  // 5. All public WTA sitemap URLs (63 static/editorial + snapshot tours >= 155) remain intact on welcometoalaskatours.com
  const prevIncrementalCache = (globalThis as Record<string, unknown>).__incrementalCache;
  const prevAppKey = process.env.FAREHARBOR_APP_KEY;
  const prevUserKey = process.env.FAREHARBOR_USER_KEY;
  const workUnitStorage = cjsRequire(
    "next/dist/server/app-render/work-unit-async-storage.external",
  ) as { workUnitAsyncStorage: AsyncLocalStorage<unknown> };
  const origRun = workUnitStorage.workUnitAsyncStorage.run;
  const realAls = new AsyncLocalStorage<unknown>();
  try {
    delete process.env.FAREHARBOR_APP_KEY;
    delete process.env.FAREHARBOR_USER_KEY;
    workUnitStorage.workUnitAsyncStorage.run = realAls.run.bind(realAls) as typeof origRun;
    (globalThis as Record<string, unknown>).__incrementalCache = {
      isOnDemandRevalidate: false,
      generateCacheKey: async (key: string) => key,
      get: async () => null,
      set: async () => {},
    };

    const { default: sitemap } = await import("../app/sitemap");
    const entries = await sitemap();
    assert.ok(entries.length >= 155, `Expected at least 155 offline snapshot sitemap URLs, got ${entries.length}`);
    for (const entry of entries) {
      assert.ok(
        entry.url.startsWith("https://www.welcometoalaskatours.com"),
        `Sitemap URL must remain on welcometoalaskatours.com, got: ${entry.url}`,
      );
      assert.equal(entry.url.includes("destinationcommandcenter"), false);
      assert.equal(entry.url.includes("juneauflightdeck"), false);
    }

    const urls = new Set(entries.map((e) => e.url));
    assert.equal(urls.has("https://www.welcometoalaskatours.com"), true);
    assert.equal(urls.has("https://www.welcometoalaskatours.com/ports/juneau"), true);
    assert.equal(urls.has("https://www.welcometoalaskatours.com/ports/ketchikan"), true);
    assert.equal(urls.has("https://www.welcometoalaskatours.com/ports/skagway"), true);
    assert.equal(urls.has("https://www.welcometoalaskatours.com/juneau/helicopter-tours"), true);
    assert.equal(urls.has("https://www.welcometoalaskatours.com/tours/coastalhelicopters/413056"), true);
  } finally {
    workUnitStorage.workUnitAsyncStorage.run = origRun;
    if (prevIncrementalCache === undefined) {
      delete (globalThis as Record<string, unknown>).__incrementalCache;
    } else {
      (globalThis as Record<string, unknown>).__incrementalCache = prevIncrementalCache;
    }
    if (prevAppKey === undefined) delete process.env.FAREHARBOR_APP_KEY;
    else process.env.FAREHARBOR_APP_KEY = prevAppKey;
    if (prevUserKey === undefined) delete process.env.FAREHARBOR_USER_KEY;
    else process.env.FAREHARBOR_USER_KEY = prevUserKey;
  }
});
