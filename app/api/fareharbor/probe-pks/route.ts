import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const BASE = "https://fareharbor.com/api/external/v1";

// Put candidate PKs here (you can add 20-50)
const PKS = [ /* 123456, 195597, ... */ ];

export async function GET(req: Request) {
  const url = new URL(req.url);
  const company = (url.searchParams.get("company") || "").trim();
  if (!company) return NextResponse.json({ ok:false, error:"missing ?company=" }, { status: 400 });

  const APP = process.env.FAREHARBOR_APP_KEY ?? "";
  const USER = process.env.FAREHARBOR_USER_KEY ?? "";
  if (!APP || !USER) return NextResponse.json({ ok:false, error:"missing env" }, { status: 500 });

  const results: any[] = [];

  for (const pk of PKS) {
    const fhUrl =
      `${BASE}/companies/${encodeURIComponent(company)}/items/${encodeURIComponent(String(pk))}` +
      `/minimal/availabilities/date-range/2026-02-01/2026-02-02/?api-user=${encodeURIComponent(USER)}&api-app=${encodeURIComponent(APP)}`;

    const resp = await fetch(fhUrl, {
      headers: {
        "X-FareHarbor-API-App": APP,
        "X-FareHarbor-API-User": USER,
        "Accept": "application/json",
      },
      cache: "no-store",
    });

    const text = await resp.text();
    results.push({
      pk,
      status: resp.status,
      ok: resp.ok,
      bodyPreview: text.slice(0, 140),
    });
  }

  return NextResponse.json({ ok:true, company, tested: PKS.length, results });
}
