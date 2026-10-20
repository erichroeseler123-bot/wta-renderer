import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import Stripe from "stripe";
import { getKV } from "@/lib/kv";
import {
  getOrderByPaymentIntent,
  hashClientSecret,
  verifyClientSecret,
  saveOrder,
} from "@/lib/orders";
import { isAdminCookieValue } from "@/lib/admin";

export const runtime = "nodejs";

const ADMIN_SECRET = String(process.env.WTA_ADMIN_SECRET || "").trim();
const INTERNAL_SECRET = String(process.env.WTA_INTERNAL_SECRET || "").trim();

async function checkAdminAuth(req: NextRequest): Promise<boolean> {
  const adminSecret = String(process.env.WTA_ADMIN_SECRET || "").trim();
  const internalSecret = String(process.env.WTA_INTERNAL_SECRET || "").trim();

  try {
    const jar = await cookies();
    const raw = jar.get("wta_admin")?.value || "";
    if (isAdminCookieValue(raw)) return true;
  } catch {
    // ignore
  }

  const internalHdr = req.headers.get("x-wta-internal") || "";
  if (internalSecret && internalHdr === internalSecret) return true;

  const secretHdr = req.headers.get("x-wta-admin-secret") || "";
  if (adminSecret && adminSecret.length >= 20 && secretHdr === adminSecret) return true;

  const urlSecret = new URL(req.url).searchParams.get("secret");
  if (adminSecret && adminSecret.length >= 20 && urlSecret === adminSecret) return true;

  return false;
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const pi = String(searchParams.get("pi") || "").trim();
  if (!pi) {
    return NextResponse.json({ success: false, error: "Missing ?pi=" }, { status: 400 });
  }

  const kv = await getKV();
  if (!kv) {
    return NextResponse.json({ success: false, error: "KV not configured" }, { status: 500 });
  }

  const clientSecret = String(searchParams.get("client_secret") || "").trim();
  const isAdmin = await checkAdminAuth(req);

  const receipt = await kv.get<Record<string, unknown>>(`receipt:${pi}`);
  const order = !receipt ? await getOrderByPaymentIntent(pi) : null;

  // The cancellation token is sensitive and allows initiating cancellation.
  // It is ONLY revealed if:
  // 1. Caller is an authenticated administrator, OR
  // 2. Caller presents the COMPLETE authentic Stripe client_secret matching the PaymentIntent.
  // Fabricated suffixes (e.g. pi_xxx_secret_fake) are strictly rejected.
  let isAuthorizedForToken = Boolean(isAdmin);

  if (!isAuthorizedForToken && clientSecret) {
    const storedHash =
      (typeof receipt?.client_secret_hash === "string" ? receipt.client_secret_hash : null) ||
      (order?.client_secret_hash || null);

    if (storedHash) {
      isAuthorizedForToken = verifyClientSecret(clientSecret, storedHash);
    } else if (process.env.STRIPE_SECRET_KEY) {
      // Fallback verification: Check complete secret against live Stripe PaymentIntent
      try {
        const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {});
        const livePi = await stripe.paymentIntents.retrieve(pi);
        if (livePi.client_secret) {
          const liveHash = hashClientSecret(livePi.client_secret);
          isAuthorizedForToken = verifyClientSecret(clientSecret, liveHash);
          if (isAuthorizedForToken) {
            // Backfill client_secret_hash in order and receipt
            const existingOrder = order || (await getOrderByPaymentIntent(pi));
            if (existingOrder) {
              existingOrder.client_secret_hash = liveHash;
              await saveOrder(existingOrder);
            }
          }
        }
      } catch (err) {
        console.warn("[receipt-route] Stripe client_secret verification error:", err);
        isAuthorizedForToken = false;
      }
    }
  }

  if (receipt) {
    let token = receipt.cancel_token;
    if (!token && isAuthorizedForToken) {
      const ord = await getOrderByPaymentIntent(pi);
      token = ord?.cancel_token;
    }
    return NextResponse.json({
      success: true,
      ...receipt,
      // Redact cancel_token unless authorized by verified complete client_secret or admin
      cancel_token: isAuthorizedForToken ? (token || null) : null,
    });
  }

  if (!order) {
    return NextResponse.json({ success: true, status: "pending" });
  }

  return NextResponse.json({
    success: true,
    status: order.status,
    order_id: order.order_id,
    payment_intent_id: order.payment_intent_id,
    totalCents: order.totalCents,
    currency: order.currency,
    contact: order.contact,
    attribution: order.attribution || null,
    results: order.bookingResults || [],
    lastError: order.lastError || null,
    // Redact cancel_token unless authorized by client_secret or admin
    cancel_token: isAuthorizedForToken ? (order.cancel_token || null) : null,
    updatedAt: order.updatedAt,
  });
}
