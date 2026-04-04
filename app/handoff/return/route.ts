import { NextRequest, NextResponse } from "next/server";
import { buildDccReturnUrl, emitDccSatelliteEvent } from "@/lib/dccSatellite";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function jsonError(message: string, status = 400) {
  return NextResponse.json({ success: false, error: message }, { status });
}

export async function GET(req: NextRequest) {
  const target = req.nextUrl.searchParams.get("target") || "";
  const handoffId = req.nextUrl.searchParams.get("handoff_id") || "";
  const orderId = req.nextUrl.searchParams.get("order_id") || "";
  const status = req.nextUrl.searchParams.get("status") || "";
  const sourcePage = req.nextUrl.searchParams.get("sourcePage") || "";
  const topicSlug = req.nextUrl.searchParams.get("topicSlug") || "";
  const portSlug = req.nextUrl.searchParams.get("portSlug") || "";
  const productSlug = req.nextUrl.searchParams.get("productSlug") || "";
  const eventDate = req.nextUrl.searchParams.get("eventDate") || "";
  const embedDomain = req.nextUrl.searchParams.get("embedDomain") || "";
  const embedPath = req.nextUrl.searchParams.get("embedPath") || "";
  const widgetPlacement = req.nextUrl.searchParams.get("widgetPlacement") || "";
  const widgetId = req.nextUrl.searchParams.get("widgetId") || "";

  const redirectUrl = buildDccReturnUrl(target, {
    handoff_id: handoffId || undefined,
    satellite: "welcome-to-alaska",
    status: status || undefined,
    order_id: orderId || undefined,
  });

  if (!redirectUrl) {
    return jsonError("Invalid return target");
  }

  if (handoffId) {
    await emitDccSatelliteEvent({
      handoffId,
      satelliteId: "welcome-to-alaska",
      eventType: "traveler_returned",
      sourcePath: req.nextUrl.pathname,
      externalReference: orderId || undefined,
      status: status || undefined,
      stage: "return_to_dcc",
      attribution: {
        sourcePage: sourcePage || undefined,
        topicSlug: topicSlug || undefined,
      },
      booking: {
        portSlug: portSlug || undefined,
        productSlug: productSlug || undefined,
        eventDate: eventDate || undefined,
      },
      metadata: {
        return_host: new URL(redirectUrl).host,
        embedDomain: embedDomain || null,
        embedPath: embedPath || null,
        widgetPlacement: widgetPlacement || null,
        widgetId: widgetId || null,
      },
    });
  }

  return NextResponse.redirect(redirectUrl, 302);
}
