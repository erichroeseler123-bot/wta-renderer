import assert from "node:assert/strict";
import { NextRequest } from "next/server";
import { GET as receiptHandler } from "../app/api/receipt/route";
import { POST as cancelHandler } from "../app/api/fareharbor/cancel/route";
import { saveOrder, getOrder, makeOrderCancelToken, type OrderSnapshot } from "../lib/orders";

process.env.USE_LOCAL_KV = "true";
process.env.WTA_INTERNAL_SECRET = "test-internal-secret-xyz-123456789";
process.env.WTA_ADMIN_SECRET = "test-admin-secret-at-least-40-chars-long-1234567890abcdef";
process.env.ORDER_SIGNING_SECRET = "test-order-signing-secret-secure-random-123456";

console.log("==================================================================");
console.log("TESTING APPLICATION ROUTES: AUTH, PRIVILEGE, AND RECEIPT REDACTION");
console.log("==================================================================\n");

async function runRouteTests() {
  const results: Array<{ test: string; status: "PASS" | "FAIL"; details: unknown }> = [];

  // Create a controlled existing order in KV
  const controlledOrderId = `ord_live_check_${Date.now()}`;
  const controlledPi = `pi_live_check_${Date.now()}`;
  const legitimateEmail = "traveler.qa@example.com";
  const legitimateCancelToken = makeOrderCancelToken(controlledOrderId, legitimateEmail);

  const controlledOrder: OrderSnapshot = {
    order_id: controlledOrderId,
    cart_id: `cart_${Date.now()}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    contact: {
      name: "Alex QA Traveler",
      email: legitimateEmail,
      phone: "555-987-6543",
    },
    items: [
      {
        company: "skagwayscooters",
        itemPk: 13748,
        availabilityPk: 445566,
        ratePk: 778899,
        qty: 1,
        title: "Skagway's Gold Rush Scooter Tour",
        // Tour departs in 12 hours (strictly within the <48h non-refundable window)
        startAt: new Date(Date.now() + 12 * 3600 * 1000).toISOString(),
        lineTotalCents: 9900,
        currency: "usd",
      },
    ],
    totalCents: 9900,
    currency: "usd",
    status: "booked",
    bookingAttempts: 1,
    payment_intent_id: controlledPi,
    cancel_token: legitimateCancelToken,
  };

  await saveOrder(controlledOrder);
  const loadedOrder = await getOrder(controlledOrderId);
  assert.ok(loadedOrder, "Controlled order must exist in KV");
  console.log("  ✔ Seeded controlled order in KV:", {
    order_id: loadedOrder.order_id,
    email: loadedOrder.contact.email,
    token_preview: loadedOrder.cancel_token?.slice(0, 16) + "...",
  });

  // ==================================================================
  // CHECK 1: RECEIPT ENDPOINT TOKEN REDACTION & AUTHENTICATION
  // ==================================================================
  console.log("\n▶ TEST 1: Receipt Endpoint Independent Authentication & Token Redaction");

  // 1a. Anonymous request knowing only the payment intent ID (?pi=...)
  const reqUnauthReceipt = new NextRequest(`https://welcometoalaskatours.com/api/receipt?pi=${controlledPi}`);
  const resUnauthReceipt = await receiptHandler(reqUnauthReceipt);
  const dataUnauthReceipt = await resUnauthReceipt.json();

  assert.equal(resUnauthReceipt.status, 200);
  assert.equal(dataUnauthReceipt.order_id, controlledOrderId);
  assert.equal(dataUnauthReceipt.cancel_token, null, "cancel_token MUST be redacted for unauthenticated query");
  console.log("  ✔ Receipt query without client_secret: 200 OK with cancel_token REDACTED (null)");

  // 1b. Session owner passing the exact Stripe client_secret
  const validClientSecret = `${controlledPi}_secret_live_session_owner_xyz`;
  const reqAuthReceipt = new NextRequest(`https://welcometoalaskatours.com/api/receipt?pi=${controlledPi}&client_secret=${validClientSecret}`);
  const resAuthReceipt = await receiptHandler(reqAuthReceipt);
  const dataAuthReceipt = await resAuthReceipt.json();

  assert.equal(resAuthReceipt.status, 200);
  assert.equal(dataAuthReceipt.cancel_token, legitimateCancelToken, "cancel_token MUST be revealed to client_secret holder");
  console.log("  ✔ Receipt query with valid client_secret: 200 OK with cancel_token delivered safely");

  results.push({ test: "Receipt Token Redaction & Independence", status: "PASS", details: "Redacted without client_secret, delivered with secret" });

  // ==================================================================
  // CHECK 2: AUTHORIZATION ON AN EXISTING ORDER (EMAIL-ONLY REJECTED)
  // ==================================================================
  console.log("\n▶ TEST 2: Authorization on Existing Order (Email Matching Disallowed)");

  // 2a. Attacker provides the REAL order ID and the customer's REAL email, but NO cancelToken
  const reqEmailOnly = new NextRequest("https://welcometoalaskatours.com/api/fareharbor/cancel", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      orderId: controlledOrderId,
      email: legitimateEmail,
    }),
  });
  const resEmailOnly = await cancelHandler(reqEmailOnly);
  const dataEmailOnly = await resEmailOnly.json();

  assert.equal(resEmailOnly.status, 401, "Email-only request for an existing order MUST return 401 Unauthorized");
  assert.ok(dataEmailOnly.error.includes("Administrator authorization or secure order cancellation token required"));
  console.log("  ✔ Existing order with matching email but NO token: REJECTED (HTTP 401 Unauthorized):", dataEmailOnly.error);

  // 2b. Attacker provides the REAL order ID with an invalid/forged cancelToken
  const reqBadToken = new NextRequest("https://welcometoalaskatours.com/api/fareharbor/cancel", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      orderId: controlledOrderId,
      cancelToken: "forged_invalid_token_9999",
    }),
  });
  const resBadToken = await cancelHandler(reqBadToken);
  const dataBadToken = await resBadToken.json();

  assert.equal(resBadToken.status, 401, "Forged token for an existing order MUST return 401 Unauthorized");
  console.log("  ✔ Existing order with forged cancelToken: REJECTED (HTTP 401 Unauthorized)");

  // 2c. Customer provides the REAL order ID with the VALID cancelToken
  const reqGoodToken = new NextRequest("https://welcometoalaskatours.com/api/fareharbor/cancel", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      orderId: controlledOrderId,
      cancelToken: legitimateCancelToken,
      reason: "customer_request",
    }),
  });
  const resGoodToken = await cancelHandler(reqGoodToken);
  const dataGoodToken = await resGoodToken.json();

  assert.equal(resGoodToken.status, 200, "Valid cancelToken MUST be authorized (HTTP 200)");
  console.log("  ✔ Existing order with legitimate cancelToken: AUTHORIZED (HTTP 200 OK)");

  results.push({ test: "Existing Order Authentication Verification", status: "PASS", details: "Email-only rejected with 401, token authorized" });

  // ==================================================================
  // CHECK 3: CANCELLATION REASON PRIVILEGE ENFORCEMENT
  // ==================================================================
  console.log("\n▶ TEST 3: Cancellation Reason Privilege Check (Customer Cannot Self-Certify Weather)");

  // Seed another controlled order departing in 10 hours (<48h non-refundable)
  const orderNear = {
    ...controlledOrder,
    order_id: `ord_near_${Date.now()}`,
    status: "booked" as const,
  };
  await saveOrder(orderNear);

  // Customer tries to claim "weather_safety" to bypass the 48h penalty window
  const reqCustomerWeatherAbuse = new NextRequest("https://welcometoalaskatours.com/api/fareharbor/cancel", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      orderId: orderNear.order_id,
      cancelToken: legitimateCancelToken,
      reason: "weather_safety", // Customer claims weather exception!
    }),
  });
  const resCustomerWeather = await cancelHandler(reqCustomerWeatherAbuse);
  const dataCustomerWeather = await resCustomerWeather.json();

  assert.equal(resCustomerWeather.status, 200);
  // Verify that the server DOWNGRADED reason to customer_request and enforced $0.00 refund!
  assert.equal(dataCustomerWeather.policy.allowedRefundCents, 0, "Server must enforce $0 refund and disallow customer self-certified weather claims");
  assert.equal(dataCustomerWeather.policy.policyMatched, "skagway_scooters_48h_non_refundable");
  assert.ok(dataCustomerWeather.policy.explanation.includes("within 48 hours of departure"));
  console.log("  ✔ Customer self-service 'weather_safety' claim intercepted and downgraded to customer_request: $0.00 refund enforced:", {
    allowedRefund: `$${dataCustomerWeather.policy.allowedRefundCents / 100}`,
    policyEnforced: dataCustomerWeather.policy.policyMatched,
  });

  // Admin submits weather exception using admin authorization
  const orderAdminWeather = {
    ...controlledOrder,
    order_id: `ord_admin_wx_${Date.now()}`,
    status: "booked" as const,
  };
  await saveOrder(orderAdminWeather);

  const reqAdminWeather = new NextRequest("https://welcometoalaskatours.com/api/fareharbor/cancel", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-wta-admin-secret": process.env.WTA_ADMIN_SECRET || "",
    },
    body: JSON.stringify({
      orderId: orderAdminWeather.order_id,
      reason: "weather_safety", // Authorized staff submitting verified operator weather cancellation
    }),
  });
  const resAdminWeather = await cancelHandler(reqAdminWeather);
  const dataAdminWeather = await resAdminWeather.json();

  assert.equal(resAdminWeather.status, 200);
  assert.equal(dataAdminWeather.policy.allowedRefundCents, 9900, "Admin authorized weather cancellation must grant 100% refund ($99.00)");
  assert.equal(dataAdminWeather.policy.policyMatched, "operator_weather_safety_cancellation");
  console.log("  ✔ Admin verified operator weather cancellation: 100% full refund approved ($99.00):", {
    allowedRefund: `$${dataAdminWeather.policy.allowedRefundCents / 100}`,
    policyEnforced: dataAdminWeather.policy.policyMatched,
  });

  results.push({ test: "Privilege Check on Cancellation Reasons", status: "PASS", details: "Customer weather claim downgraded, admin weather approved" });

  console.log("\n==================================================================");
  console.log("ALL ROUTE LEVEL AUTHENTICATION & PRIVILEGE CHECKS PASSED");
  console.log("==================================================================");
  console.table(results);
}

runRouteTests().catch((err) => {
  console.error("Route Contract Test Failed:", err);
  process.exit(1);
});
