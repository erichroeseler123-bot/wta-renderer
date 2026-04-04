import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "../_lib/auth";
import { listRecentPlanEvents } from "@/lib/planTelemetry";

const ADMIN_SECRET = String(process.env.WTA_ADMIN_SECRET || "").trim();

function canUseSecretAuth(req: NextRequest) {
  if (!ADMIN_SECRET || ADMIN_SECRET.length < 40) return false;
  const provided = new URL(req.url).searchParams.get("secret");
  return Boolean(provided && provided === ADMIN_SECRET);
}

export async function GET(req: NextRequest) {
  const admin = await requireAdmin();
  const secretOk = canUseSecretAuth(req);
  if (!admin.ok && !secretOk) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const limit = Math.max(1, Math.min(100, Number(searchParams.get("limit") || 50)));
  const events = await listRecentPlanEvents(limit);

  return NextResponse.json({
    success: true,
    count: events.length,
    timestamp: new Date().toISOString(),
    events,
  });
}
