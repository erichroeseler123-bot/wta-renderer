import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import Stripe from "stripe";
import { getFareHarborCredentials } from "@/lib/fareharbor";
import { emitDccSatelliteEvent, inferDccSourceSlug } from "@/lib/dccSatellite";
import {
  acquireOrderLock,
  getOrder,
  getOrderByPaymentIntent,
  releaseOrderLock,
  saveOrder,
  verifyOrderCancelToken,
  type OrderSnapshot,
  type OrderStatus,
} from "@/lib/orders";
import { isAdminCookieValue } from "@/lib/admin";
import {
  evaluateOrderCancellationPolicy,
  type CancellationReason,
} from "@/lib/cancellationPolicy";

export const runtime = "nodejs";

const ADMIN_SECRET = String(process.env.WTA_ADMIN_SECRET || "").trim();
const INTERNAL_SECRET = String(process.env.WTA_INTERNAL_SECRET || "").trim();

async function checkAdminAuth(req: NextRequest): Promise<boolean> {
  const adminSecret = String(process.env.WTA_ADMIN_SECRET || "").trim();
  const internalSecret = String(process.env.WTA_INTERNAL_SECRET || "").trim();

  // 1. Admin cookie
  try {
    const jar = await cookies();
    const raw = jar.get("wta_admin")?.value || "";
    if (isAdminCookieValue(raw)) return true;
  } catch {
    // ignore cookie lookup errors in non-browser context
  }

  // 2. Internal header
  const internalHdr = req.headers.get("x-wta-internal") || "";
  if (internalSecret && internalHdr === internalSecret) return true;

  // 3. Admin secret header or URL parameter
  const secretHdr = req.headers.get("x-wta-admin-secret") || "";
  if (adminSecret && adminSecret.length >= 20 && secretHdr === adminSecret) return true;

  const urlSecret = new URL(req.url).searchParams.get("secret");
  if (adminSecret && adminSecret.length >= 20 && urlSecret === adminSecret) return true;

  return false;
}

export async function POST(req: NextRequest) {
  let lockOrderId: string | null = null;
  try {
    const body = await req.json().catch(() => ({}));
    const {
      bookingUuid,
      reason,
      handoffId,
      orderId,
      paymentIntentId,
      cancelToken,
      adminOverride,
      adminRationale,
      adminRequestedCents,
      email,
      name,
      partySize,
      portSlug,
      eventDate,
      amount,
      currency,
      sourcePath,
      sourceSlug,
      topicSlug,
    } = body;

    const isAdmin = await checkAdminAuth(req);

    // Look up the order if identifiers provided
    let ord: OrderSnapshot | null = null;
    if (orderId) {
      ord = await getOrder(String(orderId).trim());
    }
    if (!ord && paymentIntentId) {
      ord = await getOrderByPaymentIntent(String(paymentIntentId).trim());
    }

    if (!ord && !isAdmin) {
      return NextResponse.json(
        { success: false, error: "Order not found. Valid orderId or paymentIntentId is required." },
        { status: 404 }
      );
    }

    // Step 1: Strict Ownership and Authorization Verification
    // Matching an email address is strictly NOT sufficient to authenticate cancellation.
    // The requester must be an authenticated administrator OR possess the secure, order-specific cancelToken.
    if (!isAdmin) {
      const isTokenValid = ord ? verifyOrderCancelToken(ord, String(cancelToken || "")) : false;
      if (!isTokenValid) {
        return NextResponse.json(
          {
            success: false,
            error: "Unauthorized. Administrator authorization or secure order cancellation token required.",
          },
          { status: 401 }
        );
      }
    }

    // Step 2: Idempotency & Repeated Request Guard
    // If order is already completely refunded or already cancelled, return existing state safely
    if (ord && (ord.status === "refunded" || (ord.refundStatus === "succeeded" && (ord.refundAmountCents || 0) >= ord.totalCents))) {
      return NextResponse.json({
        success: true,
        already_refunded: true,
        status: ord.status,
        orderId: ord.order_id,
        refund: {
          id: ord.refundId,
          amountCents: ord.refundAmountCents,
          status: ord.refundStatus || "succeeded",
        },
      });
    }

    if (ord && ord.status === "cancelled") {
      return NextResponse.json({
        success: true,
        already_cancelled: true,
        status: ord.status,
        orderId: ord.order_id,
        refund: null,
      });
    }

    // Acquire lock if order exists
    if (ord?.order_id) {
      const gotLock = await acquireOrderLock(ord.order_id, 60);
      if (!gotLock) {
        return NextResponse.json(
          { success: false, error: "Order is currently being processed. Please retry." },
          { status: 409 }
        );
      }
      lockOrderId = ord.order_id;
    }

    // Step 3: Server-Side Policy Evaluation & Refund Amount Calculation
    // The server calculates the allowed refund from the booked item’s terms, departure time, and cancellation reason.
    // Privilege check on cancellation reason:
    // Only administrators or internal webhooks with trusted operator evidence can submit exception reasons
    // (operator_cancelled, weather_safety, missed_ship, ship_delayed, medical_emergency).
    // If an unprivileged customer submits an exception reason, it is automatically downgraded to "customer_request".
    const EXCEPTION_REASONS = new Set([
      "operator_cancelled",
      "weather_safety",
      "missed_ship",
      "ship_delayed",
      "medical_emergency",
    ]);

    let effectiveReason: CancellationReason = "customer_request";
    if (typeof reason === "string" && EXCEPTION_REASONS.has(reason)) {
      if (isAdmin) {
        effectiveReason = reason as CancellationReason;
      } else {
        console.warn(`[cancel-route] Unprivileged customer attempted to claim exception reason "${reason}". Downgrading to "customer_request".`);
        effectiveReason = "customer_request";
      }
    }

    const policyResult = ord
      ? evaluateOrderCancellationPolicy({
          order: ord,
          reason: effectiveReason,
          now: new Date(),
          adminOverride: isAdmin && Boolean(adminOverride),
          adminRequestedCents: isAdmin && Boolean(adminOverride) ? Number(adminRequestedCents) : null,
          adminRationale: typeof adminRationale === "string" ? adminRationale : "",
        })
      : {
          eligible: false,
          refundPercentage: 0,
          allowedRefundCents: 0,
          feeDeductedCents: 0,
          hoursUntilDeparture: null,
          policyMatched: "no_order_record",
          explanation: "No order record found to evaluate policy against.",
          isOverrideApplied: false,
        };

    const centsToRefund = policyResult.allowedRefundCents;

    // Step 4: Execute and Verify FareHarbor Cancellation
    let fhData: Record<string, unknown> | null = null;
    let fhOk = false;
    let fhStatus = 200;

    if (bookingUuid) {
      const { appKey, userKey } = getFareHarborCredentials();
      const fhRes = await fetch(
        `https://fareharbor.com/api/external/v1/bookings/${encodeURIComponent(bookingUuid)}/cancel/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-FareHarbor-API-App": appKey,
            "X-FareHarbor-API-User": userKey,
          },
          body: JSON.stringify({ reason: reason || "Cancelled via Welcome to Alaska Tours" }),
        }
      );

      fhStatus = fhRes.status;
      fhData = await fhRes.json().catch(() => null);

      // Verify that FareHarbor cancellation explicitly succeeded
      fhOk = fhRes.ok && (!fhData || !fhData.error);

      if (!fhOk) {
        // FareHarbor cancellation FAILED. ABORT immediately before touching Stripe!
        return NextResponse.json(
          {
            success: false,
            error: (fhData?.error as string) || `FareHarbor cancellation failed with status ${fhStatus}`,
            details: fhData,
            policy: policyResult,
            refund: null,
          },
          { status: fhStatus || 400 }
        );
      }
    } else {
      // If no bookingUuid (e.g. manual order cancellation or pre-booking failure)
      fhOk = true;
    }

    // Step 5: Policy-Respecting Stripe Refund Processing
    let refundResult: { id?: string; status?: string | null; amount?: number } | null = null;
    let pi = paymentIntentId || ord?.payment_intent_id;
    let resultingStatus: OrderStatus = "cancelled";

    if (fhOk && pi && process.env.STRIPE_SECRET_KEY && centsToRefund > 0) {
      try {
        const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {});
        const isPartial = ord ? centsToRefund < ord.totalCents : false;

        // Deterministic idempotency key to prevent duplicate Stripe refunds
        const idempotencyKey = `wta-refund-${ord?.order_id || pi}-${bookingUuid || "all"}-${centsToRefund}`;

        const refund = await stripe.refunds.create(
          {
            payment_intent: pi,
            amount: isPartial ? centsToRefund : undefined,
            reason: "requested_by_customer",
          },
          { idempotencyKey }
        );

        refundResult = { id: refund.id, status: refund.status, amount: refund.amount };

        if (ord) {
          const newRefundTotal = (ord.refundAmountCents || 0) + centsToRefund;
          const isFull = newRefundTotal >= ord.totalCents;

          if (refund.status === "succeeded") {
            resultingStatus = isFull ? "refunded" : "partially_refunded";
            await saveOrder({
              ...ord,
              status: resultingStatus,
              refundId: refund.id,
              refundAmountCents: newRefundTotal,
              refundStatus: "succeeded",
              cancelledAt: new Date().toISOString(),
              cancellationReason: typeof reason === "string" ? reason : policyResult.policyMatched,
              lastError: undefined,
            });
          } else if (refund.status === "pending") {
            resultingStatus = "refund_pending";
            await saveOrder({
              ...ord,
              status: resultingStatus,
              refundId: refund.id,
              refundAmountCents: newRefundTotal,
              refundStatus: "pending",
              cancelledAt: new Date().toISOString(),
              cancellationReason: typeof reason === "string" ? reason : policyResult.policyMatched,
              lastError: undefined,
            });
          }
        }
      } catch (refundErr) {
        console.error("[cancel-route] Stripe refund error:", refundErr);
        const refundErrMsg = refundErr instanceof Error ? refundErr.message : String(refundErr);

        // Do NOT mark order as refunded if Stripe failed!
        // Mark as cancelled (since FareHarbor cancelled) and record lastError to trigger attention
        if (ord) {
          await saveOrder({
            ...ord,
            status: "cancelled",
            lastError: `FareHarbor cancelled successfully, but Stripe refund failed: ${refundErrMsg}`,
            cancelledAt: new Date().toISOString(),
            cancellationReason: typeof reason === "string" ? reason : undefined,
          });
        }
        return NextResponse.json(
          {
            success: false,
            error: `Booking cancelled in FareHarbor, but Stripe refund failed: ${refundErrMsg}`,
            policy: policyResult,
            fareharbor: fhData,
            refund: null,
          },
          { status: 502 }
        );
      }
    } else if (fhOk && ord && centsToRefund === 0) {
      // Non-refundable cancellation per operator contract (or $0 allowed)
      resultingStatus = "cancelled";
      await saveOrder({
        ...ord,
        status: resultingStatus,
        refundStatus: "none",
        refundAmountCents: 0,
        cancelledAt: new Date().toISOString(),
        cancellationReason: typeof reason === "string" ? reason : policyResult.policyMatched,
      });
    } else if (fhOk && ord) {
      resultingStatus = "cancelled";
      await saveOrder({
        ...ord,
        status: resultingStatus,
        refundStatus: "none",
        cancelledAt: new Date().toISOString(),
        cancellationReason: typeof reason === "string" ? reason : policyResult.policyMatched,
      });
    }

    // Step 6: Emit DCC Satellite Event
    if (handoffId) {
      await emitDccSatelliteEvent({
        handoffId: String(handoffId),
        satelliteId: "welcome-to-alaska",
        eventType: "booking_cancelled",
        sourcePath: typeof sourcePath === "string" ? sourcePath : "/api/fareharbor/cancel",
        externalReference: typeof orderId === "string" ? orderId : String(bookingUuid || ""),
        status: fhOk ? "cancelled" : "cancel_failed",
        stage: "cancellation",
        message: typeof reason === "string" ? reason : policyResult.explanation,
        traveler: {
          email: typeof email === "string" ? email : ord?.contact?.email,
          name: typeof name === "string" ? name : ord?.contact?.name,
          partySize: Number.isFinite(Number(partySize)) ? Number(partySize) : undefined,
        },
        attribution: {
          sourceSlug: inferDccSourceSlug(
            typeof sourcePath === "string" ? sourcePath : undefined,
            typeof sourceSlug === "string" ? sourceSlug : undefined,
          ),
          topicSlug: typeof topicSlug === "string" ? topicSlug : undefined,
        },
        booking: {
          portSlug: typeof portSlug === "string" ? portSlug : undefined,
          eventDate: typeof eventDate === "string" ? eventDate : undefined,
          amount: Number.isFinite(Number(amount)) ? Number(amount) : undefined,
          currency: typeof currency === "string" ? currency : undefined,
        },
      });
    }

    return NextResponse.json(
      {
        success: true,
        status: resultingStatus,
        policy: policyResult,
        fareharbor: fhData,
        refund: refundResult,
      },
      { status: fhStatus }
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      { success: false, error: message || "Cancel failed" },
      { status: 500 }
    );
  } finally {
    if (lockOrderId) {
      await releaseOrderLock(lockOrderId);
    }
  }
}
