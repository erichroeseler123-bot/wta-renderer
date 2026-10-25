import { NextRequest, NextResponse } from "next/server";
import { getKV } from "@/lib/kv";
import {
  buildOrderAttributionFromLines,
  saveOrder,
  makeOrderCancelToken,
  hashClientSecret,
  type OrderAttribution,
  type OrderLine,
  type OrderSnapshot,
} from "@/lib/orders";
import { checkBookingCapabilityReadiness } from "@/lib/fareharbor";
import { resolveExactDeparturePrice } from "@/lib/fareharborAvailability";
import { getStripeClient } from "@/lib/stripe";
import { emitDccSatelliteEvent, inferDccSourceSlug } from "@/lib/dccSatellite";
import { sanitizePlacementLabel } from "@/lib/tourWidget";
import { sanitizeEmbedDomain } from "@/lib/widgetContext";
import {
  clientIpFromHeaders,
  enforceRateLimit,
  logSecurityEvent,
  logServerError,
  requestId,
  verifyTurnstileToken,
} from "@/lib/security";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type CartLine = {
  company: string;
  itemPk: number;
  availabilityPk: number;
  ratePk: number;
  qty: number;
  title?: string;
  day?: string;
  date?: string;
  startAt?: string;
  expectedUnitCents?: number;
  unitCents?: number;
  price?: number;
  handoffSource?: string;
  handoffId?: string;
  sourceSlug?: string;
  sourcePage?: string;
  topicSlug?: string;
  authorityTopic?: string;
  referrerPath?: string;
  portSlug?: string;
  productSlug?: string;
  handoffCategory?: string;
  handoffDate?: string;
  dccReturnUrl?: string;
  embedDomain?: string;
  embedPath?: string;
  widgetPlacement?: string;
  widgetId?: string;
  partySize?: number;
  adults?: number;
  children?: number;
  cruiseShip?: string;
  cruiseShipSlug?: string;
  timeOfDay?: string;
  budgetTier?: string;
};

function jsonError(message: string, status = 400, extra?: Record<string, unknown>) {
  return NextResponse.json(
    {
      success: false,
      error: message,
      ...(extra?.code ? { code: extra.code } : {}),
      ...(extra ? { extra } : {}),
    },
    { status },
  );
}

function clampQty(n: unknown) {
  const x = Math.floor(Number(n || 1));
  return Math.max(1, Math.min(99, x));
}

export async function POST(req: NextRequest) {
  const rid = requestId();
  const ip = clientIpFromHeaders(req.headers);
  try {
    const rl = await enforceRateLimit({
      key: `create-intent:${ip}`,
      limit: 12,
      windowSec: 60,
    });
    if (!rl.ok) {
      logSecurityEvent("rate_limited_create_intent", { rid, ip, retryAfterSec: rl.retryAfterSec });
      const r = jsonError("Too many checkout attempts. Please wait and try again.", 429, {
        request_id: rid,
      });
      r.headers.set("Retry-After", String(rl.retryAfterSec));
      return r;
    }

    const bookingReady = checkBookingCapabilityReadiness();
    if (!bookingReady.ok) {
      logSecurityEvent("create_intent_booking_unavailable", {
        rid,
        ip,
        code: bookingReady.code,
      });
      return jsonError(bookingReady.error, bookingReady.status, {
        code: bookingReady.code,
        request_id: rid,
      });
    }

    const stripe = getStripeClient();
    if (!stripe) return jsonError("Payment service is not configured.", 500, { request_id: rid });

    const kv = await getKV();
    if (!kv) {
      return jsonError("Booking storage is currently unavailable.", 503, {
        code: "storage_unavailable",
        request_id: rid,
      });
    }

    const body = await req.json().catch(() => null);
    if (!body) return jsonError("Invalid JSON body.", 400);

    const turnstileToken = String(body?.turnstileToken || "").trim();
    const turnstile = await verifyTurnstileToken(turnstileToken, ip);
    if (!turnstile.ok) {
      logSecurityEvent("turnstile_failed", { rid, ip, reason: turnstile.reason });
      return jsonError("Human verification failed. Please refresh and try again.", 400, {
        request_id: rid,
      });
    }

    const lines = (body?.items || []) as CartLine[];
    const contact = body?.contact || {};

    const name = String(contact?.name || "").trim();
    const email = String(contact?.email || "").trim();
    const phone = String(contact?.phone || "").trim();

    if (!Array.isArray(lines) || lines.length < 1) return jsonError("Cart is empty.", 400);
    if (!name || !email) return jsonError("Missing contact.name or contact.email.", 400);

    let totalCents = 0;
    let previousTotalCents = 0;
    const computed: OrderLine[] = [];
    const priceChanges: Array<{
      company: string;
      itemPk: number;
      availabilityPk: number;
      ratePk: number;
      title?: string;
      date: string;
      startAt?: string;
      qty: number;
      previousUnitCents: number;
      updatedUnitCents: number;
      previousLineTotalCents: number;
      updatedLineTotalCents: number;
      currency: string;
    }> = [];

    for (const it of lines) {
      const company = String(it.company || "").trim();
      const itemPk = Number(it.itemPk || 0);
      const availabilityPk = Number(it.availabilityPk || 0);
      const ratePk = Number(it.ratePk || 0);
      const qty = clampQty(it.qty);

      if (!company || !itemPk || !availabilityPk || !ratePk) {
        return jsonError("Bad cart line (missing company/itemPk/availabilityPk/ratePk).", 400, { it });
      }

      const expectedUnit =
        typeof it.expectedUnitCents === "number" && Number.isFinite(it.expectedUnitCents) && it.expectedUnitCents > 0
          ? Math.floor(it.expectedUnitCents)
          : typeof it.unitCents === "number" && Number.isFinite(it.unitCents) && it.unitCents > 0
            ? Math.floor(it.unitCents)
            : typeof it.price === "number" && Number.isFinite(it.price) && it.price > 0
              ? Math.floor(it.price)
              : null;

      const pj = await resolveExactDeparturePrice({
        company,
        itemPk,
        availabilityPk,
        customerTypeRatePk: ratePk,
        date: it.day || it.date,
        startAt: it.startAt,
        qty,
        expectedUnitCents: expectedUnit,
      });

      if (!pj.ok) {
        return jsonError(pj.error || "Pricing failed for a cart line.", pj.status, {
          code: pj.code,
          line: it,
          details: pj,
        });
      }

      const currency = String(pj.currency || "usd").toLowerCase();
      const lineTotal = Number(pj.lineTotalCents);

      if (!Number.isFinite(lineTotal) || lineTotal <= 0) {
        return jsonError("Invalid line total returned from price resolution.", 409, {
          line: it,
          details: pj,
        });
      }

      const roundedLineTotal = Math.floor(lineTotal);
      totalCents += roundedLineTotal;
      previousTotalCents += expectedUnit !== null ? expectedUnit * qty : roundedLineTotal;

      if (pj.priceChanged && expectedUnit !== null) {
        priceChanges.push({
          company: pj.company,
          itemPk: pj.itemPk,
          availabilityPk: pj.availabilityPk,
          ratePk: pj.customerTypeRatePk,
          title: it.title,
          date: pj.date,
          startAt: pj.startAt || it.startAt,
          qty,
          previousUnitCents: expectedUnit,
          updatedUnitCents: pj.unitCents,
          previousLineTotalCents: expectedUnit * qty,
          updatedLineTotalCents: roundedLineTotal,
          currency,
        });
      }

      computed.push({
        company: pj.company,
        itemPk: pj.itemPk,
        availabilityPk: pj.availabilityPk,
        ratePk: pj.customerTypeRatePk,
        qty,
        title: it.title,
        startAt: pj.startAt || it.startAt,
        lineTotalCents: roundedLineTotal,
        currency,
        handoffSource: typeof it.handoffSource === "string" ? it.handoffSource : undefined,
        handoffId: typeof it.handoffId === "string" ? it.handoffId : undefined,
        sourceSlug: typeof it.sourceSlug === "string" ? it.sourceSlug : undefined,
        sourcePage: typeof it.sourcePage === "string" ? it.sourcePage : undefined,
        topicSlug: typeof it.topicSlug === "string" ? it.topicSlug : undefined,
        authorityTopic: typeof it.authorityTopic === "string" ? it.authorityTopic : undefined,
        referrerPath: typeof it.referrerPath === "string" ? it.referrerPath : undefined,
        portSlug: typeof it.portSlug === "string" ? it.portSlug : undefined,
        productSlug: typeof it.productSlug === "string" ? it.productSlug : undefined,
        category: typeof it.handoffCategory === "string" ? it.handoffCategory : undefined,
        handoffDate: typeof it.handoffDate === "string" ? it.handoffDate : undefined,
        dccReturnUrl: typeof it.dccReturnUrl === "string" ? it.dccReturnUrl : undefined,
        embedDomain: sanitizeEmbedDomain(it.embedDomain),
        embedPath:
          it.handoffSource === "dcc" && typeof it.embedPath === "string"
            ? it.embedPath.split(/[?#]/)[0]?.slice(0, 160)
            : undefined,
        widgetPlacement:
          typeof it.widgetPlacement === "string"
            ? sanitizePlacementLabel(it.widgetPlacement)
            : undefined,
        widgetId:
          typeof it.widgetId === "string" && it.widgetId.trim()
            ? it.widgetId.trim().slice(0, 80)
            : undefined,
        partySize: Number.isFinite(Number(it.partySize)) ? Number(it.partySize) : undefined,
        adults: Number.isFinite(Number(it.adults)) ? Number(it.adults) : undefined,
        children: Number.isFinite(Number(it.children)) ? Number(it.children) : undefined,
        cruiseShip: typeof it.cruiseShip === "string" ? it.cruiseShip : undefined,
        cruiseShipSlug: typeof it.cruiseShipSlug === "string" ? it.cruiseShipSlug : undefined,
        timeOfDay: typeof it.timeOfDay === "string" ? it.timeOfDay : undefined,
        budgetTier: typeof it.budgetTier === "string" ? it.budgetTier : undefined,
      });
    }

    if (!Number.isFinite(totalCents) || totalCents <= 0) return jsonError("Total is invalid.", 409);

    const acceptedTotalCents =
      typeof body?.acceptedTotalCents === "number" && Number.isFinite(body.acceptedTotalCents)
        ? Math.floor(body.acceptedTotalCents)
        : null;

    if (priceChanges.length > 0 && acceptedTotalCents !== totalCents) {
      return NextResponse.json(
        {
          success: false,
          code: "price_changed",
          error:
            "Live departure pricing has updated since this item was added to your cart. Please review and accept the updated price before payment.",
          previousTotalCents,
          updatedTotalCents: totalCents,
          currency: "usd",
          priceChanges,
          request_id: rid,
        },
        { status: 409 },
      );
    }

    const order_id = `ord_${crypto.randomUUID()}`;
    const cart_id = `cart_${crypto.randomUUID()}`;

    const attribution: OrderAttribution = buildOrderAttributionFromLines(lines);

    const draft: OrderSnapshot = {
      order_id,
      cart_id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      contact: { name, email, phone },
      items: computed,
      totalCents,
      currency: "usd",
      attribution,
      status: "payment_pending",
      bookingAttempts: 0,
      cancel_token: makeOrderCancelToken(order_id, email),
    };

    await saveOrder(draft);

    if (attribution.handoffSource === "dcc" && attribution.handoffId) {
      console.log("[wta-create-intent:dcc]", {
        orderId: order_id,
        cartId: cart_id,
        handoffId: attribution.handoffId,
        sourceSlug: attribution.sourceSlug ?? null,
        sourcePage: attribution.sourcePage ?? null,
        topicSlug: attribution.topicSlug ?? null,
        portSlug: attribution.portSlug ?? null,
        category: attribution.category ?? null,
      });

      await emitDccSatelliteEvent({
        handoffId: attribution.handoffId,
        satelliteId: "welcome-to-alaska",
        eventType: "lead_captured",
        sourcePath: "/checkout",
        externalReference: order_id,
        status: draft.status,
        stage: "checkout_started",
        traveler: {
          email,
          phone: phone || undefined,
          name,
          partySize: attribution.partySize,
        },
        attribution: {
          sourceSlug: attribution.sourceSlug || inferDccSourceSlug(attribution.sourcePage || attribution.referrerPath),
          sourcePage: attribution.sourcePage || attribution.referrerPath,
          topicSlug: attribution.topicSlug || attribution.authorityTopic,
        },
        booking: {
          portSlug: attribution.portSlug,
          productSlug: attribution.productSlug,
          eventDate: attribution.date,
          quantity: computed.reduce((sum, line) => sum + line.qty, 0),
          currency: draft.currency,
          amount: draft.totalCents / 100,
        },
        metadata: {
          order_id,
          cart_id,
          line_count: computed.length,
          embedDomain: attribution.embedDomain || null,
          embedPath: attribution.embedPath || null,
          widgetPlacement: attribution.widgetPlacement || null,
          widgetId: attribution.widgetId || null,
        },
      });
    }

    const pi = await stripe.paymentIntents.create(
      {
        amount: totalCents,
        currency: "usd",
        automatic_payment_methods: { enabled: true },
        receipt_email: email,
        metadata: {
          order_id,
          cart_id,
          cart_lines: String(computed.length),
          contact_email: email,
          handoff_source: attribution.handoffSource || "",
          handoff_id: attribution.handoffId || "",
          widget_placement: attribution.widgetPlacement || "",
          widget_id: attribution.widgetId || "",
          embed_domain: attribution.embedDomain || "",
          embed_path: attribution.embedPath || "",
          authority_topic: attribution.authorityTopic || "",
          port_slug: attribution.portSlug || "",
          category: attribution.category || "",
          cruise_ship: attribution.cruiseShip || "",
          cruise_ship_slug: attribution.cruiseShipSlug || "",
        },
      },
      {
        idempotencyKey: `create-intent:${order_id}`,
      },
    );

    const withPI: OrderSnapshot = {
      ...draft,
      payment_intent_id: pi.id,
      client_secret_hash: pi.client_secret ? hashClientSecret(pi.client_secret) : undefined,
      status: "payment_pending",
    };

    await saveOrder(withPI);

    return NextResponse.json({
      success: true,
      order_id,
      cart_id,
      client_secret: pi.client_secret,
      payment_intent_id: pi.id,
      totalCents,
      currency: "usd",
      kvEnabled: true,
      request_id: rid,
    });
  } catch (e: unknown) {
    logServerError("/api/stripe/create-intent", rid, e, { ip });
    return jsonError("Create intent failed.", 500, { request_id: rid });
  }
}
