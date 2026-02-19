import { NextResponse } from "next/server";
import Stripe from "stripe";
import { kv } from "@vercel/kv";

const stripe = new Stripe(String(process.env.STRIPE_SECRET_KEY || ""), {
  apiVersion: "2024-06-20",
});

type CartLine = {
  company: string;
  itemPk: number;
  availabilityPk: number;
  ratePk: number;
  qty: number;
  title?: string;
  startAt?: string;
};

function jsonError(message: string, status = 400, extra?: any) {
  return NextResponse.json({ success: false, error: message, ...extra }, { status });
}

function uid() {
  return `cart_${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

export async function POST(req: Request) {
  try {
    if (!process.env.STRIPE_SECRET_KEY) return jsonError("Missing STRIPE_SECRET_KEY", 500);

    const body = await req.json();
    const lines = (body?.items || []) as CartLine[];
    const contact = body?.contact || {};

    const name = String(contact?.name || "");
    const email = String(contact?.email || "");
    const phone = String(contact?.phone || "");

    if (!Array.isArray(lines) || lines.length < 1) return jsonError("Cart is empty.");
    if (!name || !email) return jsonError("Missing contact.name or contact.email.");

    const origin = req.headers.get("origin") || "";

    // Re-price server-side using your own FH price endpoint
    let total = 0;
    const computed = [];

    for (const it of lines) {
      const company = String(it.company || "");
      const availability_pk = Number(it.availabilityPk || 0);
      const customer_type_rate_pk = Number(it.ratePk || 0);
      const qty = Math.max(1, Math.min(99, Math.floor(Number(it.qty || 1))));

      if (!company || !availability_pk || !customer_type_rate_pk) {
        return jsonError("Bad cart line (missing company/availabilityPk/ratePk).", 400, { it });
      }

      const qs = new URLSearchParams({
        company,
        availability_pk: String(availability_pk),
        customer_type_rate_pk: String(customer_type_rate_pk),
        qty: String(qty),
      });

      // IMPORTANT: absolute URL on server
      const priceUrl = `${origin}/api/fareharbor/price?${qs.toString()}`;

      const pr = await fetch(priceUrl, { cache: "no-store" });
      const pj = await pr.json();

      if (!pr.ok || !pj?.success) {
        return jsonError("Pricing failed for a cart line.", 409, { line: it, details: pj });
      }

      const lineTotal = Number(pj?.lineTotalCents || pj?.totalCents || 0);
      if (!Number.isFinite(lineTotal) || lineTotal <= 0) {
        return jsonError("Invalid line total returned from price endpoint.", 409, { line: it, details: pj });
      }

      total += Math.floor(lineTotal);

      computed.push({
        ...it,
        company,
        availabilityPk: availability_pk,
        ratePk: customer_type_rate_pk,
        qty,
        lineTotalCents: Math.floor(lineTotal),
        currency: String(pj?.currency || "usd"),
      });
    }

    if (total <= 0) return jsonError("Total is invalid.", 409);

    const cart_id = uid();

    const pi = await stripe.paymentIntents.create({
      amount: total,
      currency: "usd",
      automatic_payment_methods: { enabled: true },
      receipt_email: email,
      metadata: {
        cart_id,
        cart_lines: String(computed.length),
      },
    });

    // durable snapshot for webhook
    await kv.set(
      `cart:${cart_id}`,
      {
        cart_id,
        createdAt: new Date().toISOString(),
        contact: { name, email, phone },
        items: computed,
        totalCents: total,
        currency: "usd",
      },
      { ex: 60 * 60 * 24 * 30 }, // 30d
    );

    await kv.set(`pi:${pi.id}`, { cart_id }, { ex: 60 * 60 * 24 * 30 });

    return NextResponse.json({
      success: true,
      cart_id,
      client_secret: pi.client_secret,
      payment_intent_id: pi.id,
      totalCents: total,
    });
  } catch (e: any) {
    return jsonError("Create intent failed.", 500, { details: String(e?.message || e) });
  }
}
