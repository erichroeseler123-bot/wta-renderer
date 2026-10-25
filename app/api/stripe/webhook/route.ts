import { NextResponse } from "next/server";
import Stripe from "stripe";
import { getKV } from "@/lib/kv";
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
import { logServerError, requestId } from "@/lib/security";

export const runtime = "nodejs";

function getStripeClient() {
  const secret = String(process.env.STRIPE_SECRET_KEY || "");
  if (!secret) {
    throw new Error("Missing STRIPE_SECRET_KEY");
  }
  return new Stripe(secret, {});
}

function ok() {
  return NextResponse.json({ received: true });
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
  try {
    const stripe = getStripeClient();
    const kv = await getKV();
    if (!kv) {
      return NextResponse.json({ error: "KV not configured" }, { status: 500 });
    }

    const whSecret = String(process.env.STRIPE_WEBHOOK_SECRET || "");
    if (!whSecret) return NextResponse.json({ error: "Missing STRIPE_WEBHOOK_SECRET" }, { status: 500 });

    const sig = req.headers.get("stripe-signature");
    if (!sig) return NextResponse.json({ error: "Missing stripe-signature" }, { status: 400 });

    const raw = await req.text();
    const event = stripe.webhooks.constructEvent(raw, sig, whSecret);

    if (event.type !== "payment_intent.succeeded") return ok();

    const pi = event.data.object as Stripe.PaymentIntent;
    const piId = String(pi.id || "");
    if (!piId) return ok();

    const orderIdFromMeta = String(pi.metadata?.order_id || "");
    let order = orderIdFromMeta ? await getOrder(orderIdFromMeta) : null;
    if (!order) order = await getOrderByPaymentIntent(piId);

    if (!order) {
      await kv.set(
        `receipt:${piId}`,
        {
          status: "booking_failed",
          payment_intent_id: piId,
          lastError: "Missing order snapshot",
          results: [],
          updatedAt: new Date().toISOString(),
        },
        { ex: 60 * 60 * 24 * 30 },
      );
      return ok();
    }

    if (order.status === "booked") return ok();

    const gotLock = await acquireOrderLock(order.order_id, 120);
    if (!gotLock) return ok();

    try {
      const reloaded = (await getOrder(order.order_id)) || order;
      if (reloaded.status === "booked") return ok();

      const paid: OrderSnapshot = {
        ...reloaded,
        payment_intent_id: piId,
        paidAt: reloaded.paidAt || new Date().toISOString(),
        status: "booking_pending",
      };
      await saveOrder(paid);

      try {
        assertBookingsEnabled();
      } catch (e: unknown) {
        const err = e as Error;
        await markOrderFailed(paid, String(err?.message || e));
        return ok();
      }

      const { results, allOk } = await runFareHarborBookingsForOrder(paid, piId);

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

      return ok();
    } finally {
      await releaseOrderLock(order.order_id);
    }
  } catch (err: unknown) {
    logServerError("/api/stripe/webhook", rid, err);
    return NextResponse.json({ error: "Webhook error", request_id: rid }, { status: 400 });
  }
}
