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
import {
  setDurableKVOverrideForTests,
  namespaceKVKey,
  type KVClient,
} from "../lib/kv";
import { setStripeClientForTests } from "../lib/stripe";
import {
  getVisibility,
  deleteIsolatedTestVisibilityRecord,
} from "../lib/visibilityStore";
import {
  applyServerPriceChangesToCartItems,
  formatCentsUsd,
} from "../app/components/cart/CheckoutClient";

import { GET as priceGET } from "../app/api/fareharbor/price/route";
import { POST as createIntentPOST } from "../app/api/stripe/create-intent/route";
import { POST as webhookPOST } from "../app/api/stripe/webhook/route";
import { POST as finalizePOST } from "../app/api/stripe/finalize/route";
import { GET as receiptGET } from "../app/api/receipt/route";
import { POST as fareharborCancelPOST } from "../app/api/fareharbor/cancel/route";
import { POST as adminLoginPOST } from "../app/api/admin/login/route";
import { GET as widgetCatalogGET } from "../app/api/admin/widget-catalog/route";
import {
  GET as visibilityGET,
  POST as visibilityPOST,
} from "../app/api/admin/visibility/route";
import { POST as providersPOST } from "../app/api/admin/providers/route";
import { GET as adminToursGET } from "../app/api/admin/tours/route";
import { GET as adminOrdersGET } from "../app/api/admin/orders/route";
import { POST as adminOrdersRetryPOST } from "../app/api/admin/orders/retry/route";
import {
  GET as adminFlagsGET,
  POST as adminFlagsPOST,
} from "../app/api/admin/flags/route";
import { GET as adminPlanEventsGET } from "../app/api/admin/plan-events/route";
import { GET as adminDccCallbacksGET } from "../app/api/admin/dcc-callbacks/route";
import { POST as adminDccProbePOST } from "../app/api/admin/dcc-callbacks/probe/route";
import { GET as handoffDccDebugGET } from "../app/api/handoff/dcc/debug/route";
import { GET as adminStripeStatusGET } from "../app/api/admin/stripe/status/route";
import { GET as adminStripeConnectGET } from "../app/api/admin/stripe/connect/route";
import { GET as adminStripeCallbackGET } from "../app/api/admin/stripe/callback/route";
import { POST as adminStripeDisconnectPOST } from "../app/api/admin/stripe/disconnect/route";

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

test("2. Pre-payment booking capability, changed-price confirmation before payment, simultaneous webhook/finalize concurrency, and ambiguous provider timeout protection", async () => {
  const prevFhEnabled = process.env.FH_BOOKINGS_ENABLED;
  const prevUseLocalKv = process.env.USE_LOCAL_KV;
  const prevWhSecret = process.env.STRIPE_WEBHOOK_SECRET;
  const prevAdminPassword = process.env.ADMIN_PASSWORD;
  const prevOrderSecret = process.env.ORDER_SIGNING_SECRET;
  const prevTurnstileSecret = process.env.TURNSTILE_SECRET_KEY;

  process.env.USE_LOCAL_KV = "true";
  process.env.STRIPE_WEBHOOK_SECRET = "whsec_test_local_secret";
  process.env.ADMIN_PASSWORD = "test-strong-admin-password-2026";
  process.env.ORDER_SIGNING_SECRET =
    "9f8e7d6c5b4a3f2e1d0c9b8a7f6e5d4c3b2a1f0e9d8c7b6a5f4e3d2c1b0a9f8e";
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

  let liveFareHarborUnitCents = 20900;

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
              customer_prototype: { total: liveFareHarborUnitCents },
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

    // 2b. Changed price is shown and accepted BEFORE payment
    process.env.FH_BOOKINGS_ENABLED = "1";
    liveFareHarborUnitCents = 24500; // Live operator price increased from $209.00 (20900) to $245.00 (24500)

    const initialCartItems = [
      {
        company: "beyondak",
        itemPk: 195602,
        availabilityPk: -5352426,
        ratePk: 9150964743,
        day: "2027-06-15",
        startAt: "2027-06-15T11:00:00-0800",
        qty: 2,
        price: 20900,
        unitCents: 20900,
        expectedUnitCents: 20900,
        title: "Mendenhall Glacier Guided Hike",
        widgetPlacement: "hotel-homepage",
        embedDomain: "https://insidepassagelodge.example.com/concierge",
      },
    ];

    const priceChangedReq = new NextRequest("http://localhost:3000/api/stripe/create-intent", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        contact: { name: "Jane Traveler", email: "jane@example.com", phone: "555-0100" },
        items: initialCartItems,
      }),
    });
    const priceChangedRes = await createIntentPOST(priceChangedReq);
    const priceChangedBody = await priceChangedRes.json();

    assert.equal(priceChangedRes.status, 409, "Changed price must block PaymentIntent creation with 409 until customer accepts");
    assert.equal(priceChangedBody.success, false);
    assert.equal(priceChangedBody.code, "price_changed");
    assert.equal(priceChangedBody.previousTotalCents, 41800);
    assert.equal(priceChangedBody.updatedTotalCents, 49000);
    assert.equal(Array.isArray(priceChangedBody.priceChanges), true);
    assert.equal(priceChangedBody.priceChanges.length, 1);
    assert.equal(priceChangedBody.priceChanges[0].previousUnitCents, 20900);
    assert.equal(priceChangedBody.priceChanges[0].updatedUnitCents, 24500);
    assert.equal(stripeCreateCalls, 0, "No Stripe PaymentIntent may be created before customer accepts changed price");

    // Verify CheckoutClient helper updates cart items and formats displayed amounts before customer confirms
    const updatedCartItems = applyServerPriceChangesToCartItems(
      initialCartItems,
      priceChangedBody.priceChanges,
    );
    assert.equal(updatedCartItems[0].unitCents, 24500);
    assert.equal(updatedCartItems[0].price, 24500);
    assert.equal(updatedCartItems[0].expectedUnitCents, 24500);
    assert.equal(formatCentsUsd(priceChangedBody.previousTotalCents), "$418.00");
    assert.equal(formatCentsUsd(priceChangedBody.updatedTotalCents), "$490.00");

    // Customer clicks "Accept Updated Total ($490.00) & Pay" -> sends acceptedTotalCents: 49000
    let fhBookingCalls = 0;
    let fhDelayMs = 35;
    let fhFailureMode: "none" | "http_502" | "ambiguous_timeout" = "none";

    setFareHarborBookingHandlerForTests(async ({ company, availabilityPk, customerTypeRatePk, qty }) => {
      fhBookingCalls += 1;
      if (fhDelayMs > 0) {
        await new Promise((resolve) => setTimeout(resolve, fhDelayMs));
      }
      if (fhFailureMode === "http_502") {
        throw new Error("FareHarbor HTTP 502: Simulated operator reservation failure");
      }
      if (fhFailureMode === "ambiguous_timeout") {
        const err = new Error("Request timed out after dispatch: ETIMEDOUT") as Error & {
          code?: string;
        };
        err.name = "TimeoutError";
        err.code = "ETIMEDOUT";
        throw err;
      }
      return {
        booking: {
          pk: 900100 + fhBookingCalls,
          uuid: `fh-uuid-${company}-${availabilityPk}-${customerTypeRatePk}-${qty}`,
          status: "booked",
        },
      };
    });

    const createReq1 = new NextRequest("http://localhost:3000/api/stripe/create-intent", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        contact: { name: "Jane Traveler", email: "jane@example.com", phone: "555-0100" },
        items: initialCartItems, // Even if original expectedUnitCents=20900 is sent, acceptedTotalCents=49000 proves customer accepted the new total
        acceptedTotalCents: 49000,
      }),
    });
    const createRes1 = await createIntentPOST(createReq1);
    const createBody1 = await createRes1.json();
    assert.equal(createRes1.status, 200);
    assert.equal(createBody1.success, true);
    assert.equal(createBody1.totalCents, 49000);
    assert.equal(stripeCreateCalls, 1);

    const piId1 = createBody1.payment_intent_id as string;
    const orderId1 = createBody1.order_id as string;
    createdIntents.get(piId1).status = "succeeded";

    // 2c. SIMULTANEOUS webhook + finalize requests (Promise.all while FareHarbor call is in flight)
    const webhookEventPayload1 = JSON.stringify({
      id: "evt_test_1",
      type: "payment_intent.succeeded",
      data: {
        object: createdIntents.get(piId1),
      },
    });

    const [whConcurrentRes, finConcurrentRes] = await Promise.all([
      webhookPOST(
        new Request("http://localhost:3000/api/stripe/webhook", {
          method: "POST",
          headers: {
            "content-type": "application/json",
            "stripe-signature": "valid_sig:whsec_test_local_secret",
          },
          body: webhookEventPayload1,
        }),
      ),
      finalizePOST(
        new Request("http://localhost:3000/api/stripe/finalize", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ payment_intent_id: piId1 }),
        }),
      ),
    ]);

    assert.equal(whConcurrentRes.status, 200);
    assert.equal(finConcurrentRes.status, 200);
    const finConcurrentBody = await finConcurrentRes.json();
    assert.ok(
      finConcurrentBody.status === "busy" || finConcurrentBody.status === "booked",
      `Expected concurrent finalize status to be busy or booked, got ${finConcurrentBody.status}`,
    );
    assert.equal(
      fhBookingCalls,
      1,
      "Simultaneous webhook + finalize requests must invoke FareHarbor booking exactly ONCE",
    );

    // Subsequent sequential webhook and finalize calls also remain idempotent
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
    assert.equal(fhBookingCalls, 1);

    const finResAfter = await finalizePOST(
      new Request("http://localhost:3000/api/stripe/finalize", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ payment_intent_id: piId1 }),
      }),
    );
    const finBodyAfter = await finResAfter.json();
    assert.equal(finResAfter.status, 200);
    assert.equal(finBodyAfter.status, "booked");
    assert.equal(fhBookingCalls, 1);

    const receiptRes1 = await receiptGET(
      new NextRequest(`http://localhost:3000/api/receipt?pi=${encodeURIComponent(piId1)}`),
    );
    const receiptBody1 = await receiptRes1.json();
    assert.equal(receiptBody1.success, true);
    assert.equal(receiptBody1.status, "booked");
    assert.equal(receiptBody1.order_id, orderId1);

    // 2d. Deterministic provider failure (HTTP 502) -> queued in needs_attention -> admin retry succeeds
    fhFailureMode = "http_502";
    fhDelayMs = 0;
    liveFareHarborUnitCents = 20900;

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

    const receiptRes2 = await receiptGET(
      new NextRequest(`http://localhost:3000/api/receipt?pi=${encodeURIComponent(piId2)}`),
    );
    const receiptBody2 = await receiptRes2.json();
    assert.equal(receiptBody2.success, true);
    assert.equal(receiptBody2.status, "booking_failed");
    assert.match(String(receiptBody2.lastError || ""), /Simulated operator reservation failure/);

    const adminCookie = makeAdminCookieValue();
    const cookieHeader = `${ADMIN_COOKIE}=${adminCookie}`;

    const queueRes = await adminOrdersGET(
      new NextRequest("http://localhost:3000/api/admin/orders?scope=needs_attention", {
        headers: { cookie: cookieHeader },
      }),
    );
    const queueBody = await queueRes.json();
    assert.equal(queueRes.status, 200);
    const queuedFailedOrder = (queueBody.orders || []).find(
      (o: any) => o.order_id === orderId2,
    );
    assert.ok(queuedFailedOrder, "Failed booking order must appear in needs_attention queue");

    fhFailureMode = "none";
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

    // 2e. AMBIGUOUS PROVIDER TIMEOUT after dispatch (ETIMEDOUT) -> must NOT trigger a blind duplicate booking!
    fhFailureMode = "ambiguous_timeout";

    const createReq3 = new NextRequest("http://localhost:3000/api/stripe/create-intent", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        contact: { name: "Morgan TimeoutTest", email: "morgan@example.com", phone: "555-0177" },
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
          },
        ],
      }),
    });
    const createRes3 = await createIntentPOST(createReq3);
    const createBody3 = await createRes3.json();
    assert.equal(createRes3.status, 200);

    const piId3 = createBody3.payment_intent_id as string;
    const orderId3 = createBody3.order_id as string;
    createdIntents.get(piId3).status = "succeeded";

    // First webhook triggers FareHarbor call which times out ambiguously after dispatch
    const whRes3 = await webhookPOST(
      new Request("http://localhost:3000/api/stripe/webhook", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "stripe-signature": "valid_sig:whsec_test_local_secret",
        },
        body: JSON.stringify({
          id: "evt_test_3",
          type: "payment_intent.succeeded",
          data: { object: createdIntents.get(piId3) },
        }),
      }),
    );
    assert.equal(whRes3.status, 200);
    assert.equal(fhBookingCalls, 4, "Initial ambiguous timeout attempt called FareHarbor once");

    // Even if FareHarbor is now healthy, subsequent finalize, duplicate webhook, and unforced admin retry
    // MUST NOT blindly re-book because the timed-out request may have already created the reservation!
    fhFailureMode = "none";

    const finAfterTimeoutRes = await finalizePOST(
      new Request("http://localhost:3000/api/stripe/finalize", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ payment_intent_id: piId3 }),
      }),
    );
    const finAfterTimeoutBody = await finAfterTimeoutRes.json();
    assert.equal(finAfterTimeoutRes.status, 200);
    assert.equal(finAfterTimeoutBody.status, "booking_failed");
    assert.equal(
      fhBookingCalls,
      4,
      "Finalize after an ambiguous provider timeout MUST NOT trigger a blind duplicate booking",
    );

    const whAfterTimeoutRes = await webhookPOST(
      new Request("http://localhost:3000/api/stripe/webhook", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "stripe-signature": "valid_sig:whsec_test_local_secret",
        },
        body: JSON.stringify({
          id: "evt_test_3_dup",
          type: "payment_intent.succeeded",
          data: { object: createdIntents.get(piId3) },
        }),
      }),
    );
    assert.equal(whAfterTimeoutRes.status, 200);
    assert.equal(
      fhBookingCalls,
      4,
      "Duplicate webhook after an ambiguous provider timeout MUST NOT trigger a blind duplicate booking",
    );

    const blindRetryRes = await adminOrdersRetryPOST(
      new NextRequest("http://localhost:3000/api/admin/orders/retry", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          cookie: cookieHeader,
        },
        body: JSON.stringify({ order_id: orderId3 }),
      }),
    );
    const blindRetryBody = await blindRetryRes.json();
    assert.equal(
      blindRetryRes.status,
      409,
      "Standard admin retry without manual verification must reject with 409 after an ambiguous provider timeout",
    );
    assert.equal(blindRetryBody.code, "ambiguous_provider_timeout_requires_manual_check");
    assert.equal(
      fhBookingCalls,
      4,
      "Unforced admin retry after an ambiguous timeout MUST NOT call FareHarbor",
    );

    // Only after staff manually verifies with the operator that the voucher was NOT created and passes force_rebook_after_manual_check=true does retry proceed
    const forcedRetryRes = await adminOrdersRetryPOST(
      new NextRequest("http://localhost:3000/api/admin/orders/retry", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          cookie: cookieHeader,
        },
        body: JSON.stringify({
          order_id: orderId3,
          force_rebook_after_manual_check: true,
        }),
      }),
    );
    const forcedRetryBody = await forcedRetryRes.json();
    assert.equal(forcedRetryRes.status, 200);
    assert.equal(forcedRetryBody.success, true);
    assert.equal(forcedRetryBody.status, "booked");
    assert.equal(fhBookingCalls, 5);
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
    if (prevOrderSecret === undefined) delete process.env.ORDER_SIGNING_SECRET;
    else process.env.ORDER_SIGNING_SECRET = prevOrderSecret;
    if (prevTurnstileSecret !== undefined) process.env.TURNSTILE_SECRET_KEY = prevTurnstileSecret;
  }
});

test("3. Owner authentication requires dedicated ORDER_SIGNING_SECRET + ADMIN_PASSWORD, fails closed when either is missing, and rejects old forged cookies across all 17 endpoints", async () => {
  const prevAdminPassword = process.env.ADMIN_PASSWORD;
  const prevOrderSecret = process.env.ORDER_SIGNING_SECRET;
  const prevUseLocalKv = process.env.USE_LOCAL_KV;
  process.env.USE_LOCAL_KV = "true";

  try {
    // 3a. Missing / empty / placeholder ADMIN_PASSWORD fails closed even when ORDER_SIGNING_SECRET is set
    process.env.ORDER_SIGNING_SECRET =
      "9f8e7d6c5b4a3f2e1d0c9b8a7f6e5d4c3b2a1f0e9d8c7b6a5f4e3d2c1b0a9f8e";
    for (const badPw of ["", "   ", "replace_me", "changeme"]) {
      process.env.ADMIN_PASSWORD = badPw;
      assert.throws(() => makeAdminCookieValue());

      const ts = String(Date.now());
      const emptySecretSig = crypto.createHmac("sha256", "").update(ts).digest("hex");
      const forgedEmptyCookie = `${ts}.${emptySecretSig}`;
      assert.equal(isAdminCookieValue(forgedEmptyCookie), false);

      const loginRes = await adminLoginPOST(
        new NextRequest("http://localhost:3000/api/admin/login", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ password: badPw }),
        }),
      );
      assert.equal(loginRes.status, 503);
    }

    // 3b. Missing / empty / placeholder ORDER_SIGNING_SECRET fails closed even when ADMIN_PASSWORD is set
    process.env.ADMIN_PASSWORD = "owner-prod-password-verified-99";
    for (const badSecret of ["", "   ", "replace_me", "change_me_to_long_random"]) {
      process.env.ORDER_SIGNING_SECRET = badSecret;
      assert.throws(() => makeAdminCookieValue());

      const ts = String(Date.now());
      const emptySecretSig = crypto.createHmac("sha256", "").update(ts).digest("hex");
      assert.equal(isAdminCookieValue(`${ts}.${emptySecretSig}`), false);

      const loginRes = await adminLoginPOST(
        new NextRequest("http://localhost:3000/api/admin/login", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ password: "owner-prod-password-verified-99" }),
        }),
      );
      assert.equal(loginRes.status, 503);
    }

    // 3c. With both ADMIN_PASSWORD and dedicated ORDER_SIGNING_SECRET configured:
    process.env.ADMIN_PASSWORD = "owner-prod-password-verified-99";
    process.env.ORDER_SIGNING_SECRET =
      "9f8e7d6c5b4a3f2e1d0c9b8a7f6e5d4c3b2a1f0e9d8c7b6a5f4e3d2c1b0a9f8e";

    const now = Date.now();
    // Forged cookie #1: Legacy empty-secret vulnerability (${ts}.${hmac("", ts)})
    const emptySig = crypto.createHmac("sha256", "").update(String(now)).digest("hex");
    const emptySecretCookie = `${now}.${emptySig}`;
    assert.equal(isAdminCookieValue(emptySecretCookie, now), false);

    // Forged cookie #2: Signed without dedicated ORDER_SIGNING_SECRET
    const noOrderSecretKey = crypto
      .createHmac("sha256", "wta-admin-cookie-signing-key-v1")
      .update(`:${process.env.ADMIN_PASSWORD}`)
      .digest("hex");
    const noOrderSecretSig = crypto
      .createHmac("sha256", noOrderSecretKey)
      .update(String(now))
      .digest("hex");
    const noOrderSecretCookie = `${now}.${noOrderSecretSig}`;
    assert.equal(isAdminCookieValue(noOrderSecretCookie, now), false);

    // Valid cookie works within TTL
    const validCookie = makeAdminCookieValue(now);
    assert.ok(validCookie);
    assert.equal(isAdminCookieValue(validCookie, now + 60_000), true);

    // Expired cookie (>8 hours old) is rejected
    const nineHoursLater = now + 9 * 60 * 60 * 1000;
    assert.equal(isAdminCookieValue(validCookie, nineHoursLater), false);

    // Future-dated cookie beyond clock skew (>5m in future) is rejected
    const futureCookie = makeAdminCookieValue(now + 10 * 60 * 1000);
    assert.equal(isAdminCookieValue(futureCookie, now), false);

    // Tampered signature is rejected
    const tamperedCookie = `${validCookie.slice(0, -4)}abcd`;
    assert.equal(isAdminCookieValue(tamperedCookie, now), false);

    // 3d. Verify ALL 17 endpoints that used the vulnerable helper reject old forged cookies
    for (const badCookie of [emptySecretCookie, noOrderSecretCookie]) {
      const forgedHeader = `${ADMIN_COOKIE}=${badCookie}`;

      // 1. GET /api/admin/widget-catalog
      assert.equal(
        (
          await widgetCatalogGET(
            new NextRequest("http://localhost:3000/api/admin/widget-catalog", {
              headers: { cookie: forgedHeader },
            }),
          )
        ).status,
        401,
      );

      // 2. GET & POST /api/admin/visibility
      assert.equal(
        (
          await visibilityGET(
            new NextRequest("http://localhost:3000/api/admin/visibility", {
              headers: { cookie: forgedHeader },
            }),
          )
        ).status,
        401,
      );
      assert.equal(
        (
          await visibilityPOST(
            new NextRequest("http://localhost:3000/api/admin/visibility", {
              method: "POST",
              headers: { "content-type": "application/json", cookie: forgedHeader },
              body: JSON.stringify({ key: "__test_isolated__:99999999", hidden: true }),
            }),
          )
        ).status,
        401,
      );

      // 3. POST /api/admin/providers
      assert.equal(
        (
          await providersPOST(
            new NextRequest("http://localhost:3000/api/admin/providers", {
              method: "POST",
              headers: { "content-type": "application/json", cookie: forgedHeader },
              body: JSON.stringify({ company: "__test_isolated__", hidden: true }),
            }),
          )
        ).status,
        401,
      );

      // 4. GET /api/admin/tours
      assert.equal(
        (
          await adminToursGET(
            new NextRequest("http://localhost:3000/api/admin/tours", {
              headers: { cookie: forgedHeader },
            }),
          )
        ).status,
        401,
      );

      // 5. GET /api/admin/orders
      assert.equal(
        (
          await adminOrdersGET(
            new NextRequest("http://localhost:3000/api/admin/orders", {
              headers: { cookie: forgedHeader },
            }),
          )
        ).status,
        401,
      );

      // 6. POST /api/admin/orders/retry
      assert.equal(
        (
          await adminOrdersRetryPOST(
            new NextRequest("http://localhost:3000/api/admin/orders/retry", {
              method: "POST",
              headers: { "content-type": "application/json", cookie: forgedHeader },
              body: JSON.stringify({ order_id: "ord_123" }),
            }),
          )
        ).status,
        401,
      );

      // 7. GET & POST /api/admin/flags
      assert.equal(
        (
          await adminFlagsGET(
            new NextRequest("http://localhost:3000/api/admin/flags", {
              headers: { cookie: forgedHeader },
            }),
          )
        ).status,
        403,
      );
      assert.equal(
        (
          await adminFlagsPOST(
            new NextRequest("http://localhost:3000/api/admin/flags", {
              method: "POST",
              headers: { "content-type": "application/json", cookie: forgedHeader },
              body: JSON.stringify({ bookingsEnabled: false }),
            }),
          )
        ).status,
        403,
      );

      // 8. GET /api/admin/plan-events
      assert.equal(
        (
          await adminPlanEventsGET(
            new NextRequest("http://localhost:3000/api/admin/plan-events", {
              headers: { cookie: forgedHeader },
            }),
          )
        ).status,
        401,
      );

      // 9. GET /api/admin/dcc-callbacks
      assert.equal(
        (
          await adminDccCallbacksGET(
            new NextRequest("http://localhost:3000/api/admin/dcc-callbacks", {
              headers: { cookie: forgedHeader },
            }),
          )
        ).status,
        401,
      );

      // 10. POST /api/admin/dcc-callbacks/probe
      assert.equal(
        (
          await adminDccProbePOST(
            new NextRequest("http://localhost:3000/api/admin/dcc-callbacks/probe", {
              method: "POST",
              headers: { cookie: forgedHeader },
            }),
          )
        ).status,
        401,
      );

      // 11. GET /api/handoff/dcc/debug
      assert.equal(
        (
          await handoffDccDebugGET(
            new NextRequest("http://localhost:3000/api/handoff/dcc/debug", {
              headers: { cookie: forgedHeader },
            }),
          )
        ).status,
        401,
      );

      // 12. GET /api/admin/stripe/status
      assert.equal(
        (
          await adminStripeStatusGET(
            new NextRequest("http://localhost:3000/api/admin/stripe/status", {
              headers: { cookie: forgedHeader },
            }),
          )
        ).status,
        401,
      );

      // 13. GET /api/admin/stripe/connect (redirects unauthenticated to /admin)
      const stripeConnectRes = await adminStripeConnectGET(
        new NextRequest("http://localhost:3000/api/admin/stripe/connect", {
          headers: { cookie: forgedHeader },
        }),
      );
      assert.equal(stripeConnectRes.status, 307);
      assert.match(String(stripeConnectRes.headers.get("location") || ""), /\/admin$/);

      // 14. GET /api/admin/stripe/callback (redirects unauthenticated to /admin)
      const stripeCallbackRes = await adminStripeCallbackGET(
        new NextRequest("http://localhost:3000/api/admin/stripe/callback?code=1&state=2", {
          headers: { cookie: forgedHeader },
        }),
      );
      assert.equal(stripeCallbackRes.status, 307);
      assert.match(String(stripeCallbackRes.headers.get("location") || ""), /\/admin$/);

      // 15. POST /api/admin/stripe/disconnect
      assert.equal(
        (
          await adminStripeDisconnectPOST(
            new NextRequest("http://localhost:3000/api/admin/stripe/disconnect", {
              method: "POST",
              headers: { cookie: forgedHeader },
            }),
          )
        ).status,
        401,
      );

      // 16. GET /api/receipt (forged admin cookie must NOT reveal cancel_token)
      const receiptForgedRes = await receiptGET(
        new NextRequest("http://localhost:3000/api/receipt?pi=pi_nonexistent_test", {
          headers: { cookie: forgedHeader },
        }),
      );
      const receiptForgedBody = await receiptForgedRes.json();
      assert.equal(receiptForgedBody.cancel_token ?? null, null);

      // 17. POST /api/fareharbor/cancel (forged admin cookie must NOT grant admin override)
      const cancelForgedRes = await fareharborCancelPOST(
        new NextRequest("http://localhost:3000/api/fareharbor/cancel", {
          method: "POST",
          headers: { "content-type": "application/json", cookie: forgedHeader },
          body: JSON.stringify({ orderId: "ord_nonexistent_test" }),
        }),
      );
      assert.equal(cancelForgedRes.status, 404);
    }

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
    if (prevUseLocalKv === undefined) delete process.env.USE_LOCAL_KV;
    else process.env.USE_LOCAL_KV = prevUseLocalKv;
  }
});

test("4. Durable production updates enforce wta: key isolation, fail with 503 when durable KV is unavailable, and persist across separate invocations using an isolated test record", async () => {
  const prevAdminPassword = process.env.ADMIN_PASSWORD;
  const prevOrderSecret = process.env.ORDER_SIGNING_SECRET;
  const prevKvUrl = process.env.KV_REST_API_URL;
  const prevKvToken = process.env.KV_REST_API_TOKEN;
  const prevUpstashUrl = process.env.UPSTASH_REDIS_REST_URL;
  const prevUpstashToken = process.env.UPSTASH_REDIS_REST_TOKEN;

  process.env.ADMIN_PASSWORD = "owner-prod-password-verified-99";
  process.env.ORDER_SIGNING_SECRET =
    "9f8e7d6c5b4a3f2e1d0c9b8a7f6e5d4c3b2a1f0e9d8c7b6a5f4e3d2c1b0a9f8e";
  const adminCookieHeader = `${ADMIN_COOKIE}=${makeAdminCookieValue()}`;

  try {
    // Verify namespaceKVKey prefixes all keys with wta:
    assert.equal(namespaceKVKey("order:ord_123"), "wta:order:ord_123");
    assert.equal(namespaceKVKey("wta:visibility:v1"), "wta:visibility:v1");

    // 4a. Without durable KV configured, visibility/catalog/provider writes MUST NOT return success
    setDurableKVOverrideForTests(null);
    delete process.env.KV_REST_API_URL;
    delete process.env.KV_REST_API_TOKEN;
    delete process.env.UPSTASH_REDIS_REST_URL;
    delete process.env.UPSTASH_REDIS_REST_TOKEN;

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
    backingRedisMap.set("cp:cruisepromenade:existing_key", JSON.stringify({ untouched: true }));

    const simulatedDurableKV: KVClient = {
      async get<T = unknown>(k: string): Promise<T | null> {
        const raw = backingRedisMap.get(k);
        return raw ? (JSON.parse(raw) as T) : null;
      },
      async set(k: string, v: unknown): Promise<string> {
        backingRedisMap.set(k, JSON.stringify(v));
        return "OK";
      },
      async del(k: string): Promise<number> {
        return backingRedisMap.delete(k) ? 1 : 0;
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

    // Verify all WTA writes in the shared Redis map are isolated under wta:* and existing cp:* key is untouched
    assert.equal(backingRedisMap.has("wta:visibility:v1"), true);
    assert.equal(
      backingRedisMap.get("cp:cruisepromenade:existing_key"),
      JSON.stringify({ untouched: true }),
    );

    // Invocation 2: read isolated test record from a separate GET /api/admin/visibility?key=... invocation
    const readRes = await visibilityGET(
      new NextRequest(
        `http://localhost:3000/api/admin/visibility?key=${encodeURIComponent(isolatedKey)}`,
        {
          headers: { cookie: adminCookieHeader },
        },
      ),
    );
    const readBody = await readRes.json();
    assert.equal(readRes.status, 200);
    assert.equal(readBody.success, true);
    assert.equal(readBody.exists, true);
    assert.equal(readBody.hidden, 1);
    assert.equal(readBody.override?.fromPrice, "$199 Isolated Test Record");

    // Invocation 3: remove isolated test record via POST /api/admin/visibility { delete: true }
    const delRes = await visibilityPOST(
      new NextRequest("http://localhost:3000/api/admin/visibility", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          cookie: adminCookieHeader,
        },
        body: JSON.stringify({
          key: isolatedKey,
          delete: true,
        }),
      }),
    );
    const delBody = await delRes.json();
    assert.equal(delRes.status, 200);
    assert.equal(delBody.success, true);
    assert.equal(delBody.deleted, true);

    const afterCleanup = await getVisibility();
    assert.equal(Boolean(afterCleanup.tours[isolatedKey]), false);
    assert.equal(afterCleanup.overrides?.[isolatedKey] ?? null, null);
  } finally {
    setDurableKVOverrideForTests(null);
    if (prevAdminPassword === undefined) delete process.env.ADMIN_PASSWORD;
    else process.env.ADMIN_PASSWORD = prevAdminPassword;
    if (prevOrderSecret === undefined) delete process.env.ORDER_SIGNING_SECRET;
    else process.env.ORDER_SIGNING_SECRET = prevOrderSecret;
    if (prevKvUrl === undefined) delete process.env.KV_REST_API_URL;
    else process.env.KV_REST_API_URL = prevKvUrl;
    if (prevKvToken === undefined) delete process.env.KV_REST_API_TOKEN;
    else process.env.KV_REST_API_TOKEN = prevKvToken;
    if (prevUpstashUrl === undefined) delete process.env.UPSTASH_REDIS_REST_URL;
    else process.env.UPSTASH_REDIS_REST_URL = prevUpstashUrl;
    if (prevUpstashToken === undefined) delete process.env.UPSTASH_REDIS_REST_TOKEN;
    else process.env.UPSTASH_REDIS_REST_TOKEN = prevUpstashToken;
  }
});
