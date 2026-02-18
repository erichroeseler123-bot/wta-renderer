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

function mustEnv(name: string) {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env var: ${name}`);
  return v;
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);

    const APP = process.env.FAREHARBOR_APP_KEY ?? process.env.FH_APP_NAME ?? "";
    const USER = process.env.FAREHARBOR_USER_KEY ?? process.env.FH_API_KEY ?? "";
    if (!APP) throw new Error("Missing env var: FAREHARBOR_APP_KEY");
    if (!USER) throw new Error("Missing env var: FAREHARBOR_USER_KEY");

    // If caller passes ?company=, just use that.
    // Otherwise default to env-configured company/companies.
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

    for (const shortname of companies) {
      const fhUrl = `${BASE}/companies/${encodeURIComponent(shortname)}/items/?api-user=${encodeURIComponent(USER)}`;

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

      if (!resp.ok) {
        errors.push({
          company: shortname,
          status: resp.status,
          statusText: resp.statusText,
          fhUrl,
          bodyPreview: text.slice(0, 500),
        });
        continue;
      }

      const data = JSON.parse(text);
      const items = Array.isArray(data?.items) ? data.items : [];
      for (const it of items) results.push({ ...it, company: shortname });
    }

    return NextResponse.json({
      ok: true,
      count: results.length,
      companies,
      items: results,
      errorsCount: errors.length,
      errors: errors.slice(0, 20), // cap
    });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err?.message || String(err) },
      { status: 500 }
    );
  }
}
