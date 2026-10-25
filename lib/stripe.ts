import Stripe from "stripe";

const secretKey = String(process.env.STRIPE_SECRET_KEY || "").trim();

export const stripe = secretKey
  ? new Stripe(secretKey, {
      apiVersion: "2026-01-28.clover",
    })
  : null;

let stripeClientOverride: Stripe | null = null;

export function setStripeClientForTests(client: Stripe | null) {
  stripeClientOverride = client;
}

export function getStripeClient(): Stripe | null {
  if (stripeClientOverride) return stripeClientOverride;
  const currentSecret = String(process.env.STRIPE_SECRET_KEY || "").trim();
  if (!currentSecret) return null;
  if (stripe && currentSecret === secretKey) return stripe;
  return new Stripe(currentSecret, {
    apiVersion: "2026-01-28.clover",
  });
}

export function stripeDashboardPrefix() {
  const currentSecret = String(process.env.STRIPE_SECRET_KEY || "").trim();
  if (currentSecret.startsWith("sk_test_")) return "test/";
  return "";
}

