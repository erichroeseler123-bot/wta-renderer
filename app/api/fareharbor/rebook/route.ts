export async function POST(req: Request) {
  try {
    const { bookingUuid, newAvailabilityPk } = await req.json();

    const res = await fetch(
      `https://demo.fareharbor.com/api/external/v1/bookings/${bookingUuid}/rebook/`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-FareHarbor-API-App": process.env.FH_APP!,
          "X-FareHarbor-API-User": process.env.FH_USER!,
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
