import { NextResponse } from "next/server";

const DEMO_BASE = "https://demo.fareharbor.com/api/external/v1";

export async function GET() {
  const appKey = process.env.FAREHARBOR_APP_KEY;
  const userKey = process.env.FAREHARBOR_USER_KEY;

  if (!appKey || !userKey) {
    return NextResponse.json(
      {
        error: "Missing FareHarbor env vars",
        hasAppKey: !!appKey,
        hasUserKey: !!userKey,
      },
      { status: 500 }
    );
  }

  try {
    const res = await fetch(`${DEMO_BASE}/companies/`, {
      headers: {
        Accept: "application/json",
        "X-FareHarbor-API-App": appKey,
        "X-FareHarbor-API-User": userKey,
      },
      cache: "no-store",
    });

    const text = await res.text();

    if (!res.ok) {
      return NextResponse.json(
        { error: "FareHarbor error", detail: text },
        { status: res.status }
      );
    }

    const data = JSON.parse(text);

    return NextResponse.json({
      source: "fareharbor-demo",
      companies: data.companies,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: "Internal error", detail: err.message },
      { status: 500 }
    );
  }
}
