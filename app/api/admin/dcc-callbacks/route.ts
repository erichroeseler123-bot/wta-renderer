import { NextResponse } from "next/server";
import { requireAdmin } from "@/app/api/admin/_lib/auth";
import { listRecentDccSatelliteCallbacks } from "@/lib/dccSatellite";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const auth = await requireAdmin();
  if (!auth.ok) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const limit = Math.max(1, Math.min(100, Number(searchParams.get("limit") || 25)));
  const widgetOnly = searchParams.get("widget") === "1";
  const rows = await listRecentDccSatelliteCallbacks(limit * 3);
  const filtered = widgetOnly
    ? rows.filter((row) => typeof row.payload?.metadata?.embedDomain === "string" && row.payload.metadata.embedDomain)
    : rows;

  return NextResponse.json({
    success: true,
    count: filtered.slice(0, limit).length,
    rows: filtered.slice(0, limit),
  });
}
