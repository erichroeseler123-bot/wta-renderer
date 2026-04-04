import { NextRequest, NextResponse } from "next/server";
import {
  decodeHandoffPayload,
  normalizeDccToWtaHandoff,
  verifyDccHandoffSignature,
  type DccToWtaHandoff,
} from "@/lib/dccHandoff";
import { buildRedirectUrl, resolveDccHandoffToWtaRoute } from "@/lib/dccToWtaMap";
import { emitDccSatelliteEvent, inferDccSourceSlug } from "@/lib/dccSatellite";
import { getKV } from "@/lib/kv";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function jsonError(message: string, status = 400, extra?: Record<string, unknown>) {
  return NextResponse.json({ success: false, error: message, ...extra }, { status });
}

function parseHandoffFromRequest(req: NextRequest): DccToWtaHandoff {
  const payload = req.nextUrl.searchParams.get("payload");
  if (!payload) {
    throw new Error("Missing payload");
  }

  const sig = req.nextUrl.searchParams.get("sig");
  const secret = String(process.env.DCC_WTA_HANDOFF_SIG_SECRET || "").trim();
  if (sig && !secret) {
    throw new Error("Missing DCC_WTA_HANDOFF_SIG_SECRET");
  }
  if (sig && secret && !verifyDccHandoffSignature(payload, sig, secret)) {
    throw new Error("Invalid handoff signature");
  }

  const decoded = decodeHandoffPayload(payload);
  const handoff = normalizeDccToWtaHandoff(decoded);

  if (handoff.source !== "dcc") {
    throw new Error("Invalid handoff source");
  }

  return handoff;
}

async function recordHandoff(
  req: NextRequest,
  handoff: DccToWtaHandoff,
  redirectUrl: string,
  reason: string,
  dccReturn: string,
) {
  const kv = await getKV();
  if (!kv) return;

  const key = `handoff:received:${handoff.handoffId}`;
  const row = {
    handoffId: handoff.handoffId,
    source: handoff.source,
    version: handoff.version,
    sourceMode: "payload",
    targetUrl: new URL(redirectUrl, req.url).toString(),
    reason,
    dccReturn: dccReturn || null,
    intent: {
      destination: handoff.destination,
      bookingIntent: handoff.intent,
      traveler: handoff.traveler,
      context: handoff.context,
    },
    receivedAt: new Date().toISOString(),
    userAgent: req.headers.get("user-agent") || "",
    ip: req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "",
  };

  await kv.set(key, row, { ex: 60 * 60 * 24 * 30 });

  const indexKey = "handoff:received:recent";
  const recent = (await kv.get<string[]>(indexKey)) || [];
  const next = [handoff.handoffId, ...recent.filter((x) => x !== handoff.handoffId)].slice(0, 300);
  await kv.set(indexKey, next, { ex: 60 * 60 * 24 * 30 });
}

export async function GET(req: NextRequest) {
  try {
    const handoff = parseHandoffFromRequest(req);
    const resolved = resolveDccHandoffToWtaRoute(handoff);
    const dccReturn = req.nextUrl.searchParams.get("dcc_return") || "";
    const redirectQuery = {
      ...resolved.query,
      ...(dccReturn ? { dcc_return: dccReturn } : {}),
    };
    const redirectUrl = buildRedirectUrl(resolved.pathname, redirectQuery);

    const res = NextResponse.redirect(new URL(redirectUrl, req.url), 302);

    res.cookies.set("wta_handoff_source", "dcc", {
      httpOnly: false,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    res.cookies.set("wta_handoff_id", handoff.handoffId, {
      httpOnly: false,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    if (handoff.context?.authorityTopic) {
      res.cookies.set("wta_authority_topic", handoff.context.authorityTopic, {
        httpOnly: false,
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 7,
      });
    }

    if (dccReturn) {
      res.cookies.set("wta_dcc_return", dccReturn, {
        httpOnly: false,
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 7,
      });
    }

    await recordHandoff(req, handoff, redirectUrl, resolved.reason, dccReturn).catch(() => undefined);
    await emitDccSatelliteEvent({
      handoffId: handoff.handoffId,
      satelliteId: "welcome-to-alaska",
      eventType: "handoff_viewed",
      sourcePath: req.nextUrl.pathname,
      status: "received",
      stage: resolved.reason,
      traveler: {
        partySize: handoff.traveler?.partySize,
      },
      attribution: {
        sourceSlug: inferDccSourceSlug(handoff.context?.referrerPath),
        sourcePage: handoff.context?.referrerPath,
        topicSlug: handoff.context?.authorityTopic,
      },
      booking: {
        portSlug: handoff.destination?.portSlug,
        citySlug: handoff.destination?.citySlug,
        productSlug: handoff.intent?.itemSlug,
        eventDate: handoff.intent?.date || handoff.traveler?.cruiseDate,
      },
      metadata: {
        reason: resolved.reason,
        has_dcc_return: Boolean(dccReturn),
      },
    });

    return res;
  } catch (e: unknown) {
    const err = e as Error;
    return jsonError("Invalid DCC handoff", 400, {
      details: String(err?.message || e),
    });
  }
}
