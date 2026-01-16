const FH_BASE = "https://fareharbor.com/api/external/v1";

export async function GET() {
  const res = await fetch(
    `${FH_BASE}/companies/coastalhelicopters/items/17109/minimal/availabilities/date-range/2026-01-15/2026-01-30/`,
    {
      headers: {
        "X-FareHarbor-API-App": process.env.FAREHARBOR_APP_KEY!,
        "X-FareHarbor-API-User": process.env.FAREHARBOR_USER_KEY!,
      },
      cache: "no-store",
    }
  );

  if (!res.ok) {
    return Response.json(
      { error: "FareHarbor request failed" },
      { status: 500 }
    );
  }

  const data = await res.json();
  return Response.json(data);
}
