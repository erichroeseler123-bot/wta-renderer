import { NextResponse } from "next/server";
import { getFareHarborCredentials, readFareHarborJson } from "@/lib/fareharbor";

const BASE = "https://demo.fareharbor.com/api/external/v1";
const COMPANY = "bodyglove"; // demo company shortname
const RESPONSE_HEADERS = { "Cache-Control": "private, no-store" };

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const itemPk = searchParams.get("itemPk");
  const date =
    searchParams.get("date") ||
    new Date().toISOString().split("T")[0]; // YYYY-MM-DD

  if (!itemPk) {
    return NextResponse.json(
      { error: "Missing itemPk" },
      { status: 400, headers: RESPONSE_HEADERS }
    );
  }

  const url = `${BASE}/companies/${COMPANY}/items/${encodeURIComponent(itemPk)}/minimal/availabilities/date/${encodeURIComponent(date)}/`;

  try {
    const { appKey, userKey } = getFareHarborCredentials();
    const res = await fetch(url, {
      headers: {
        Accept: "application/json",
        "X-FareHarbor-API-App": appKey,
        "X-FareHarbor-API-User": userKey,
      },
      cache: "no-store",
      redirect: "error",
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: "Availability fetch failed" },
        { status: res.status >= 400 ? res.status : 502, headers: RESPONSE_HEADERS },
      );
    }

    const data = await readFareHarborJson(res, appKey, userKey);
    return NextResponse.json(data, { status: res.status, headers: RESPONSE_HEADERS });
  } catch {
    return NextResponse.json(
      { error: "Availability fetch failed" },
      { status: 500, headers: RESPONSE_HEADERS },
    );
  }
}
