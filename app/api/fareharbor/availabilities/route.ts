const FH_BASE = "https://fareharbor.com/api/external/v1";

export async function GET() {
  const res = await fetch(
    `${FH_BASE}/companies/coastalhelicopters/items/17109/minimal/availabilities/date-range/2026-01-15/2026-01-30/`,
    {
      headers: {
        "X-FareHarbor-API-App": 1b11e391-582e-4e16-ac92-8feb4660a0b5,
        "X-FareHarbor-API-User": 1b11e391-582e-4e16-ac92-8feb4660a0b5,
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
