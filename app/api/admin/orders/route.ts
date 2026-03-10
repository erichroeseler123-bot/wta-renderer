import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "../_lib/auth";
import { listOrdersNeedingAttention, listRecentOrders } from "@/lib/orders";
import {
  clientIpFromHeaders,
  enforceRateLimit,
  logSecurityEvent,
  requestId,
} from "@/lib/security";

const ADMIN_SECRET = String(process.env.WTA_ADMIN_SECRET || "").trim();

function canUseSecretAuth(req: NextRequest) {
  if (!ADMIN_SECRET || ADMIN_SECRET.length < 40) return false;
  const provided = new URL(req.url).searchParams.get("secret");
  return Boolean(provided && provided === ADMIN_SECRET);
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

  const a = await requireAdmin();
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
      contact: {
        name: order.contact?.name || "",
        email: order.contact?.email || "",
      },
      items: (order.items || []).map((i) => ({
        title: i.title || "",
        company: i.company || "",
        startAt: i.startAt || "",
        qty: i.qty || 0,
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
    orders,
  });
}
