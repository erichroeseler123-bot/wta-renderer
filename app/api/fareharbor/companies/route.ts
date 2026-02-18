import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const BASE = "https://fareharbor.com/api/external/v1";

function mustEnv(name: string) {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env var: ${name}`);
  return v;
}

export async function GET() {
  try {
    const APP = (process.env.FAREHARBOR_APP_KEY ?? process.env.FH_APP_NAME ?? "");
  if (!APP) throw new Error("Missing env var: FAREHARBOR_APP_KEY");
    const USER = (process.env.FAREHARBOR_USER_KEY ?? process.env.FH_API_KEY ?? "");
  if (!USER) throw new Error("Missing env var: FAREHARBOR_USER_KEY");

    const fhUrl = `${BASE}/companies/`;

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
      return NextResponse.json(
        {
          ok: false,
          error: `FareHarbor request failed ${resp.status} ${resp.statusText}`,
          fhUrl,
          bodyPreview: text.slice(0, 400),
        },
        { status: 500 },
      );
    }

    const data = JSON.parse(text);
    const companies = data.companies ?? [];

    return NextResponse.json({
      ok: true,
      count: companies.length,
      companies,
    });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err?.message || String(err) },
      { status: 500 },
    );
  }
}
