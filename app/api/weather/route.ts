import { NextRequest, NextResponse } from "next/server";

export const runtime = "edge"; // fast + cheap
export const revalidate = 300; // cache 5 minutes

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const lat = searchParams.get("lat");
  const lon = searchParams.get("lon");

  if (!lat || !lon) {
    return NextResponse.json({ error: "Missing lat/lon" }, { status: 400 });
  }

  const url =
    `https://api.open-meteo.com/v1/forecast` +
    `?latitude=${encodeURIComponent(lat)}` +
    `&longitude=${encodeURIComponent(lon)}` +
    `&current=temperature_2m,precipitation,wind_speed_10m,weather_code` +
    `&temperature_unit=fahrenheit&wind_speed_unit=mph&precipitation_unit=inch`;

  const res = await fetch(url, { next: { revalidate: 300 } });
  if (!res.ok) {
    return NextResponse.json({ error: "Weather fetch failed" }, { status: 502 });
  }

  const data = await res.json();
  return NextResponse.json({
    fetchedAt: new Date().toISOString(),
    current: data.current,
  });
}
