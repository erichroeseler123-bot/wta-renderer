import { NextResponse } from "next/server";

const BASE = "https://demo.fareharbor.com/api/external/v1";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const company = searchParams.get("company");

  if (!company) {
    return NextResponse.json(
      { error: "Missing company shortname" },
      { status: 400 }
    );
  }

  const res = await fetch(
    `${BASE}/companies/${company}/items/`,
    {
      headers: {
        Accept: "application/json",
        "X-FareHarbor-API-App": process.env.FAREHARBOR_APP_KEY!,
        "X-FareHarbor-API-User": process.env.FAREHARBOR_USER_KEY!,
      },
      cache: "no-store",
    }
  );

  const data = await res.json();

  // 🔑 PASS THROUGH REAL ITEMS (INCLUDING pk)
  return NextResponse.json({
    company,
    items: data.items || [],
  });
}
