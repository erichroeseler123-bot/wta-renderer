import { getFareHarborCredentials, readFareHarborJson } from "@/lib/fareharbor";

const RESPONSE_HEADERS = { "Cache-Control": "private, no-store" };

export async function POST(req: Request) {
  try {
    const { appKey, userKey } = getFareHarborCredentials();
    const { bookingUuid, newAvailabilityPk } = await req.json();

    const res = await fetch(
      `https://fareharbor.com/api/external/v1/bookings/${encodeURIComponent(bookingUuid)}/rebook/`,
      {
        method: "POST",
        redirect: "error",
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

    if (!res.ok) {
      return Response.json(
        { error: "Rebook failed" },
        { status: res.status >= 400 ? res.status : 502, headers: RESPONSE_HEADERS },
      );
    }

    const data = await readFareHarborJson(res, appKey, userKey);
    return Response.json(data, { status: res.status, headers: RESPONSE_HEADERS });
  } catch {
    return Response.json(
      { error: "Rebook failed" },
      { status: 500, headers: RESPONSE_HEADERS },
    );
  }
}
