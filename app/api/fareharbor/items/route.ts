import { NextResponse } from "next/server";
import { getFareHarborCredentials } from "@/lib/fareharbor";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const BASE = "https://fareharbor.com/api/external/v1";
const RESPONSE_HEADERS = { "Cache-Control": "private, no-store" };

function splitCompanies(v: string) {
  return v
    .split(/[,\s]+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

function normalizeItems(data: any): any[] {
  // FareHarbor responses vary; handle the common shapes
  if (Array.isArray(data)) return data;

  const candidates = [
    data?.items,
    data?.results,
    data?.data,
    data?.objects,
    data?.payload?.items,
    data?.payload?.results,
  ];

  for (const c of candidates) {
    if (Array.isArray(c)) return c;
  }

  // Sometimes items are nested like { items: { results: [...] } }
  const nested = [
    data?.items?.results,
    data?.items?.data,
    data?.results?.items,
  ];
  for (const c of nested) {
    if (Array.isArray(c)) return c;
  }

  return [];
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const { appKey, userKey } = getFareHarborCredentials();

    const companyParam = (url.searchParams.get("company") || "").trim();
    const envCompanies = splitCompanies(
      process.env.FAREHARBOR_COMPANY_SHORTNAME ??
        process.env.FAREHARBOR_COMPANY ??
        ""
    );

    const companies = companyParam ? [companyParam] : envCompanies;

    if (!companies.length) {
      return NextResponse.json(
        {
          ok: false,
          error: "No FareHarbor companies specified.",
        },
        { status: 400, headers: RESPONSE_HEADERS }
      );
    }

    const results: any[] = [];
    const errors: Array<{ company: string; status: number; error: string }> = [];

    for (const shortname of companies) {
      const fhUrl = `${BASE}/companies/${encodeURIComponent(shortname)}/items/`;

      const resp = await fetch(fhUrl, {
        headers: {
          "X-FareHarbor-API-App": appKey,
          "X-FareHarbor-API-User": userKey,
          Accept: "application/json",
          "User-Agent": "wta-ui/1.0 (+welcometoalaskatours.com)",
        },
        cache: "no-store",
      });

      if (!resp.ok) {
        errors.push({
          company: shortname,
          status: resp.status,
          error: "FareHarbor items request failed.",
        });
        continue;
      }

      let data: unknown;
      try {
        data = await resp.json();
      } catch {
        errors.push({
          company: shortname,
          status: resp.status,
          error: "Invalid FareHarbor items response.",
        });
        continue;
      }

      const items = normalizeItems(data);

      for (const it of items) results.push({ ...it, company: shortname });
    }

    const body = JSON.stringify({
      ok: true,
      count: results.length,
      companies,
      items: results,
      errorsCount: errors.length,
      errors: errors.slice(0, 20),
    });
    // Preserve the catalog shape while refusing any credential echoed by the upstream API.
    if (body.includes(appKey) || body.includes(userKey)) {
      return NextResponse.json(
        { ok: false, error: "Invalid FareHarbor items response." },
        { status: 502, headers: RESPONSE_HEADERS }
      );
    }
    return new NextResponse(body, {
      headers: { ...RESPONSE_HEADERS, "Content-Type": "application/json" },
    });
  } catch {
    return NextResponse.json(
      { ok: false, error: "FareHarbor items are temporarily unavailable." },
      { status: 500, headers: RESPONSE_HEADERS }
    );
  }
}
