import { getFareHarborCredentials } from "@/lib/fareharbor";
import { emitDccSatelliteEvent, inferDccSourceSlug } from "@/lib/dccSatellite";
import { getOrder, saveOrder } from "@/lib/orders";
import Stripe from "stripe";

export async function POST(req: Request) {
  try {
    const { appKey, userKey } = getFareHarborCredentials();
    const {
      bookingUuid,
      reason,
      handoffId,
      orderId,
      paymentIntentId,
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
    } = await req.json();

    const res = await fetch(
      `https://fareharbor.com/api/external/v1/bookings/${bookingUuid}/cancel/`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-FareHarbor-API-App": appKey,
          "X-FareHarbor-API-User": userKey,
        },
        body: JSON.stringify({ reason }),
      }
    );

    const data = await res.json();

    let refundResult = null;
    if (res.ok && (orderId || paymentIntentId)) {
      try {
        let pi = paymentIntentId;
        let ord = null;
        if (orderId) {
          ord = await getOrder(orderId);
          if (ord?.payment_intent_id) {
            pi = ord.payment_intent_id;
          }
        }
        if (pi && process.env.STRIPE_SECRET_KEY) {
          const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {});
          const refund = await stripe.refunds.create({
            payment_intent: pi,
            reason: "requested_by_customer",
          });
          refundResult = { id: refund.id, status: refund.status };
          if (ord) {
            await saveOrder({
              ...ord,
              status: "refunded",
              lastError: undefined,
            });
          }
        }
      } catch (refundErr) {
        console.error("[cancel-route] Stripe refund error:", refundErr);
      }
    }

    if (handoffId) {
      await emitDccSatelliteEvent({
        handoffId: String(handoffId),
        satelliteId: "welcome-to-alaska",
        eventType: "booking_cancelled",
        sourcePath: typeof sourcePath === "string" ? sourcePath : "/api/fareharbor/cancel",
        externalReference: typeof orderId === "string" ? orderId : String(bookingUuid || ""),
        status: res.ok ? "cancelled" : "cancel_failed",
        stage: "cancellation",
        message: typeof reason === "string" ? reason : undefined,
        traveler: {
          email: typeof email === "string" ? email : undefined,
          name: typeof name === "string" ? name : undefined,
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
    return Response.json({ ...data, refund: refundResult }, { status: res.status });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return Response.json(
      { error: message || "Cancel failed" },
      { status: 500 }
    );
  }
}
