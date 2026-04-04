import { NextResponse } from "next/server";
import { getFareHarborCredentials } from "@/lib/fareharbor";

const BASE = "https://demo.fareharbor.com/api/external/v1";
const COMPANY = "bodyglove"; // demo company shortname

export async function GET(req: Request) {
  const { appKey, userKey } = getFareHarborCredentials();
  const { searchParams } = new URL(req.url);
  const itemPk = searchParams.get("itemPk");
  const date =
    searchParams.get("date") ||
    new Date().toISOString().split("T")[0]; // YYYY-MM-DD

  if (!itemPk) {
    return NextResponse.json(
      { error: "Missing itemPk" },
      { status: 400 }
    );
  }

  const url = `${BASE}/companies/${COMPANY}/items/${itemPk}/minimal/availabilities/date/${date}/`;

  try {
    const res = await fetch(url, {
      headers: {
        Accept: "application/json",
        "X-FareHarbor-API-App": appKey,
        "X-FareHarbor-API-User": userKey,
      },
      cache: "no-store",
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Availability fetch failed" },
      { status: 500 }
    );
  }
}
