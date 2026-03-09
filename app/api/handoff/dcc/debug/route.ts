import { NextResponse } from "next/server";
import { requireAdmin } from "@/app/api/admin/_lib/auth";
import { listRecentReceivedHandoffs } from "@/lib/handoff/dcc";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const a = await requireAdmin();
  if (!a.ok) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const limit = Math.max(1, Math.min(100, Number(searchParams.get("limit") || 25)));

  const rows = await listRecentReceivedHandoffs(limit);
  return NextResponse.json({
    success: true,
    count: rows.length,
    rows,
  });
}
