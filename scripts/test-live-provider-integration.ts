import Stripe from "stripe";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const appKey = process.env.FAREHARBOR_APP_KEY || process.env.FH_APP_KEY || "";
const userKey = process.env.FAREHARBOR_USER_KEY || process.env.FH_USER_KEY || "";
const stripeSecretKey = process.env.STRIPE_SECRET_KEY || "";

console.log("==================================================================");
console.log("LIVE PROVIDER INTEGRATION & LIVE ROUTE VERIFICATION");
console.log("==================================================================\n");

async function runLiveProviderChecks() {
  const results: Array<{ step: string; provider: string; status: "PASS" | "FAIL"; details: unknown }> = [];

  // ==================================================================
  // 1. LIVE FAREHARBOR EXTERNAL API V1 TEST
  // ==================================================================
  console.log("▶ STEP 1: Querying Live FareHarbor External API v1 (Skagway Scooters Item 13748)...");
  try {
    const fhRes = await fetch("https://fareharbor.com/api/external/v1/companies/skagwayscooters/items/13748/", {
      headers: {
        "X-FareHarbor-API-App": appKey,
        "X-FareHarbor-API-User": userKey,
      },
    });

    const fhData = await fhRes.json();
    if (!fhRes.ok) {
      throw new Error(`FareHarbor API error: HTTP ${fhRes.status} ${JSON.stringify(fhData)}`);
    }

    const item = fhData.item;
    console.log("  ✔ Live FareHarbor API Response HTTP 200:");
    console.log(`    - Item PK: ${item.pk}`);
    console.log(`    - Item Name: "${item.name}"`);
    console.log(`    - Headline: "${item.headline}"`);
    console.log(`    - Contract Cancellation Policy (first 120 chars): "${item.cancellation_policy.replace(/\n+/g, ' ').slice(0, 120)}..."`);

    results.push({
      step: "Live FareHarbor API Query",
      provider: "FareHarbor v1",
      status: "PASS",
      details: { pk: item.pk, name: item.name, status: fhRes.status },
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("  ✖ FareHarbor query failed:", msg);
    results.push({ step: "Live FareHarbor API Query", provider: "FareHarbor v1", status: "FAIL", details: msg });
  }

  // ==================================================================
  // 2. LIVE STRIPE API CONNECTIVITY TEST
  // ==================================================================
  console.log("\n▶ STEP 2: Connecting to Live Stripe API Gateway...");
  try {
    const stripe = new Stripe(stripeSecretKey, {});
    // Test authentication and retrieve account or balance
    const balance = await stripe.balance.retrieve();
    console.log("  ✔ Live Stripe API Response HTTP 200:");
    console.log(`    - Livemode: ${balance.livemode}`);
    console.log(`    - Available Currencies: ${balance.available.map((b) => b.currency.toUpperCase()).join(", ")}`);

    results.push({
      step: "Live Stripe API Authentication",
      provider: "Stripe",
      status: "PASS",
      details: { livemode: balance.livemode, currencies: balance.available.map((b) => b.currency) },
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("  ✖ Stripe connectivity failed:", msg);
    results.push({ step: "Live Stripe API Authentication", provider: "Stripe", status: "FAIL", details: msg });
  }

  // ==================================================================
  // 3. LIVE ROUTE AUTHENTICATION & REJECTION CHECKS
  // ==================================================================
  console.log("\n▶ STEP 3: Testing Live Route Security on Production Endpoints...");
  const hosts = ["https://welcometoalaskatours.com", "https://wta-renderer.vercel.app"];

  for (const host of hosts) {
    console.log(`  Checking ${host}:`);

    // 3a. Anonymous request with no token
    const resAnon = await fetch(`${host}/api/fareharbor/cancel`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bookingUuid: "mock-booking-uuid" }),
    });
    const dataAnon = await resAnon.json();
    console.log(`    - Anonymous cancel attempt: HTTP ${resAnon.status} (Expected 401/404)`);

    // 3b. Attacker with email only (attempting email matching bypass)
    const resEmailOnly = await fetch(`${host}/api/fareharbor/cancel`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        orderId: "ord_sample_123",
        email: "victim@example.com",
        bookingUuid: "mock-booking-uuid",
      }),
    });
    const dataEmailOnly = await resEmailOnly.json();
    console.log(`    - Email-only cancel attempt (no token): HTTP ${resEmailOnly.status} (Expected 401/404)`);

    results.push({
      step: `Live Route Security (${host})`,
      provider: "Next.js Route",
      status: (resAnon.status === 401 || resAnon.status === 404) ? "PASS" : "FAIL",
      details: { host, anonStatus: resAnon.status, emailOnlyStatus: resEmailOnly.status },
    });
  }

  console.log("\n==================================================================");
  console.log("LIVE PROVIDER & ROUTE VERIFICATION SUMMARY");
  console.log("==================================================================");
  console.table(results);
}

runLiveProviderChecks().catch((e) => {
  console.error("Execution failed:", e);
  process.exit(1);
});
