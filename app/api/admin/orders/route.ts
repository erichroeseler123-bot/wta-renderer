import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "../_lib/auth";
import { listOrdersNeedingAttention, listRecentOrders } from "@/lib/orders";
import { stripe, stripeDashboardPrefix } from "@/lib/stripe";
import {
  clientIpFromHeaders,
  enforceRateLimit,
  logSecurityEvent,
  requestId,
} from "@/lib/security";

import crypto from "crypto";
import { isPlaceholderAdminSecret } from "@/lib/admin";

function canUseSecretAuth(req: NextRequest) {
  const adminSecret = String(process.env.WTA_ADMIN_SECRET || "").trim();
  if (!adminSecret || adminSecret.length < 40 || isPlaceholderAdminSecret(adminSecret)) {
    return false;
  }
  const provided = String(new URL(req.url).searchParams.get("secret") || "").trim();
  if (!provided) return false;
  const a = crypto.createHash("sha256").update(provided).digest();
  const b = crypto.createHash("sha256").update(adminSecret).digest();
  return crypto.timingSafeEqual(a, b);
}

type StripePaymentSummary = {
  status: string;
  amount: number;
  currency: string;
  created: string;
  last4: string | null;
  customerId: string | null;
  dashboardPaymentUrl: string;
  dashboardCustomerUrl: string | null;
};

async function fetchStripePaymentMap(paymentIntentIds: string[]) {
  const uniqueIds = [...new Set(paymentIntentIds.filter(Boolean))];
  if (!stripe || uniqueIds.length < 1) {
    return { map: new Map<string, StripePaymentSummary>(), error: null as string | null };
  }

  try {
    const paymentMap = new Map<string, StripePaymentSummary>();
    const list = await stripe.paymentIntents.list({
      limit: 100,
      created: { gt: Math.floor(Date.now() / 1000) - 60 * 60 * 24 * 30 },
      expand: ["data.latest_charge"],
    });

    const prefix = stripeDashboardPrefix();
    for (const pi of list.data) {
      if (!uniqueIds.includes(pi.id)) continue;

      const latestCharge =
        typeof pi.latest_charge === "string" || !pi.latest_charge ? null : pi.latest_charge;
      const last4 = latestCharge?.payment_method_details?.card?.last4 || null;
      const customerId = typeof pi.customer === "string" ? pi.customer : null;

      paymentMap.set(pi.id, {
        status: pi.status,
        amount: Number(pi.amount || 0) / 100,
        currency: String(pi.currency || "usd").toUpperCase(),
        created: new Date(pi.created * 1000).toISOString(),
        last4,
        customerId,
        dashboardPaymentUrl: `https://dashboard.stripe.com/${prefix}payments/${pi.id}`,
        dashboardCustomerUrl: customerId
          ? `https://dashboard.stripe.com/${prefix}customers/${customerId}`
          : null,
      });
    }

    return { map: paymentMap, error: null as string | null };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Stripe lookup failed";
    return { map: new Map<string, StripePaymentSummary>(), error: message };
  }
}

export async function GET(req: NextRequest) {
  const rid = requestId();
  const ip = clientIpFromHeaders(req.headers);

  const rl = await enforceRateLimit({
    key: `admin-orders:${ip}`,
    limit: 5,
    windowSec: 60,
  });
  if (!rl.ok) {
    logSecurityEvent("rate_limited_admin_orders", { rid, ip, retryAfterSec: rl.retryAfterSec });
    return NextResponse.json({ success: false, error: "Too many requests" }, { status: 429 });
  }

  const a = await requireAdmin(req);
  const secretOk = canUseSecretAuth(req);
  if (!a.ok && !secretOk) {
    logSecurityEvent("admin_access_denied", { rid, ip, route: "/api/admin/orders" });
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const limit = Math.max(1, Math.min(100, Number(searchParams.get("limit") || 50)));
  const scope = String(searchParams.get("scope") || "needs_attention").toLowerCase();

  const sourceOrders =
    scope === "recent"
      ? await listRecentOrders(limit)
      : await listOrdersNeedingAttention(limit);

  const paymentIntentIds = sourceOrders
    .map((order) => String(order.payment_intent_id || ""))
    .filter(Boolean);
  const stripePayments = scope === "recent" ? await fetchStripePaymentMap(paymentIntentIds) : null;

  const orders = sourceOrders
    .map((order) => ({
      order_id: order.order_id,
      status: order.status,
      paidAt: order.paidAt,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
      totalCents: order.totalCents,
      currency: order.currency,
      payment_intent_id: order.payment_intent_id,
      bookingAttempts: order.bookingAttempts,
      bookingResults: order.bookingResults || [],
      confirmationEmailSentAt: order.confirmationEmailSentAt,
      confirmationEmailError: order.confirmationEmailError,
      lastError: order.lastError,
      stripeData: stripePayments?.map.get(String(order.payment_intent_id || "")) || null,
      contact: {
        name: order.contact?.name || "",
        email: order.contact?.email || "",
      },
      attribution: order.attribution || null,
      items: (order.items || []).map((i) => ({
        title: i.title || "",
        company: i.company || "",
        itemPk: i.itemPk || 0,
        startAt: i.startAt || "",
        qty: i.qty || 0,
        widgetPlacement: i.widgetPlacement || null,
        embedDomain: i.embedDomain || null,
        widgetId: i.widgetId || null,
      })),
    }))
    .sort(
      (x, y) =>
        new Date(y.createdAt || 0).getTime() - new Date(x.createdAt || 0).getTime(),
    );

  return NextResponse.json({
    success: true,
    scope,
    count: orders.length,
    timestamp: new Date().toISOString(),
    stripeLookupError: stripePayments?.error || null,
    orders,
  });
}
