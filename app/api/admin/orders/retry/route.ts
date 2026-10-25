import { NextResponse } from "next/server";
import { requireAdmin } from "../../_lib/auth";
import {
  acquireOrderLock,
  getOrder,
  releaseOrderLock,
  saveOrder,
  type OrderSnapshot,
} from "@/lib/orders";
import { runFareHarborBookingsForOrder } from "@/lib/bookingRunner";
import { assertBookingsEnabled } from "@/lib/fareharbor";

async function markOrderFailed(order: OrderSnapshot, reason: string) {
  await saveOrder({
    ...order,
    status: "booking_failed",
    bookingAttempts: (order.bookingAttempts || 0) + 1,
    lastError: reason,
  });
}

export async function POST(req: Request) {
  const a = await requireAdmin(req);
  if (!a.ok) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const orderId = String(body?.order_id || "").trim();
  if (!orderId) return NextResponse.json({ success: false, error: "Missing order_id" }, { status: 400 });

  const forceRebookAfterManualCheck = body?.force_rebook_after_manual_check === true;

  const order = await getOrder(orderId);
  if (!order) return NextResponse.json({ success: false, error: "Order not found" }, { status: 404 });

  if (!order.payment_intent_id) {
    return NextResponse.json({ success: false, error: "Order is missing payment_intent_id" }, { status: 409 });
  }

  const gotLock = await acquireOrderLock(order.order_id, 120);
  if (!gotLock) {
    return NextResponse.json({ success: false, error: "Order is currently being processed" }, { status: 409 });
  }

  try {
    const latest = (await getOrder(order.order_id)) || order;
    if (latest.status === "booked") {
      return NextResponse.json({ success: true, status: "booked", order: latest });
    }

    const hasPriorAmbiguousTimeout =
      Array.isArray(latest.bookingResults) &&
      latest.bookingResults.some((r) => r?.ambiguousTimeout === true);

    if (hasPriorAmbiguousTimeout && !forceRebookAfterManualCheck) {
      return NextResponse.json(
        {
          success: false,
          code: "ambiguous_provider_timeout_requires_manual_check",
          error:
            "Prior booking attempt timed out after dispatch. Verify with the operator in FareHarbor whether the voucher was created before forcing a re-book.",
          order: latest,
        },
        { status: 409 },
      );
    }

    const pending: OrderSnapshot = {
      ...latest,
      status: "booking_pending",
      lastError: undefined,
    };
    await saveOrder(pending);

    try {
      assertBookingsEnabled();
    } catch (e: unknown) {
      const err = e as Error;
      await markOrderFailed(pending, String(err?.message || e));
      const failed = await getOrder(order.order_id);
      return NextResponse.json({ success: false, error: "Bookings disabled", order: failed }, { status: 409 });
    }

    const paymentIntentId = pending.payment_intent_id;
    if (!paymentIntentId) {
      await markOrderFailed(pending, "Order is missing payment_intent_id");
      const failed = await getOrder(order.order_id);
      return NextResponse.json({ success: false, error: "Missing payment_intent_id", order: failed }, { status: 409 });
    }

    const { results, allOk } = await runFareHarborBookingsForOrder(pending, paymentIntentId, {
      forceRebookAfterManualCheck,
    });

    const firstError = results
      .map((x) => (typeof x.error === "string" ? x.error : ""))
      .find((x) => x.length > 0);

    const done = await saveOrder({
      ...pending,
      bookingResults: results,
      bookingAttempts: (pending.bookingAttempts || 0) + 1,
      status: allOk ? "booked" : "booking_failed",
      lastError: allOk ? undefined : firstError || "One or more FareHarbor bookings failed",
    });

    return NextResponse.json({ success: allOk, status: done.status, order: done, results });
  } finally {
    await releaseOrderLock(order.order_id);
  }
}
