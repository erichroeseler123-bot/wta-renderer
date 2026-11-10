import assert from "node:assert/strict";
import test from "node:test";
import { NextRequest } from "next/server";
import { POST as createIntent } from "../app/api/stripe/create-intent/route";
import { assertBookingsEnabled, BookingsDisabledError } from "../lib/fareharbor";

test("assertBookingsEnabled throws BookingsDisabledError when FH_BOOKINGS_ENABLED is unset or 0", () => {
  const original = process.env.FH_BOOKINGS_ENABLED;
  try {
    delete process.env.FH_BOOKINGS_ENABLED;
    assert.throws(() => assertBookingsEnabled(), (err: unknown) => {
      assert.ok(err instanceof BookingsDisabledError);
      assert.equal(err.code, "BOOKINGS_DISABLED");
      return true;
    });
  } finally {
    if (original === undefined) delete process.env.FH_BOOKINGS_ENABLED;
    else process.env.FH_BOOKINGS_ENABLED = original;
  }
});

test("POST /api/stripe/create-intent returns 503 BOOKINGS_DISABLED before Stripe or KV when bookings are disabled", async (t) => {
  const originalFh = process.env.FH_BOOKINGS_ENABLED;
  const originalStripe = process.env.STRIPE_SECRET_KEY;
  const fetchMock = t.mock.method(globalThis, "fetch", async () => {
    throw new Error("Upstream fetch must not be called when bookings are disabled");
  });

  try {
    delete process.env.FH_BOOKINGS_ENABLED;
    process.env.STRIPE_SECRET_KEY = "sk_test_dummy_never_used";

    const req = new NextRequest("https://www.welcometoalaskatours.com/api/stripe/create-intent", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        contact: { name: "Test Traveler", email: "traveler@example.com" },
        items: [{ company: "coastalhelicopters", itemPk: 1, availabilityPk: 2, ratePk: 3, qty: 2 }],
      }),
    });

    const res = await createIntent(req);
    assert.equal(res.status, 503);
    const body = await res.json();
    assert.equal(body.success, false);
    assert.equal(body.code, "BOOKINGS_DISABLED");
    assert.match(body.error, /Your card has not been charged/);
    assert.equal(fetchMock.mock.callCount(), 0);
  } finally {
    if (originalFh === undefined) delete process.env.FH_BOOKINGS_ENABLED;
    else process.env.FH_BOOKINGS_ENABLED = originalFh;
    if (originalStripe === undefined) delete process.env.STRIPE_SECRET_KEY;
    else process.env.STRIPE_SECRET_KEY = originalStripe;
  }
});

test("POST /api/stripe/create-intent returns 503 ORDER_STORAGE_UNAVAILABLE in serverless/prod without durable KV", async (t) => {
  const originalFh = process.env.FH_BOOKINGS_ENABLED;
  const originalVercel = process.env.VERCEL;
  const originalKv = process.env.KV_REST_API_URL;
  const originalUpstash = process.env.UPSTASH_REDIS_REST_URL;
  const fetchMock = t.mock.method(globalThis, "fetch", async () => {
    throw new Error("Upstream fetch must not be called without durable KV");
  });

  try {
    process.env.FH_BOOKINGS_ENABLED = "1";
    process.env.VERCEL = "1";
    delete process.env.KV_REST_API_URL;
    delete process.env.UPSTASH_REDIS_REST_URL;

    const req = new NextRequest("https://www.welcometoalaskatours.com/api/stripe/create-intent", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        contact: { name: "Test Traveler", email: "traveler@example.com" },
        items: [{ company: "coastalhelicopters", itemPk: 1, availabilityPk: 2, ratePk: 3, qty: 2 }],
      }),
    });

    const res = await createIntent(req);
    assert.equal(res.status, 503);
    const body = await res.json();
    assert.equal(body.success, false);
    assert.equal(body.code, "ORDER_STORAGE_UNAVAILABLE");
    assert.match(body.error, /Your card has not been charged/);
    assert.equal(fetchMock.mock.callCount(), 0);
  } finally {
    if (originalFh === undefined) delete process.env.FH_BOOKINGS_ENABLED;
    else process.env.FH_BOOKINGS_ENABLED = originalFh;
    if (originalVercel === undefined) delete process.env.VERCEL;
    else process.env.VERCEL = originalVercel;
    if (originalKv === undefined) delete process.env.KV_REST_API_URL;
    else process.env.KV_REST_API_URL = originalKv;
    if (originalUpstash === undefined) delete process.env.UPSTASH_REDIS_REST_URL;
    else process.env.UPSTASH_REDIS_REST_URL = originalUpstash;
  }
});
