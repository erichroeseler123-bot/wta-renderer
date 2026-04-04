import { NextRequest, NextResponse } from "next/server";
import { buildParrPartnerForwardUrl, emitDccSatelliteEvent } from "@/lib/dccSatellite";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function jsonError(message: string, status = 400) {
  return NextResponse.json({ success: false, error: message }, { status });
}

export async function GET(req: NextRequest) {
  const handoffId = req.nextUrl.searchParams.get("handoff_id") || "";
  const orderId = req.nextUrl.searchParams.get("order_id") || "";
  const dccReturnUrl = req.nextUrl.searchParams.get("dcc_return") || "";
  const sourcePage = req.nextUrl.searchParams.get("source_page") || "/checkout/success";
  const topicSlug = req.nextUrl.searchParams.get("topic") || "";
  const eventDate = req.nextUrl.searchParams.get("date") || "";
  const event = req.nextUrl.searchParams.get("event") || "";
  const artist = req.nextUrl.searchParams.get("artist") || "";

  if (!handoffId) {
    return jsonError("Missing handoff_id");
  }

  const targetUrl = buildParrPartnerForwardUrl({
    handoffId,
    dccReturnUrl: dccReturnUrl || undefined,
    sourcePage,
    eventDate: eventDate || undefined,
    artist: artist || undefined,
    event: event || undefined,
  });

  await emitDccSatelliteEvent({
    handoffId,
    satelliteId: "welcome-to-alaska",
    eventType: "forwarded_to_partner",
    sourcePath: req.nextUrl.pathname,
    externalReference: orderId || undefined,
    status: "forwarded",
    stage: "partner_handoff",
    attribution: {
      sourceSlug: "wta-post-booking",
      sourcePage,
      topicSlug: topicSlug || undefined,
    },
    booking: {
      eventDate: eventDate || undefined,
    },
    partner: {
      fromSite: "welcome-to-alaska",
      toSite: "partyatredrocks",
      partnerHandoffId: handoffId,
      reason: "traveler_reuse",
    },
  });

  return NextResponse.redirect(targetUrl, 302);
}
