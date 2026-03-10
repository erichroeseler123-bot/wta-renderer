import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { getKV } from "@/lib/kv";
import {
  saveOrder,
  type OrderAttribution,
  type OrderLine,
  type OrderSnapshot,
} from "@/lib/orders";
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
  startAt?: string;
  handoffSource?: string;
  handoffId?: string;
  authorityTopic?: string;
  referrerPath?: string;
  portSlug?: string;
  handoffCategory?: string;
  handoffDate?: string;
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
    { success: false, error: message, ...(extra ? { extra } : {}) },
    { status },
  );
}

function getBaseUrl(req: NextRequest) {
  const siteUrl = process.env.SITE_URL;
  if (siteUrl) return siteUrl.replace(/\/+$/, "");

  const origin = req.headers.get("origin") || req.headers.get("x-forwarded-host");
  const proto = req.headers.get("x-forwarded-proto") || "https";

  if (origin) {
    if (origin.startsWith("http://") || origin.startsWith("https://")) return origin.replace(/\/+$/, "");
    return `${proto}://${origin}`.replace(/\/+$/, "");
  }

  return "http://localhost:3000";
}

function clampQty(n: unknown) {
  const x = Math.floor(Number(n || 1));
  return Math.max(1, Math.min(99, x));
}

function pickFirstString(lines: CartLine[], key: keyof CartLine) {
  for (const line of lines) {
    const v = line[key];
    if (typeof v === "string" && v.trim()) return v.trim();
  }
  return undefined;
}

function pickFirstNumber(lines: CartLine[], key: keyof CartLine) {
  for (const line of lines) {
    const n = Number(line[key]);
    if (Number.isFinite(n) && n > 0) return Math.floor(n);
  }
  return undefined;
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

    const stripeKey = process.env.STRIPE_SECRET_KEY;
    if (!stripeKey) return jsonError("Payment service is not configured.", 500, { request_id: rid });

    const kv = await getKV();
    if (!kv) return jsonError("Booking storage is currently unavailable.", 500, { request_id: rid });

    const stripe = new Stripe(stripeKey, {});

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

    const baseUrl = getBaseUrl(req);

    let totalCents = 0;
    const computed: OrderLine[] = [];

    for (const it of lines) {
      const company = String(it.company || "").trim();
      const itemPk = Number(it.itemPk || 0);
      const availabilityPk = Number(it.availabilityPk || 0);
      const ratePk = Number(it.ratePk || 0);
      const qty = clampQty(it.qty);

      if (!company || !itemPk || !availabilityPk || !ratePk) {
        return jsonError("Bad cart line (missing company/itemPk/availabilityPk/ratePk).", 400, { it });
      }

      const qs = new URLSearchParams({
        company,
        item_pk: String(itemPk),
        availability_pk: String(availabilityPk),
        customer_type_rate_pk: String(ratePk),
        qty: String(qty),
      });

      const priceUrl = new URL(`/api/fareharbor/price?${qs.toString()}`, baseUrl).toString();
      const pr = await fetch(priceUrl, { cache: "no-store" });
      const pj = await pr.json().catch(() => null);

      if (!pr.ok || (!pj?.success && !pj?.ok)) {
        return jsonError("Pricing failed for a cart line.", 409, { line: it, details: pj });
      }

      const currency = String(pj?.currency || "usd").toLowerCase();
      const lineTotal = Number(pj?.lineTotalCents ?? pj?.totalCents ?? 0);

      if (!Number.isFinite(lineTotal) || lineTotal <= 0) {
        return jsonError("Invalid line total returned from price endpoint.", 409, { line: it, details: pj });
      }

      totalCents += Math.floor(lineTotal);
      computed.push({
        company,
        itemPk,
        availabilityPk,
        ratePk,
        qty,
        title: it.title,
        startAt: it.startAt,
        lineTotalCents: Math.floor(lineTotal),
        currency,
        handoffSource: typeof it.handoffSource === "string" ? it.handoffSource : undefined,
        handoffId: typeof it.handoffId === "string" ? it.handoffId : undefined,
        authorityTopic: typeof it.authorityTopic === "string" ? it.authorityTopic : undefined,
        referrerPath: typeof it.referrerPath === "string" ? it.referrerPath : undefined,
        portSlug: typeof it.portSlug === "string" ? it.portSlug : undefined,
        category: typeof it.handoffCategory === "string" ? it.handoffCategory : undefined,
        handoffDate: typeof it.handoffDate === "string" ? it.handoffDate : undefined,
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

    const order_id = `ord_${crypto.randomUUID()}`;
    const cart_id = `cart_${crypto.randomUUID()}`;

    const attribution: OrderAttribution = {
      handoffSource: pickFirstString(lines, "handoffSource"),
      handoffId: pickFirstString(lines, "handoffId"),
      authorityTopic: pickFirstString(lines, "authorityTopic"),
      referrerPath: pickFirstString(lines, "referrerPath"),
      portSlug: pickFirstString(lines, "portSlug"),
      category: pickFirstString(lines, "handoffCategory"),
      date: pickFirstString(lines, "handoffDate"),
      partySize: pickFirstNumber(lines, "partySize"),
      adults: pickFirstNumber(lines, "adults"),
      children: pickFirstNumber(lines, "children"),
      cruiseShip: pickFirstString(lines, "cruiseShip"),
      cruiseShipSlug: pickFirstString(lines, "cruiseShipSlug"),
      timeOfDay: pickFirstString(lines, "timeOfDay"),
      budgetTier: pickFirstString(lines, "budgetTier"),
    };

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
    };

    await saveOrder(draft);

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
