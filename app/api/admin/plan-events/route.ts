import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "../_lib/auth";
import { listRecentPlanEvents } from "@/lib/planTelemetry";

import crypto from "crypto";
import { isPlaceholderAdminSecret } from "@/lib/admin";

function canUseSecretAuth(req: NextRequest) {
  const adminSecret = String(process.env.WTA_ADMIN_SECRET || "").trim();
  if (!adminSecret || adminSecret.length < 40 || isPlaceholderAdminSecret(adminSecret)) {
    return false;
  }
  const provided = String(new URL(req.url).searchParams.get("secret") || "").trim();
  if (!provided) return false;
  const a = crypto.createHash("sha256").update(provided).digest();
  const b = crypto.createHash("sha256").update(adminSecret).digest();
  return crypto.timingSafeEqual(a, b);
}

export async function GET(req: NextRequest) {
  const admin = await requireAdmin(req);
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
