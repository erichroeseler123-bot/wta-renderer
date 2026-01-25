export async function POST(req: Request) {
  try {
    const { bookingUuid, reason } = await req.json();

    const res = await fetch(
      `https://demo.fareharbor.com/api/external/v1/bookings/${bookingUuid}/cancel/`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-FareHarbor-API-App": process.env.FH_APP!,
          "X-FareHarbor-API-User": process.env.FH_USER!,
        },
        body: JSON.stringify({ reason }),
      }
    );

    const data = await res.json();
    return Response.json(data, { status: res.status });
  } catch (err: any) {
    return Response.json(
      { error: err.message || "Cancel failed" },
      { status: 500 }
    );
  }
}
