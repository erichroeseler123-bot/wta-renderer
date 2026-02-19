import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const BASE = "https://fareharbor.com/api/external/v1";

// Put candidate PKs here:
const PKS: number[] = [195597, 195600, 195602];

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const company = (url.searchParams.get("company") || "").trim();
    if (!company) {
      return NextResponse.json(
        { ok: false, error: "missing ?company=" },
        { status: 400 }
      );
    }

    const APP = process.env.FAREHARBOR_APP_KEY ?? process.env.FH_APP_NAME ?? "";
    const USER = process.env.FAREHARBOR_USER_KEY ?? process.env.FH_API_KEY ?? "";
    if (!APP || !USER) {
      return NextResponse.json({ ok: false, error: "missing env" }, { status: 500 });
    }

    const results: any[] = [];

    for (const pk of PKS) {
      const fhUrl =
        `${BASE}/companies/${encodeURIComponent(company)}/items/${encodeURIComponent(String(pk))}` +
        `/minimal/availabilities/date-range/2026-02-01/2026-02-02/?api-user=${encodeURIComponent(USER)}`;

      const resp = await fetch(fhUrl, {
        headers: {
          "X-FareHarbor-API-App": APP,
          "X-FareHarbor-API-User": USER,
          Accept: "application/json",
        },
        cache: "no-store",
      });

      const text = await resp.text();
      results.push({
        pk,
        status: resp.status,
        ok: resp.ok,
        bodyPreview: text.slice(0, 200),
      });
    }

    return NextResponse.json({ ok: true, company, tested: PKS.length, results });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || String(e) }, { status: 500 });
  }
}
