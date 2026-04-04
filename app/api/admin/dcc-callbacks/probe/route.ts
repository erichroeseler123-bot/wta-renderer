import { NextResponse } from "next/server";
import { requireAdmin } from "@/app/api/admin/_lib/auth";
import { emitDccSatelliteEvent } from "@/lib/dccSatellite";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST() {
  const auth = await requireAdmin();
  if (!auth.ok) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const handoffId = `probe_${Date.now()}`;
  const row = await emitDccSatelliteEvent({
    handoffId,
    satelliteId: "welcome-to-alaska",
    eventType: "status_updated",
    source: "wta",
    sourcePath: "/api/admin/dcc-callbacks/probe",
    externalReference: `probe:${handoffId}`,
    status: "probe",
    stage: "admin_diagnostic",
    message: "WTA admin probe callback",
    attribution: {
      sourceSlug: "wta-admin-probe",
      sourcePage: "/admin",
      topicSlug: "ops",
    },
  });

  return NextResponse.json({
    success: row.ok,
    row,
  });
}
