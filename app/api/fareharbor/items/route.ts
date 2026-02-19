import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const BASE = "https://fareharbor.com/api/external/v1";

function splitCompanies(v: string) {
  return v
    .split(/[,\s]+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

function safePreview(s: string, n = 800) {
  return (s || "").slice(0, n);
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
    const wantDebug = url.searchParams.get("debug") === "1";

    const APP = process.env.FAREHARBOR_APP_KEY ?? process.env.FH_APP_NAME ?? "";
    const USER = process.env.FAREHARBOR_USER_KEY ?? process.env.FH_API_KEY ?? "";
    if (!APP) throw new Error("Missing env var: FAREHARBOR_APP_KEY");
    if (!USER) throw new Error("Missing env var: FAREHARBOR_USER_KEY");

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
          error:
            "No companies configured. Set FAREHARBOR_COMPANY_SHORTNAME (or pass ?company=SHORTNAME).",
        },
        { status: 400 }
      );
    }

    const results: any[] = [];
    const errors: any[] = [];
    const debug: any[] = [];

    for (const shortname of companies) {
      const fhUrl = `${BASE}/companies/${encodeURIComponent(
        shortname
      )}/items/?api-user=${encodeURIComponent(USER)}`;

      const resp = await fetch(fhUrl, {
        headers: {
          "X-FareHarbor-API-App": APP,
          "X-FareHarbor-API-User": USER,
          Accept: "application/json",
          "User-Agent": "wta-ui/1.0 (+welcometoalaskatours.com)",
        },
        cache: "no-store",
      });

      const text = await resp.text();
      const ct = resp.headers.get("content-type") || "";

      if (!resp.ok) {
        errors.push({
          company: shortname,
          status: resp.status,
          statusText: resp.statusText,
          contentType: ct,
          fhUrl,
          bodyPreview: safePreview(text, 500),
        });
        continue;
      }

      let data: any = null;
      try {
        data = JSON.parse(text);
      } catch (e: any) {
        errors.push({
          company: shortname,
          status: resp.status,
          statusText: resp.statusText,
          contentType: ct,
          fhUrl,
          error: "Upstream JSON parse failed",
          bodyPreview: safePreview(text, 500),
        });
        continue;
      }

      const items = normalizeItems(data);

      for (const it of items) results.push({ ...it, company: shortname });

      if (wantDebug) {
        debug.push({
          company: shortname,
          contentType: ct,
          topKeys: data && typeof data === "object" && !Array.isArray(data) ? Object.keys(data).slice(0, 40) : null,
          upstreamCount: (data?.count ?? data?.total ?? data?.meta?.total ?? null),
          normalizedItemsLen: items.length,
          sampleItemKeys: items[0] && typeof items[0] === "object" ? Object.keys(items[0]).slice(0, 40) : null,
          bodyPreview: safePreview(text, 400),
        });
      }
    }

    return NextResponse.json({
      ok: true,
      count: results.length,
      companies,
      items: results,
      errorsCount: errors.length,
      errors: errors.slice(0, 20),
      debug: wantDebug ? debug : undefined,
    });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err?.message || String(err) },
      { status: 500 }
    );
  }
}
