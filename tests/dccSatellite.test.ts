import test from "node:test";
import assert from "node:assert/strict";
import {
  buildParrPartnerForwardUrl,
  buildDccReturnUrl,
  emitDccSatelliteEvent,
  listRecentDccSatelliteCallbacks,
} from "@/lib/dccSatellite";
import {
  decodeHandoffPayload,
  encodeHandoffPayload,
  signDccHandoffPayload,
  verifyDccHandoffSignature,
} from "@/lib/dccHandoff";

test("payload decode round-trips the DCC handoff body", () => {
  const payload = encodeHandoffPayload({
    source: "dcc",
    version: "1",
    handoffId: "ho_payload_123",
    destination: { portSlug: "juneau" },
    traveler: { partySize: 3, cruiseDate: "2026-07-01" },
    intent: { category: "helicopter", date: "2026-07-01" },
    context: { referrerPath: "/alaska/juneau", authorityTopic: "shore-excursions" },
  });

  const decoded = decodeHandoffPayload(payload) as { handoffId?: string; destination?: { portSlug?: string } };
  assert.equal(decoded.handoffId, "ho_payload_123");
  assert.equal(decoded.destination?.portSlug, "juneau");
});

test("signature verification accepts valid sig and rejects invalid sig", () => {
  const payload = encodeHandoffPayload({
    source: "dcc",
    version: "1",
    handoffId: "ho_sig_123",
  });
  const secret = "sig-secret";
  const sig = signDccHandoffPayload(payload, secret);

  assert.equal(verifyDccHandoffSignature(payload, sig, secret), true);
  assert.equal(verifyDccHandoffSignature(payload, "bad-signature", secret), false);
});

test("buildDccReturnUrl appends tracking params to a valid DCC URL", () => {
  const url = buildDccReturnUrl("https://destinationcommandcenter.com/alaska", {
    handoff_id: "ho_123",
    satellite: "welcome-to-alaska",
    status: "booked",
  });

  assert.ok(url);
  assert.match(String(url), /handoff_id=ho_123/);
  assert.match(String(url), /satellite=welcome-to-alaska/);
  assert.match(String(url), /status=booked/);
});

test("buildParrPartnerForwardUrl preserves handoff and dcc return context", () => {
  const url = buildParrPartnerForwardUrl({
    handoffId: "ho_123",
    dccReturnUrl: "https://www.destinationcommandcenter.com/alaska?handoff_id=ho_123",
    sourcePage: "/checkout/success",
    eventDate: "2026-07-12",
  });

  assert.match(url, /partyatredrocks\.com/);
  assert.match(url, /dcc_handoff_id=ho_123/);
  assert.match(url, /source=dcc/);
  assert.match(url, /source_slug=wta-network-forward/);
  assert.match(url, /source_page=%2Fhandoff%2Fpartner%2Fpartyatredrocks/);
  assert.match(url, /topic=concert-transport/);
  assert.match(url, /venue=red-rocks-amphitheatre/);
  assert.match(url, /partner_satellite=welcome-to-alaska/);
  assert.match(url, /partner_reason=traveler_reuse/);
  assert.match(url, /partner_handoff_id=ho_123/);
  assert.match(url, /date=2026-07-12/);
  assert.match(url, /dcc_return=https%3A%2F%2Fwww\.destinationcommandcenter\.com%2Falaska/);
});

test("emitDccSatelliteEvent uses default DCC callback URL when no override is configured", async () => {
  const previous = process.env.DCC_CALLBACK_URL;
  const previousToken = process.env.DCC_WTA_WEBHOOK_TOKEN;
  const previousEnabled = process.env.DCC_CALLBACKS_ENABLED;
  const originalFetch = global.fetch;
  delete process.env.DCC_CALLBACK_URL;
  delete process.env.DCC_SATELLITE_EVENTS_URL;
  delete process.env.DCC_WTA_WEBHOOK_URL;
  process.env.DCC_WTA_WEBHOOK_TOKEN = "test-token";
  delete process.env.DCC_CALLBACKS_ENABLED;

  let called = false;
  global.fetch = (async (input: string | URL | Request, init?: RequestInit) => {
    called = true;
    assert.equal(String(input), "https://www.destinationcommandcenter.com/api/internal/satellite-handoffs/events");
    assert.equal((init?.headers as Record<string, string>)["x-dcc-satellite-token"], "test-token");
    return new Response(JSON.stringify({ ok: true }), { status: 200 });
  }) as typeof fetch;

  const handoffId = `test_skip_${Date.now()}`;
  const row = await emitDccSatelliteEvent({
    handoffId,
    satelliteId: "welcome-to-alaska",
    eventType: "lead_captured",
    externalReference: "ord_test_skip",
  });

  assert.equal(row.handoffId, handoffId);
  assert.equal(called, true);
  assert.equal(row.skipped, false);
  assert.equal(row.ok, true);
  assert.equal(row.endpoint, "https://www.destinationcommandcenter.com/api/internal/satellite-handoffs/events");

  const recent = await listRecentDccSatelliteCallbacks(10);
  assert.ok(recent.some((entry) => entry.auditId === row.auditId));

  global.fetch = originalFetch;
  if (previous) process.env.DCC_CALLBACK_URL = previous;
  else delete process.env.DCC_CALLBACK_URL;
  if (previousToken) process.env.DCC_WTA_WEBHOOK_TOKEN = previousToken;
  else delete process.env.DCC_WTA_WEBHOOK_TOKEN;
  if (previousEnabled) process.env.DCC_CALLBACKS_ENABLED = previousEnabled;
  else delete process.env.DCC_CALLBACKS_ENABLED;
});

test("emitDccSatelliteEvent posts to DCC when endpoint is configured", async () => {
  const previousEndpoint = process.env.DCC_CALLBACK_URL;
  const previousToken = process.env.DCC_WTA_WEBHOOK_TOKEN;
  const previousEnabled = process.env.DCC_CALLBACKS_ENABLED;
  const originalFetch = global.fetch;
  let body: Record<string, unknown> | null = null;

  process.env.DCC_CALLBACK_URL = "https://destinationcommandcenter.com/api/internal/satellite-handoffs/events";
  process.env.DCC_WTA_WEBHOOK_TOKEN = "test-token";
  delete process.env.DCC_CALLBACKS_ENABLED;

  let called = false;
  global.fetch = (async (input: string | URL | Request, init?: RequestInit) => {
    called = true;
    assert.equal(String(input), process.env.DCC_CALLBACK_URL);
    assert.equal(init?.method, "POST");
    assert.equal((init?.headers as Record<string, string>)["x-dcc-satellite-token"], "test-token");
    body = JSON.parse(String(init?.body || "{}")) as Record<string, unknown>;
    return new Response(JSON.stringify({ ok: true }), { status: 200 });
  }) as typeof fetch;

  const row = await emitDccSatelliteEvent({
    handoffId: `test_send_${Date.now()}`,
    satelliteId: "welcome-to-alaska",
    eventType: "booking_completed",
    externalReference: "ord_test_send",
    attribution: {
      sourcePage: "/ports/juneau",
      sourceSlug: "ignored-manual-value",
      topicSlug: "shore-excursions",
    },
    booking: {
      portSlug: "juneau",
      productSlug: "juneau-helicopter-glacier-tour",
      eventDate: "2026-07-12",
      amount: 899,
      currency: "usd",
    },
    metadata: {
      embedDomain: "juneauadventuretours.com",
      embedPath: "/helicopter-tours",
      widgetPlacement: "sidebar",
      widgetId: "wta-juneau-1",
    },
  });

  assert.equal(called, true);
  assert.equal(row.ok, true);
  assert.equal(row.skipped, false);
  assert.equal(row.responseStatus, 200);
  assert.ok(body);
  assert.equal(body?.satelliteId, "welcome-to-alaska");
  assert.equal(body?.eventType, "booking_completed");
  assert.equal(body?.externalReference, "ord_test_send");
  assert.equal(body?.source, "wta");
  assert.equal(typeof body?.occurredAt, "string");
  assert.equal((body?.booking as Record<string, unknown>)?.portSlug, "juneau-alaska");
  assert.equal((body?.booking as Record<string, unknown>)?.productSlug, "juneau-helicopter-glacier-tour");
  assert.equal((body?.booking as Record<string, unknown>)?.currency, "USD");
  assert.equal((body?.attribution as Record<string, unknown>)?.sourceSlug, "ignored-manual-value");
  assert.equal((body?.metadata as Record<string, unknown>)?.embedDomain, "juneauadventuretours.com");
  assert.equal((body?.metadata as Record<string, unknown>)?.widgetId, "wta-juneau-1");

  global.fetch = originalFetch;
  if (previousEndpoint) process.env.DCC_CALLBACK_URL = previousEndpoint;
  else delete process.env.DCC_CALLBACK_URL;
  if (previousToken) process.env.DCC_WTA_WEBHOOK_TOKEN = previousToken;
  else delete process.env.DCC_WTA_WEBHOOK_TOKEN;
  if (previousEnabled) process.env.DCC_CALLBACKS_ENABLED = previousEnabled;
  else delete process.env.DCC_CALLBACKS_ENABLED;
});

test("emitDccSatelliteEvent preserves widget handoffId and callback payload shape", async () => {
  const previousEndpoint = process.env.DCC_CALLBACK_URL;
  const previousToken = process.env.DCC_WTA_WEBHOOK_TOKEN;
  const previousEnabled = process.env.DCC_CALLBACKS_ENABLED;
  const originalFetch = global.fetch;
  let body: Record<string, unknown> | null = null;

  process.env.DCC_CALLBACK_URL = "https://destinationcommandcenter.com/api/internal/satellite-handoffs/events";
  process.env.DCC_WTA_WEBHOOK_TOKEN = "test-token";
  delete process.env.DCC_CALLBACKS_ENABLED;

  global.fetch = (async (_input: string | URL | Request, init?: RequestInit) => {
    body = JSON.parse(String(init?.body || "{}")) as Record<string, unknown>;
    return new Response(JSON.stringify({ ok: true }), { status: 200 });
  }) as typeof fetch;

  const handoffId = "ho_widget_123";
  const row = await emitDccSatelliteEvent({
    handoffId,
    satelliteId: "welcome-to-alaska",
    eventType: "booking_completed",
    sourcePath: "/widget/checkout/success",
    externalReference: "ord_widget_123",
    status: "booked",
    stage: "confirmed",
    attribution: {
      sourceSlug: "dcc-cruises-port",
      sourcePage: "/cruises/port/juneau-alaska",
      topicSlug: "shore-excursions",
    },
    booking: {
      portSlug: "juneau",
      productSlug: "juneau-helicopter-glacier-tour",
      eventDate: "2026-07-12",
      quantity: 4,
      amount: 899,
      currency: "usd",
    },
    metadata: {
      embedDomain: "friendsite.com",
      embedPath: "/alaska-excursions",
      widgetPlacement: "sidebar",
      widgetId: "wta-juneau-1",
    },
  });

  assert.equal(row.ok, true);
  assert.equal(row.handoffId, handoffId);
  assert.equal((body?.handoffId as string), handoffId);
  assert.equal((body?.source as string), "wta");
  assert.equal((body?.sourcePath as string), "/widget/checkout/success");
  assert.equal((body?.booking as Record<string, unknown>)?.quantity, 4);
  assert.equal((body?.metadata as Record<string, unknown>)?.embedPath, "/alaska-excursions");

  global.fetch = originalFetch;
  if (previousEndpoint) process.env.DCC_CALLBACK_URL = previousEndpoint;
  else delete process.env.DCC_CALLBACK_URL;
  if (previousToken) process.env.DCC_WTA_WEBHOOK_TOKEN = previousToken;
  else delete process.env.DCC_WTA_WEBHOOK_TOKEN;
  if (previousEnabled) process.env.DCC_CALLBACKS_ENABLED = previousEnabled;
  else delete process.env.DCC_CALLBACKS_ENABLED;
});

test("emitDccSatelliteEvent records a skipped audit row while live callbacks are disabled", async () => {
  const previousEndpoint = process.env.DCC_CALLBACK_URL;
  const previousEnabled = process.env.DCC_CALLBACKS_ENABLED;

  process.env.DCC_CALLBACK_URL = "https://www.destinationcommandcenter.com/api/internal/satellite-handoffs/events";
  process.env.DCC_CALLBACKS_ENABLED = "false";

  const row = await emitDccSatelliteEvent({
    handoffId: `test_disabled_${Date.now()}`,
    satelliteId: "welcome-to-alaska",
    eventType: "lead_captured",
  });

  assert.equal(row.skipped, true);
  assert.equal(row.error, "dcc_callbacks_disabled");
  assert.equal(row.endpoint, "https://www.destinationcommandcenter.com/api/internal/satellite-handoffs/events");

  if (previousEndpoint) process.env.DCC_CALLBACK_URL = previousEndpoint;
  else delete process.env.DCC_CALLBACK_URL;
  if (previousEnabled) process.env.DCC_CALLBACKS_ENABLED = previousEnabled;
  else delete process.env.DCC_CALLBACKS_ENABLED;
});

test("emitDccSatelliteEvent preserves partner object for cross-network forwards", async () => {
  const previousEndpoint = process.env.DCC_CALLBACK_URL;
  const previousToken = process.env.DCC_WTA_WEBHOOK_TOKEN;
  const previousEnabled = process.env.DCC_CALLBACKS_ENABLED;
  const originalFetch = global.fetch;
  let body: Record<string, unknown> | null = null;

  process.env.DCC_CALLBACK_URL = "https://www.destinationcommandcenter.com/api/internal/satellite-handoffs/events";
  process.env.DCC_WTA_WEBHOOK_TOKEN = "test-token";
  delete process.env.DCC_CALLBACKS_ENABLED;

  global.fetch = (async (_input: string | URL | Request, init?: RequestInit) => {
    body = JSON.parse(String(init?.body || "{}")) as Record<string, unknown>;
    return new Response(JSON.stringify({ ok: true }), { status: 200 });
  }) as typeof fetch;

  const row = await emitDccSatelliteEvent({
    handoffId: `test_partner_${Date.now()}`,
    satelliteId: "welcome-to-alaska",
    eventType: "forwarded_to_partner",
    partner: {
      fromSite: "welcome-to-alaska",
      toSite: "partyatredrocks",
      partnerHandoffId: "ho_123",
      reason: "traveler_reuse",
    },
  });

  assert.equal(row.ok, true);
  assert.equal((body?.partner as Record<string, unknown>)?.fromSite, "welcome-to-alaska");
  assert.equal((body?.partner as Record<string, unknown>)?.toSite, "partyatredrocks");
  assert.equal((body?.partner as Record<string, unknown>)?.partnerHandoffId, "ho_123");
  assert.equal((body?.partner as Record<string, unknown>)?.reason, "traveler_reuse");

  global.fetch = originalFetch;
  if (previousEndpoint) process.env.DCC_CALLBACK_URL = previousEndpoint;
  else delete process.env.DCC_CALLBACK_URL;
  if (previousToken) process.env.DCC_WTA_WEBHOOK_TOKEN = previousToken;
  else delete process.env.DCC_WTA_WEBHOOK_TOKEN;
  if (previousEnabled) process.env.DCC_CALLBACKS_ENABLED = previousEnabled;
  else delete process.env.DCC_CALLBACKS_ENABLED;
});
