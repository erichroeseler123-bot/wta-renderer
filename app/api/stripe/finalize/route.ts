import { NextResponse } from "next/server";
import Stripe from "stripe";
import {
  acquireOrderLock,
  getOrder,
  getOrderByPaymentIntent,
  releaseOrderLock,
  saveOrder,
  type OrderSnapshot,
} from "@/lib/orders";
import { runFareHarborBookingsForOrder } from "@/lib/bookingRunner";
import { assertBookingsEnabled } from "@/lib/fareharbor";
import { maybeSendBookingConfirmationEmail } from "@/lib/bookingEmail";
import {
  clientIpFromHeaders,
  enforceRateLimit,
  logSecurityEvent,
  logServerError,
  requestId,
} from "@/lib/security";

export const runtime = "nodejs";

function jsonError(message: string, status = 400, extra?: Record<string, unknown>) {
  return NextResponse.json({ success: false, error: message, ...(extra || {}) }, { status });
}

function getStripeClient() {
  const secret = String(process.env.STRIPE_SECRET_KEY || "");
  if (!secret) throw new Error("Missing STRIPE_SECRET_KEY");
  return new Stripe(secret, {});
}

async function markOrderFailed(order: OrderSnapshot, reason: string) {
  await saveOrder({
    ...order,
    status: "booking_failed",
    bookingAttempts: (order.bookingAttempts || 0) + 1,
    lastError: reason,
  });
}

export async function POST(req: Request) {
  const rid = requestId();
  const ip = clientIpFromHeaders(req.headers);
  try {
    const rl = await enforceRateLimit({
      key: `finalize:${ip}`,
      limit: 20,
      windowSec: 60,
    });
    if (!rl.ok) {
      logSecurityEvent("rate_limited_finalize", { rid, ip, retryAfterSec: rl.retryAfterSec });
      const r = jsonError("Too many finalize attempts. Please wait and try again.", 429, {
        request_id: rid,
      });
      r.headers.set("Retry-After", String(rl.retryAfterSec));
      return r;
    }

    const body = await req.json().catch(() => ({}));
    const piId = String(body?.payment_intent_id || body?.pi || "").trim();
    if (!piId) return jsonError("Missing payment_intent_id", 400);

    const stripe = getStripeClient();
    const pi = await stripe.paymentIntents.retrieve(piId);
    if (!pi?.id) return jsonError("Payment intent not found", 404);

    if (pi.status !== "succeeded") {
      return NextResponse.json({
        success: false,
        status: pi.status,
        payment_intent_id: pi.id,
        error: "Payment not finalized yet",
        request_id: rid,
      });
    }

    const orderIdFromMeta = String(pi.metadata?.order_id || "");
    let order = orderIdFromMeta ? await getOrder(orderIdFromMeta) : null;
    if (!order) order = await getOrderByPaymentIntent(pi.id);
    if (!order) return jsonError("Order snapshot not found for payment intent", 404, { payment_intent_id: pi.id });

    if (order.status === "booked") {
      return NextResponse.json({
        success: true,
        status: order.status,
        order_id: order.order_id,
        payment_intent_id: pi.id,
        request_id: rid,
      });
    }

    const gotLock = await acquireOrderLock(order.order_id, 120);
    if (!gotLock) {
      return NextResponse.json({
        success: false,
        status: "busy",
        order_id: order.order_id,
        payment_intent_id: pi.id,
        request_id: rid,
      });
    }

    try {
      const reloaded = (await getOrder(order.order_id)) || order;
      if (reloaded.status === "booked") {
        return NextResponse.json({
          success: true,
          status: reloaded.status,
          order_id: reloaded.order_id,
          payment_intent_id: pi.id,
          request_id: rid,
        });
      }

      const paid: OrderSnapshot = {
        ...reloaded,
        payment_intent_id: pi.id,
        paidAt: reloaded.paidAt || new Date().toISOString(),
        status: "booking_pending",
      };
      await saveOrder(paid);

      try {
        assertBookingsEnabled();
      } catch (e: unknown) {
        const err = e as Error;
        await markOrderFailed(paid, String(err?.message || e));
        return jsonError("Bookings disabled", 409, { status: "booking_failed" });
      }

      const { results, allOk } = await runFareHarborBookingsForOrder(paid, pi.id);
      const firstError = results
        .map((x) => (typeof x.error === "string" ? x.error : ""))
        .find((x) => x.length > 0);

      const done = await saveOrder({
        ...paid,
        bookingResults: results,
        bookingAttempts: (paid.bookingAttempts || 0) + 1,
        status: allOk ? "booked" : "booking_failed",
        lastError: allOk ? undefined : firstError || "One or more FareHarbor bookings failed",
      });

      if (allOk) {
        await maybeSendBookingConfirmationEmail(done);
      }

      return NextResponse.json({
        success: allOk,
        status: done.status,
        order_id: done.order_id,
        payment_intent_id: pi.id,
        results,
        request_id: rid,
      });
    } finally {
      await releaseOrderLock(order.order_id);
    }
  } catch (e: unknown) {
    logServerError("/api/stripe/finalize", rid, e, { ip });
    return jsonError("Finalize failed", 500, { request_id: rid });
  }
}
