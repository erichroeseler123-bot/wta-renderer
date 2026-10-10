import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getKV } from "@/lib/kv";
import { getOrderByPaymentIntent } from "@/lib/orders";
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

  // The cancellation token is sensitive and allows initiating cancellation.
  // It is ONLY revealed if the caller presents the matching Stripe client_secret
  // from their active browser checkout session, or an authenticated administrator.
  const isAuthorizedForToken = Boolean(
    isAdmin || (clientSecret && clientSecret.startsWith(pi + "_secret_"))
  );

  const receipt = await kv.get<Record<string, unknown>>(`receipt:${pi}`);
  if (receipt) {
    let token = receipt.cancel_token;
    if (!token && isAuthorizedForToken) {
      const order = await getOrderByPaymentIntent(pi);
      token = order?.cancel_token;
    }
    return NextResponse.json({
      success: true,
      ...receipt,
      // Redact cancel_token unless authorized by client_secret or admin
      cancel_token: isAuthorizedForToken ? (token || null) : null,
    });
  }

  const order = await getOrderByPaymentIntent(pi);
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
