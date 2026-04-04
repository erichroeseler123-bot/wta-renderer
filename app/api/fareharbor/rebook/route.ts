import { getFareHarborCredentials } from "@/lib/fareharbor";

export async function POST(req: Request) {
  try {
    const { appKey, userKey } = getFareHarborCredentials();
    const { bookingUuid, newAvailabilityPk } = await req.json();

    const res = await fetch(
      `https://demo.fareharbor.com/api/external/v1/bookings/${bookingUuid}/rebook/`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-FareHarbor-API-App": appKey,
          "X-FareHarbor-API-User": userKey,
        },
        body: JSON.stringify({
          availability: newAvailabilityPk,
        }),
      }
    );

    const data = await res.json();
    return Response.json(data, { status: res.status });
  } catch (err: any) {
    return Response.json(
      { error: err.message || "Rebook failed" },
      { status: 500 }
    );
  }
}
