import { NextResponse } from "next/server";
import {
  DCC_SATELLITE_EVENT_TYPES,
  emitDccSatelliteEvent,
  inferDccSourceSlug,
  type DccSatelliteEventType,
} from "@/lib/dccSatellite";
import { parseWidgetInitContext } from "@/lib/widgetContext";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return NextResponse.json({ success: false, error: "Invalid JSON body" }, { status: 400 });
    }

    const eventType = typeof body.eventType === "string" ? body.eventType : "";
    const context = parseWidgetInitContext(body as Record<string, string | string[] | undefined>);
    const source = context.source || (typeof body.source === "string" ? body.source : "");
    const handoffId = context.handoffId || "";

    if (!eventType || !handoffId || source !== "dcc" || !DCC_SATELLITE_EVENT_TYPES.includes(eventType as DccSatelliteEventType)) {
      return NextResponse.json({ success: true, skipped: true });
    }

    const quantity = Number(body.quantity);
    const amount = Number(body.amount);
    const partySize = Number(body.partySize);

    const row = await emitDccSatelliteEvent({
      handoffId,
      satelliteId: "welcome-to-alaska",
      eventType: eventType as DccSatelliteEventType,
      source: "wta",
      sourcePath: typeof body.sourcePath === "string" ? body.sourcePath : "/widget",
      externalReference: typeof body.externalReference === "string" ? body.externalReference : undefined,
      status: typeof body.status === "string" ? body.status : undefined,
      stage: typeof body.stage === "string" ? body.stage : undefined,
      message: typeof body.message === "string" ? body.message : undefined,
      traveler:
        Number.isFinite(partySize) || typeof body.email === "string" || typeof body.name === "string"
          ? {
              email: typeof body.email === "string" ? body.email : undefined,
              name: typeof body.name === "string" ? body.name : undefined,
              partySize: Number.isFinite(partySize) ? partySize : undefined,
            }
          : undefined,
      attribution: {
        sourceSlug: context.sourceSlug || inferDccSourceSlug(context.sourcePage),
        sourcePage: context.sourcePage,
        topicSlug: context.topicSlug,
      },
      booking: {
        portSlug: context.portSlug,
        productSlug: context.productSlug,
        eventDate: context.eventDate,
        quantity: Number.isFinite(quantity) ? quantity : undefined,
        amount: Number.isFinite(amount) ? amount : undefined,
        currency: typeof body.currency === "string" ? body.currency : undefined,
      },
      metadata: {
        embedDomain: context.embedDomain || null,
        embedPath: context.embedPath || null,
        widgetPlacement: context.widgetPlacement || null,
        widgetId: context.widgetId || null,
      },
    });

    return NextResponse.json({ success: row.ok, skipped: row.skipped, row });
  } catch (error: unknown) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : String(error) },
      { status: 500 },
    );
  }
}
