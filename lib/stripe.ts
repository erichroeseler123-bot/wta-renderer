import Stripe from "stripe";

const secretKey = String(process.env.STRIPE_SECRET_KEY || "").trim();

export const stripe = secretKey
  ? new Stripe(secretKey, {
      apiVersion: "2024-06-20",
    })
  : null;

export function stripeDashboardPrefix() {
  if (secretKey.startsWith("sk_test_")) return "test/";
  return "";
}
