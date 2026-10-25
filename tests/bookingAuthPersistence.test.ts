import test from "node:test";
import assert from "node:assert/strict";
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { NextRequest } from "next/server";

import {
  resolveExactDeparturePrice,
  setFareHarborDateFetchForTests,
} from "../lib/fareharborAvailability";
import {
  isAdminCookieValue,
  makeAdminCookieValue,
  ADMIN_COOKIE,
} from "../lib/admin";
import {
  checkBookingCapabilityReadiness,
  setFareHarborBookingHandlerForTests,
} from "../lib/fareharbor";
import { setDurableKVOverrideForTests, type KV } from "../lib/kv";
import { setStripeClientForTests } from "../lib/stripe";
import {
  getVisibility,
  deleteIsolatedTestVisibilityRecord,
} from "../lib/visibilityStore";

import { GET as priceGET } from "../app/api/fareharbor/price/route";
import { POST as createIntentPOST } from "../app/api/stripe/create-intent/route";
import { POST as webhookPOST } from "../app/api/stripe/webhook/route";
import { POST as finalizePOST } from "../app/api/stripe/finalize/route";
import { GET as receiptGET } from "../app/api/receipt/route";
import { POST as adminLoginPOST } from "../app/api/admin/login/route";
import { GET as widgetCatalogGET } from "../app/api/admin/widget-catalog/route";
import { POST as visibilityPOST } from "../app/api/admin/visibility/route";
import { POST as providersPOST } from "../app/api/admin/providers/route";
import { GET as adminToursGET } from "../app/api/admin/tours/route";
import { GET as adminOrdersGET } from "../app/api/admin/orders/route";
import { POST as adminOrdersRetryPOST } from "../app/api/admin/orders/retry/route";

// Load .env.local credentials if present so live FareHarbor >90-days lookup can run
function loadEnvLocal() {
  const envPath = path.join(process.cwd(), ".env.local");
  if (!fs.existsSync(envPath)) return;
  const raw = fs.readFileSync(envPath, "utf8");
  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq <= 0) continue;
    const key = trimmed.slice(0, eq).trim();
    let val = trimmed.slice(eq + 1).trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    val = val.replace(/\\n$/g, "").trim();
    if (!process.env[key]) {
      process.env[key] = val;
    }
  }
}

loadEnvLocal();

test("1a. Exact departure pricing resolves a live FareHarbor departure more than 90 days away (2027-06-15)", async () => {
  setFareHarborDateFetchForTests(null);

  // 2027-06-15 is >230 days away from 2026-10-25 (well beyond the old 90-day window).
  // Furthermore, FareHarbor uses a negative availability PK (-5352426) for unmaterialized future schedule departures.
  const req = new Request(
    "http://localhost:3000/api/fareharbor/price?company=beyondak&item_pk=195602&date=2027-06-15&availability_pk=-5352426&customer_type_rate_pk=9150964743&qty=2",
  );
  const res = await priceGET(req);
  const body = await res.json();

  assert.equal(res.status, 200, `Expected 200 OK from live FareHarbor lookup, got ${res.status}: ${JSON.stringify(body)}`);
  assert.equal(body.success, true);
  assert.equal(body.company, "beyondak");
  assert.equal(body.itemPk, 195602);
  assert.equal(body.availabilityPk, -5352426);
  assert.equal(body.customerTypeRatePk, 9150964743);
  assert.equal(body.date, "2027-06-15");
  assert.equal(body.unitCents, 20900);
  assert.equal(body.lineTotalCents, 41800);
  assert.equal(body.exactRateMatched, true);
});

test("1b. Exact departure pricing handles changed prices, sold-out departures, and invalid/mismatched products or departures without fallback", async () => {
  const sampleDatePayload = {
    availabilities: [
      {
        pk: 777001,
        start_at: "2027-07-20T09:00:00-0800",
        capacity: 8,
        item: { pk: 195602 },
        customer_type_rates: [
          {
            pk: 888001,
            capacity: 8,
            customer_prototype: { total: 24500 },
          },
          {
            pk: 888002,
            capacity: 0,
            customer_prototype: { total: 19500 },
          },
        ],
      },
      {
        pk: 777002,
        start_at: "2027-07-20T13:30:00-0800",
        capacity: 0,
        item: { pk: 195602 },
        customer_type_rates: [
          {
            pk: 888003,
            capacity: 0,
            customer_prototype: { total: 15000 },
          },
        ],
      },
    ],
  };

  setFareHarborDateFetchForTests(async ({ company, itemPk, date }) => {
    if (company !== "beyondak" || itemPk !== 195602) {
      return { status: 404, ok: false, bodyText: JSON.stringify({ error: "Not found" }) };
    }
    if (date !== "2027-07-20") {
      return { status: 200, ok: true, bodyText: JSON.stringify({ availabilities: [] }) };
    }
    return {
      status: 200,
      ok: true,
      bodyText: JSON.stringify(sampleDatePayload),
    };
  });

  try {
    // (1) Changed price: cached/expected was 20900 ($209), live provider price is 24500 ($245).
    // Must return live price 24500 and flag priceChanged=true, never using cached 20900 or cheaper rate 888002/888003.
    const changedRes = await priceGET(
      new Request(
        "http://localhost:3000/api/fareharbor/price?company=beyondak&item_pk=195602&date=2027-07-20&availability_pk=777001&customer_type_rate_pk=888001&qty=2&expected_unit_cents=20900",
      ),
    );
    const changedBody = await changedRes.json();
    assert.equal(changedRes.status, 200);
    assert.equal(changedBody.unitCents, 24500);
    assert.equal(changedBody.lineTotalCents, 49000);
    assert.equal(changedBody.expectedUnitCents, 20900);
    assert.equal(changedBody.priceChanged, true);

    // (2) Sold-out departure (pk=777002 has capacity=0, even though 777001 on the same day has capacity=8)
    const soldOutAvailRes = await priceGET(
      new Request(
        "http://localhost:3000/api/fareharbor/price?company=beyondak&item_pk=195602&date=2027-07-20&availability_pk=777002&customer_type_rate_pk=888003&qty=1",
      ),
    );
    const soldOutAvailBody = await soldOutAvailRes.json();
    assert.equal(soldOutAvailRes.status, 409);
    assert.equal(soldOutAvailBody.success, false);
    assert.equal(soldOutAvailBody.code, "departure_sold_out");

    // (3) Sold-out rate on an otherwise available departure (rate 888002 has capacity=0)
    const soldOutRateRes = await priceGET(
      new Request(
        "http://localhost:3000/api/fareharbor/price?company=beyondak&item_pk=195602&date=2027-07-20&availability_pk=777001&customer_type_rate_pk=888002&qty=1",
      ),
    );
    const soldOutRateBody = await soldOutRateRes.json();
    assert.equal(soldOutRateRes.status, 409);
    assert.equal(soldOutRateBody.code, "departure_sold_out");

    // (4) Insufficient capacity (departure has capacity 8, requesting qty 10)
    const insufficientRes = await priceGET(
      new Request(
        "http://localhost:3000/api/fareharbor/price?company=beyondak&item_pk=195602&date=2027-07-20&availability_pk=777001&customer_type_rate_pk=888001&qty=10",
      ),
    );
    const insufficientBody = await insufficientRes.json();
    assert.equal(insufficientRes.status, 409);
    assert.equal(insufficientBody.code, "insufficient_capacity");

    // (5) Mismatched departure PK on valid date -> must NOT fall back to 777001 or min price
    const wrongAvailRes = await priceGET(
      new Request(
        "http://localhost:3000/api/fareharbor/price?company=beyondak&item_pk=195602&date=2027-07-20&availability_pk=999999&customer_type_rate_pk=888001&qty=1",
      ),
    );
    const wrongAvailBody = await wrongAvailRes.json();
    assert.equal(wrongAvailRes.status, 409);
    assert.equal(wrongAvailBody.code, "departure_mismatch");

    // (6) Mismatched rate PK on valid departure -> must NOT fall back to another rate
    const wrongRateRes = await priceGET(
      new Request(
        "http://localhost:3000/api/fareharbor/price?company=beyondak&item_pk=195602&date=2027-07-20&availability_pk=777001&customer_type_rate_pk=999999&qty=1",
      ),
    );
    const wrongRateBody = await wrongRateRes.json();
    assert.equal(wrongRateRes.status, 409);
    assert.equal(wrongRateBody.code, "rate_mismatch");

    // (7) Mismatched startAt time for departure 777001 (09:00 vs 13:30)
    const wrongTimeRes = await resolveExactDeparturePrice({
      company: "beyondak",
      itemPk: 195602,
      availabilityPk: 777001,
      customerTypeRatePk: 888001,
      date: "2027-07-20",
      startAt: "2027-07-20T13:30:00-0800",
      qty: 1,
    });
    assert.equal(wrongTimeRes.ok, false);
    if (!wrongTimeRes.ok) {
      assert.equal(wrongTimeRes.status, 409);
      assert.equal(wrongTimeRes.code, "departure_mismatch");
    }

    // (8) Invalid / mismatched product (wrong itemPk)
    const wrongProductRes = await priceGET(
      new Request(
        "http://localhost:3000/api/fareharbor/price?company=beyondak&item_pk=999999&date=2027-07-20&availability_pk=777001&customer_type_rate_pk=888001&qty=1",
      ),
    );
    const wrongProductBody = await wrongProductRes.json();
    assert.equal(wrongProductRes.status, 409);
    assert.equal(wrongProductBody.code, "product_mismatch");

    // (9) Missing departure date
    const missingDateRes = await priceGET(
      new Request(
        "http://localhost:3000/api/fareharbor/price?company=beyondak&item_pk=195602&availability_pk=777001&customer_type_rate_pk=888001&qty=1",
      ),
    );
    const missingDateBody = await missingDateRes.json();
    assert.equal(missingDateRes.status, 400);
    assert.equal(missingDateBody.code, "missing_departure_date");
  } finally {
    setFareHarborDateFetchForTests(null);
  }
});

test("2. Pre-payment booking capability detection and end-to-end payment, booking, duplicate webhook, failure queue, and retry in test environment", async () => {
  const prevFhEnabled = process.env.FH_BOOKINGS_ENABLED;
  const prevUseLocalKv = process.env.USE_LOCAL_KV;
  const prevWhSecret = process.env.STRIPE_WEBHOOK_SECRET;
  const prevAdminPassword = process.env.ADMIN_PASSWORD;
  const prevTurnstileSecret = process.env.TURNSTILE_SECRET_KEY;

  process.env.USE_LOCAL_KV = "true";
  process.env.STRIPE_WEBHOOK_SECRET = "whsec_test_local_secret";
  process.env.ADMIN_PASSWORD = "test-strong-admin-password-2026";
  delete process.env.TURNSTILE_SECRET_KEY;

  let stripeCreateCalls = 0;
  const createdIntents = new Map<string, any>();

  const mockStripe: any = {
    paymentIntents: {
      async create(params: any) {
        stripeCreateCalls += 1;
        const id = `pi_test_${stripeCreateCalls}_${Date.now()}`;
        const pi = {
          id,
          client_secret: `${id}_secret_mock`,
          amount: params.amount,
          currency: params.currency,
          status: "requires_payment_method",
          metadata: params.metadata || {},
        };
        createdIntents.set(id, pi);
        return pi;
      },
      async retrieve(id: string) {
        return createdIntents.get(id) || null;
      },
    },
    webhooks: {
      constructEvent(rawBody: string, sig: string, secret: string) {
        if (sig !== `valid_sig:${secret}`) {
          throw new Error("Invalid stripe signature");
        }
        return JSON.parse(rawBody);
      },
    },
  };

  setStripeClientForTests(mockStripe);

  setFareHarborDateFetchForTests(async () => ({
    status: 200,
    ok: true,
    bodyText: JSON.stringify({
      availabilities: [
        {
          pk: -5352426,
          start_at: "2027-06-15T11:00:00-0800",
          capacity: 6,
          item: { pk: 195602 },
          customer_type_rates: [
            {
              pk: 9150964743,
              capacity: 6,
              customer_prototype: { total: 20900 },
            },
          ],
        },
      ],
    }),
  }));

  try {
    // 2a. When FH_BOOKINGS_ENABLED=0 (like production), POST /api/stripe/create-intent MUST reject BEFORE creating a PaymentIntent
    process.env.FH_BOOKINGS_ENABLED = "0";
    const readinessDisabled = checkBookingCapabilityReadiness();
    assert.equal(readinessDisabled.ok, false);

    const disabledReq = new NextRequest("http://localhost:3000/api/stripe/create-intent", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        contact: { name: "Jane Traveler", email: "jane@example.com", phone: "555-0100" },
        items: [
          {
            company: "beyondak",
            itemPk: 195602,
            availabilityPk: -5352426,
            ratePk: 9150964743,
            day: "2027-06-15",
            startAt: "2027-06-15T11:00:00-0800",
            qty: 2,
          },
        ],
      }),
    });
    const disabledRes = await createIntentPOST(disabledReq);
    const disabledBody = await disabledRes.json();
    assert.equal(disabledRes.status, 503);
    assert.equal(disabledBody.success, false);
    assert.equal(disabledBody.code, "bookings_disabled");
    assert.equal(stripeCreateCalls, 0, "Must not create a Stripe PaymentIntent when booking capability is disabled");

    // 2b. Enable bookings in the local test environment and verify full payment -> reservation -> duplicate webhook idempotency
    process.env.FH_BOOKINGS_ENABLED = "1";
    let fhBookingCalls = 0;
    let shouldFailFareHarbor = false;

    setFareHarborBookingHandlerForTests(async ({ company, availabilityPk, ratePk, qty }) => {
      fhBookingCalls += 1;
      if (shouldFailFareHarbor) {
        throw new Error("FareHarbor HTTP 502: Simulated operator reservation failure");
      }
      return {
        booking: {
          pk: 900100 + fhBookingCalls,
          uuid: `fh-uuid-${company}-${availabilityPk}-${ratePk}-${qty}`,
          status: "booked",
        },
      };
    });

    const createReq1 = new NextRequest("http://localhost:3000/api/stripe/create-intent", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        contact: { name: "Jane Traveler", email: "jane@example.com", phone: "555-0100" },
        items: [
          {
            company: "beyondak",
            itemPk: 195602,
            availabilityPk: -5352426,
            ratePk: 9150964743,
            day: "2027-06-15",
            startAt: "2027-06-15T11:00:00-0800",
            qty: 2,
            title: "Mendenhall Glacier Guided Hike",
            widgetPlacement: "hotel-homepage",
            embedDomain: "https://insidepassagelodge.example.com/concierge",
          },
        ],
      }),
    });
    const createRes1 = await createIntentPOST(createReq1);
    const createBody1 = await createRes1.json();
    assert.equal(createRes1.status, 200);
    assert.equal(createBody1.success, true);
    assert.equal(createBody1.totalCents, 41800);
    assert.equal(stripeCreateCalls, 1);

    const piId1 = createBody1.payment_intent_id as string;
    const orderId1 = createBody1.order_id as string;
    createdIntents.get(piId1).status = "succeeded";

    // Deliver payment_intent.succeeded webhook
    const webhookEventPayload1 = JSON.stringify({
      id: "evt_test_1",
      type: "payment_intent.succeeded",
      data: {
        object: createdIntents.get(piId1),
      },
    });
    const whRes1 = await webhookPOST(
      new Request("http://localhost:3000/api/stripe/webhook", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "stripe-signature": "valid_sig:whsec_test_local_secret",
        },
        body: webhookEventPayload1,
      }),
    );
    assert.equal(whRes1.status, 200);
    assert.equal(fhBookingCalls, 1, "Webhook should invoke FareHarbor booking exactly once");

    // Deliver DUPLICATE webhook and also call /api/stripe/finalize -> must be idempotent (no second FareHarbor booking)
    const whResDuplicate = await webhookPOST(
      new Request("http://localhost:3000/api/stripe/webhook", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "stripe-signature": "valid_sig:whsec_test_local_secret",
        },
        body: webhookEventPayload1,
      }),
    );
    assert.equal(whResDuplicate.status, 200);
    assert.equal(fhBookingCalls, 1, "Duplicate webhook must not create a duplicate FareHarbor reservation");

    const finRes1 = await finalizePOST(
      new Request("http://localhost:3000/api/stripe/finalize", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ payment_intent_id: piId1 }),
      }),
    );
    const finBody1 = await finRes1.json();
    assert.equal(finRes1.status, 200);
    assert.equal(finBody1.status, "booked");
    assert.equal(fhBookingCalls, 1, "Finalize after webhook must not create a duplicate FareHarbor reservation");

    // Verify customer receipt shows booked status
    const receiptRes1 = await receiptGET(
      new NextRequest(`http://localhost:3000/api/receipt?pi=${encodeURIComponent(piId1)}`),
    );
    const receiptBody1 = await receiptRes1.json();
    assert.equal(receiptBody1.success, true);
    assert.equal(receiptBody1.status, "booked");
    assert.equal(receiptBody1.order_id, orderId1);

    // 2c. Simulate provider failure after payment -> verify customer gets booking_failed status,
    // order lands in actionable internal queue (needs_attention), and admin retry recovers it.
    shouldFailFareHarbor = true;

    const createReq2 = new NextRequest("http://localhost:3000/api/stripe/create-intent", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        contact: { name: "Alex FailureTest", email: "alex@example.com", phone: "555-0199" },
        items: [
          {
            company: "beyondak",
            itemPk: 195602,
            availabilityPk: -5352426,
            ratePk: 9150964743,
            day: "2027-06-15",
            startAt: "2027-06-15T11:00:00-0800",
            qty: 1,
            title: "Mendenhall Glacier Guided Hike",
          },
        ],
      }),
    });
    const createRes2 = await createIntentPOST(createReq2);
    const createBody2 = await createRes2.json();
    assert.equal(createRes2.status, 200);

    const piId2 = createBody2.payment_intent_id as string;
    const orderId2 = createBody2.order_id as string;
    createdIntents.get(piId2).status = "succeeded";

    const whRes2 = await webhookPOST(
      new Request("http://localhost:3000/api/stripe/webhook", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "stripe-signature": "valid_sig:whsec_test_local_secret",
        },
        body: JSON.stringify({
          id: "evt_test_2",
          type: "payment_intent.succeeded",
          data: { object: createdIntents.get(piId2) },
        }),
      }),
    );
    assert.equal(whRes2.status, 200);
    assert.equal(fhBookingCalls, 2);

    // Customer receipt must accurately report booking_failed (never claiming a confirmed operator reservation)
    const receiptRes2 = await receiptGET(
      new NextRequest(`http://localhost:3000/api/receipt?pi=${encodeURIComponent(piId2)}`),
    );
    const receiptBody2 = await receiptRes2.json();
    assert.equal(receiptBody2.success, true);
    assert.equal(receiptBody2.status, "booking_failed");
    assert.match(String(receiptBody2.lastError || ""), /Simulated operator reservation failure/);

    // Verify failed order is queued in internal admin queue (GET /api/admin/orders?scope=needs_attention)
    const adminCookie = makeAdminCookieValue();
    assert.ok(adminCookie);
    const cookieHeader = `${ADMIN_COOKIE}=${adminCookie}`;

    const queueRes = await adminOrdersGET(
      new NextRequest("http://localhost:3000/api/admin/orders?scope=needs_attention", {
        headers: { cookie: cookieHeader },
      }),
    );
    const queueBody = await queueRes.json();
    assert.equal(queueRes.status, 200);
    assert.equal(queueBody.success, true);
    const queuedFailedOrder = (queueBody.orders || []).find(
      (o: any) => o.order_id === orderId2,
    );
    assert.ok(queuedFailedOrder, "Failed booking order must appear in needs_attention queue");
    assert.equal(queuedFailedOrder.status, "booking_failed");

    // Provider recovers -> Admin triggers POST /api/admin/orders/retry
    shouldFailFareHarbor = false;
    const retryRes = await adminOrdersRetryPOST(
      new NextRequest("http://localhost:3000/api/admin/orders/retry", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          cookie: cookieHeader,
        },
        body: JSON.stringify({ order_id: orderId2 }),
      }),
    );
    const retryBody = await retryRes.json();
    assert.equal(retryRes.status, 200);
    assert.equal(retryBody.success, true);
    assert.equal(retryBody.status, "booked");
    assert.equal(fhBookingCalls, 3);

    // Customer receipt now reflects booked status
    const receiptRes2After = await receiptGET(
      new NextRequest(`http://localhost:3000/api/receipt?pi=${encodeURIComponent(piId2)}`),
    );
    const receiptBody2After = await receiptRes2After.json();
    assert.equal(receiptBody2After.status, "booked");
  } finally {
    setStripeClientForTests(null);
    setFareHarborBookingHandlerForTests(null);
    setFareHarborDateFetchForTests(null);
    if (prevFhEnabled === undefined) delete process.env.FH_BOOKINGS_ENABLED;
    else process.env.FH_BOOKINGS_ENABLED = prevFhEnabled;
    if (prevUseLocalKv === undefined) delete process.env.USE_LOCAL_KV;
    else process.env.USE_LOCAL_KV = prevUseLocalKv;
    if (prevWhSecret === undefined) delete process.env.STRIPE_WEBHOOK_SECRET;
    else process.env.STRIPE_WEBHOOK_SECRET = prevWhSecret;
    if (prevAdminPassword === undefined) delete process.env.ADMIN_PASSWORD;
    else process.env.ADMIN_PASSWORD = prevAdminPassword;
    if (prevTurnstileSecret !== undefined) process.env.TURNSTILE_SECRET_KEY = prevTurnstileSecret;
  }
});

test("3. Owner authentication fails closed when unconfigured, rejects empty-secret/invalid/expired cookies, and protects all owner endpoints", async () => {
  const prevAdminPassword = process.env.ADMIN_PASSWORD;
  const prevOrderSecret = process.env.ORDER_SIGNING_SECRET;

  try {
    // 3a. Missing / empty / placeholder ADMIN_PASSWORD fails closed
    delete process.env.ORDER_SIGNING_SECRET;
    for (const badPw of ["", "   ", "replace_me", "changeme"]) {
      process.env.ADMIN_PASSWORD = badPw;
      assert.throws(() => makeAdminCookieValue());

      const ts = String(Date.now());
      const emptySecretSig = crypto.createHmac("sha256", "").update(ts).digest("hex");
      const forgedEmptyCookie = `${ts}.${emptySecretSig}`;
      assert.equal(
        isAdminCookieValue(forgedEmptyCookie),
        false,
        `Cookie signed with empty secret must be rejected when ADMIN_PASSWORD="${badPw}"`,
      );

      const loginRes = await adminLoginPOST(
        new NextRequest("http://localhost:3000/api/admin/login", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ password: badPw }),
        }),
      );
      assert.equal(loginRes.status, 503);
    }

    // 3b. Valid ADMIN_PASSWORD configured, but ORDER_SIGNING_SECRET unset (like Vercel Production)
    process.env.ADMIN_PASSWORD = "owner-prod-password-verified-99";
    delete process.env.ORDER_SIGNING_SECRET;

    const now = Date.now();
    const emptySig = crypto.createHmac("sha256", "").update(String(now)).digest("hex");
    const emptySecretCookie = `${now}.${emptySig}`;
    assert.equal(
      isAdminCookieValue(emptySecretCookie, now),
      false,
      "Cookie signed with empty secret must be rejected even when ORDER_SIGNING_SECRET is unset",
    );

    // Valid cookie works within TTL
    const validCookie = makeAdminCookieValue(now);
    assert.ok(validCookie);
    assert.equal(isAdminCookieValue(validCookie, now + 60_000), true);

    // Expired cookie (>8 hours old) is rejected
    const nineHoursLater = now + 9 * 60 * 60 * 1000;
    assert.equal(
      isAdminCookieValue(validCookie, nineHoursLater),
      false,
      "Expired admin cookie (>8h) must be rejected",
    );

    // Future-dated cookie beyond clock skew (>5m in future) is rejected
    const futureCookie = makeAdminCookieValue(now + 10 * 60 * 1000);
    assert.equal(
      isAdminCookieValue(futureCookie, now),
      false,
      "Future-dated cookie beyond skew must be rejected",
    );

    // Tampered signature is rejected
    const tamperedCookie = `${validCookie.slice(0, -4)}abcd`;
    assert.equal(isAdminCookieValue(tamperedCookie, now), false);

    // 3c. Verify all owner-only endpoints reject unauthenticated / empty-secret requests and accept normal login cookie
    const forgedHeader = `${ADMIN_COOKIE}=${emptySecretCookie}`;

    const unauthWidgetCatalog = await widgetCatalogGET(
      new NextRequest("http://localhost:3000/api/admin/widget-catalog", {
        headers: { cookie: forgedHeader },
      }),
    );
    assert.equal(unauthWidgetCatalog.status, 401);

    const unauthVisibility = await visibilityPOST(
      new NextRequest("http://localhost:3000/api/admin/visibility", {
        method: "POST",
        headers: { "content-type": "application/json", cookie: forgedHeader },
        body: JSON.stringify({ key: "__test_isolated__:99999999", hidden: true }),
      }),
    );
    assert.equal(unauthVisibility.status, 401);

    const unauthProviders = await providersPOST(
      new NextRequest("http://localhost:3000/api/admin/providers", {
        method: "POST",
        headers: { "content-type": "application/json", cookie: forgedHeader },
        body: JSON.stringify({ company: "__test_isolated__", hidden: true }),
      }),
    );
    assert.equal(unauthProviders.status, 401);

    const unauthTours = await adminToursGET(
      new NextRequest("http://localhost:3000/api/admin/tours", {
        headers: { cookie: forgedHeader },
      }),
    );
    assert.equal(unauthTours.status, 401);

    const unauthOrders = await adminOrdersGET(
      new NextRequest("http://localhost:3000/api/admin/orders", {
        headers: { cookie: forgedHeader },
      }),
    );
    assert.equal(unauthOrders.status, 401);

    const unauthRetry = await adminOrdersRetryPOST(
      new NextRequest("http://localhost:3000/api/admin/orders/retry", {
        method: "POST",
        headers: { "content-type": "application/json", cookie: forgedHeader },
        body: JSON.stringify({ order_id: "ord_123" }),
      }),
    );
    assert.equal(unauthRetry.status, 401);

    // Normal login via POST /api/admin/login issues a valid Set-Cookie header
    const wrongLogin = await adminLoginPOST(
      new NextRequest("http://localhost:3000/api/admin/login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ password: "wrong-password" }),
      }),
    );
    assert.equal(wrongLogin.status, 401);

    const okLogin = await adminLoginPOST(
      new NextRequest("http://localhost:3000/api/admin/login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ password: "owner-prod-password-verified-99" }),
      }),
    );
    assert.equal(okLogin.status, 200);
    const setCookieHeader = okLogin.headers.get("set-cookie") || "";
    const matchCookie = setCookieHeader.match(/wta_admin=([^;]+)/);
    assert.ok(matchCookie, "Login response must set wta_admin cookie");
    const issuedCookieHeader = `${ADMIN_COOKIE}=${matchCookie[1]}`;

    const authWidgetCatalog = await widgetCatalogGET(
      new NextRequest("http://localhost:3000/api/admin/widget-catalog", {
        headers: { cookie: issuedCookieHeader },
      }),
    );
    assert.equal(authWidgetCatalog.status, 200);
  } finally {
    if (prevAdminPassword === undefined) delete process.env.ADMIN_PASSWORD;
    else process.env.ADMIN_PASSWORD = prevAdminPassword;
    if (prevOrderSecret === undefined) delete process.env.ORDER_SIGNING_SECRET;
    else process.env.ORDER_SIGNING_SECRET = prevOrderSecret;
  }
});

test("4. Durable production updates fail with 503 when durable KV is unavailable and persist across separate invocations using an isolated test record", async () => {
  const prevAdminPassword = process.env.ADMIN_PASSWORD;
  process.env.ADMIN_PASSWORD = "owner-prod-password-verified-99";
  const adminCookieHeader = `${ADMIN_COOKIE}=${makeAdminCookieValue()}`;

  try {
    // 4a. Without durable KV configured, visibility/catalog/provider writes MUST NOT return success
    setDurableKVOverrideForTests(null);

    const noKvVisRes = await visibilityPOST(
      new NextRequest("http://localhost:3000/api/admin/visibility", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          cookie: adminCookieHeader,
        },
        body: JSON.stringify({
          key: "__test_isolated__:99999999",
          hidden: true,
        }),
      }),
    );
    const noKvVisBody = await noKvVisRes.json();
    assert.equal(noKvVisRes.status, 503);
    assert.equal(noKvVisBody.success, false);
    assert.equal(noKvVisBody.code, "durable_storage_unavailable");

    const noKvCatRes = await visibilityPOST(
      new NextRequest("http://localhost:3000/api/admin/visibility", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          cookie: adminCookieHeader,
        },
        body: JSON.stringify({
          key: "__test_isolated__:99999999",
          override: {
            fromPrice: "$199 Test",
          },
        }),
      }),
    );
    const noKvCatBody = await noKvCatRes.json();
    assert.equal(noKvCatRes.status, 503);
    assert.equal(noKvCatBody.success, false);
    assert.equal(noKvCatBody.code, "durable_storage_unavailable");

    const noKvProvRes = await providersPOST(
      new NextRequest("http://localhost:3000/api/admin/providers", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          cookie: adminCookieHeader,
        },
        body: JSON.stringify({
          company: "__test_isolated_provider__",
          hidden: true,
        }),
      }),
    );
    const noKvProvBody = await noKvProvRes.json();
    assert.equal(noKvProvRes.status, 503);
    assert.equal(noKvProvBody.success, false);
    assert.equal(noKvProvBody.code, "durable_storage_unavailable");

    // 4b. With durable KV configured, verify persistence across separate serverless invocations
    // using an isolated test record (__test_isolated__:99999999) without altering any real tour.
    const backingRedisMap = new Map<string, string>();
    const simulatedDurableKV: KV = {
      async get<T = unknown>(k: string): Promise<T | null> {
        const raw = backingRedisMap.get(k);
        return raw ? (JSON.parse(raw) as T) : null;
      },
      async set(k: string, v: unknown): Promise<void> {
        backingRedisMap.set(k, JSON.stringify(v));
      },
      async del(k: string): Promise<void> {
        backingRedisMap.delete(k);
      },
    };
    setDurableKVOverrideForTests(simulatedDurableKV);

    const isolatedKey = "__test_isolated__:99999999";

    // Invocation 1: write isolated test record via POST /api/admin/visibility
    const writeRes = await visibilityPOST(
      new NextRequest("http://localhost:3000/api/admin/visibility", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          cookie: adminCookieHeader,
        },
        body: JSON.stringify({
          key: isolatedKey,
          hidden: true,
          override: {
            fromPrice: "$199 Isolated Test Record",
          },
        }),
      }),
    );
    const writeBody = await writeRes.json();
    assert.equal(writeRes.status, 200);
    assert.equal(writeBody.success, true);

    // Simulate separate serverless invocation cold start by wiping any process-local state
    delete (globalThis as any).__wtaVisibilityDB;

    // Invocation 2: read isolated test record from a fresh invocation via getVisibility()
    const persisted = await getVisibility();
    assert.equal(persisted.tours[isolatedKey], true);
    assert.equal(persisted.overrides?.[isolatedKey]?.fromPrice, "$199 Isolated Test Record");

    // Clean up isolated test record and verify real tours were never touched
    await deleteIsolatedTestVisibilityRecord(isolatedKey);
    delete (globalThis as any).__wtaVisibilityDB;
    const afterCleanup = await getVisibility();
    assert.equal(Boolean(afterCleanup.tours[isolatedKey]), false);
    assert.equal(afterCleanup.overrides?.[isolatedKey] ?? null, null);
  } finally {
    setDurableKVOverrideForTests(null);
    if (prevAdminPassword === undefined) delete process.env.ADMIN_PASSWORD;
    else process.env.ADMIN_PASSWORD = prevAdminPassword;
  }
});
