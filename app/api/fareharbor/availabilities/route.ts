const FH_BASE = "https://fareharbor.com/api/external/v1";

export async function GET() {
  const res = await fetch(
    `${FH_BASE}/companies/coastalhelicopters/items/17109/minimal/availabilities/date-range/2025-01-15/2025-01-31/`,
    {
      headers: {
        "X-FareHarbor-API-App": process.env.FAREHARBOR_APP_KEY!,
        "X-FareHarbor-API-User": process.env.FAREHARBOR_USER_KEY!,
      },
      cache: "no-store",
    }
  );

  const data = await res.json();
  return Response.json(data);
}
