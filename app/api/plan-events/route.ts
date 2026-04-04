import { NextResponse } from "next/server";
import { normalizePlanEvent, recordPlanEvent } from "@/lib/planTelemetry";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return NextResponse.json({ success: false, error: "Invalid JSON body" }, { status: 400 });
    }

    const event = normalizePlanEvent(body as Record<string, unknown>);
    const row = await recordPlanEvent({
      ...event,
      path: typeof body.path === "string" ? body.path : "/plan",
    });

    return NextResponse.json({ success: true, row });
  } catch (error: unknown) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : String(error) },
      { status: 500 },
    );
  }
}
