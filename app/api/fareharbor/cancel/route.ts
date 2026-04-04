import { getFareHarborCredentials } from "@/lib/fareharbor";
import { emitDccSatelliteEvent, inferDccSourceSlug } from "@/lib/dccSatellite";

export async function POST(req: Request) {
  try {
    const { appKey, userKey } = getFareHarborCredentials();
    const {
      bookingUuid,
      reason,
      handoffId,
      orderId,
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
      `https://demo.fareharbor.com/api/external/v1/bookings/${bookingUuid}/cancel/`,
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
    return Response.json(data, { status: res.status });
  } catch (err: any) {
    return Response.json(
      { error: err.message || "Cancel failed" },
      { status: 500 }
    );
  }
}
