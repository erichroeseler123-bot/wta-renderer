import { NextResponse } from "next/server";
import Stripe from "stripe";
import { kv } from "@vercel/kv";

export const runtime = "nodejs";

const stripe = new Stripe(String(process.env.STRIPE_SECRET_KEY || ""), {
  apiVersion: "2024-06-20",
});

function ok() {
  return NextResponse.json({ received: true });
}

export async function POST(req: Request) {
  try {
    const whSecret = String(process.env.STRIPE_WEBHOOK_SECRET || "");
    if (!whSecret) return NextResponse.json({ error: "Missing STRIPE_WEBHOOK_SECRET" }, { status: 500 });

    const sig = req.headers.get("stripe-signature");
    if (!sig) return NextResponse.json({ error: "Missing stripe-signature" }, { status: 400 });

    const raw = await req.text();
    const event = stripe.webhooks.constructEvent(raw, sig, whSecret);

    if (event.type !== "payment_intent.succeeded") return ok();

    const pi = event.data.object as Stripe.PaymentIntent;
    const piId = pi.id;
    const cart_id = String(pi.metadata?.cart_id || "");

    if (!cart_id) {
      await kv.set(`receipt:${piId}`, { status: "error", error: "Missing cart_id metadata" }, { ex: 60 * 60 * 24 * 30 });
      return ok();
    }

    // ---- IDEMPOTENCY LOCK ----
    const lockKey = `processed:pi:${piId}`;
    const locked = await kv.set(lockKey, "1", { nx: true, ex: 60 * 60 * 24 * 30 });
    if (locked !== "OK") {
      return ok();
    }

    const snapshot = await kv.get<any>(`cart:${cart_id}`);
    if (!snapshot?.items?.length) {
      await kv.set(`receipt:${piId}`, { status: "error", error: "Missing cart snapshot", cart_id }, { ex: 60 * 60 * 24 * 30 });
      return ok();
    }

    const origin = req.headers.get("origin") || process.env.NEXT_PUBLIC_SITE_URL || "";
    const internalSecret = String(process.env.WTA_INTERNAL_SECRET || "");

    const results = [];
    for (const line of snapshot.items) {
      try {
        const r = await fetch(`${origin}/api/fareharbor/book`, {
          method: "POST",
          headers: {
            "content-type": "application/json",
            "x-wta-internal": internalSecret,
          },
          body: JSON.stringify({
            company: line.company,
            availability_pk: line.availabilityPk,
            customer_type_rate_pk: line.ratePk,
            qty: line.qty,
            amount_paid: line.lineTotalCents, // cents (optional if FH supports)
            contact: snapshot.contact,
            note: `WTA cart ${cart_id} / PI ${piId}`,
          }),
        });

        const j = await r.json().catch(() => ({}));
        if (!r.ok || !j?.success) {
          results.push({ ok: false, line, error: j?.error || "Booking failed", details: j?.details || j });
        } else {
          // store key info (pk/uuid if present)
          const booking = j?.booking?.booking || j?.booking || j;
          results.push({
            ok: true,
            line,
            booking: {
              pk: booking?.pk,
              uuid: booking?.uuid,
              display_id: booking?.display_id,
              dashboard_url: booking?.dashboard_url,
              start_at: booking?.availability?.start_at,
            },
          });
        }
      } catch (e: any) {
        results.push({ ok: false, line, error: String(e?.message || e) });
      }
    }

    const allOk = results.every((x) => x.ok);
    await kv.set(
      `receipt:${piId}`,
      {
        status: allOk ? "booked" : "partial_or_failed",
        cart_id,
        payment_intent_id: piId,
        totalCents: snapshot.totalCents,
        currency: snapshot.currency,
        contact: snapshot.contact,
        results,
        createdAt: new Date().toISOString(),
      },
      { ex: 60 * 60 * 24 * 30 },
    );

    return ok();
  } catch (err: any) {
    return NextResponse.json({ error: "Webhook error", details: String(err?.message || err) }, { status: 400 });
  }
}
