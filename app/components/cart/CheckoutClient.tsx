"use client";

import { useMemo, useState } from "react";
import { CardElement, useElements, useStripe } from "@stripe/react-stripe-js";
import { useCart } from "./CartContext";

type PayloadItem = {
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
  handoffCategory?: string;
  handoffDate?: string;
  partySize?: number;
  adults?: number;
  children?: number;
  cruiseShip?: string;
  cruiseShipSlug?: string;
  timeOfDay?: string;
  budgetTier?: string;
  portSlug?: string;
};

export default function CheckoutClient() {
  const { items } = useCart();
  const stripe = useStripe();
  const elements = useElements();

  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  // basic contact fields (you can replace with your own form)
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  const payloadItems = useMemo<PayloadItem[]>(() => {
    const source = (items || []) as Array<Record<string, unknown>>;
    return source.map((it) => ({
      company: String(it.company || ""),
      itemPk: Number(it.itemPk || 0),
      availabilityPk: Number(it.availabilityPk || 0),
      ratePk: Number(it.ratePk || 0),
      qty: Number(it.qty || 0),
      title: it.title ? String(it.title) : undefined,
      startAt: it.startAt ? String(it.startAt) : undefined,
      handoffSource: it.handoffSource ? String(it.handoffSource) : undefined,
      handoffId: it.handoffId ? String(it.handoffId) : undefined,
      authorityTopic: it.authorityTopic ? String(it.authorityTopic) : undefined,
      referrerPath: it.referrerPath ? String(it.referrerPath) : undefined,
      handoffCategory: it.handoffCategory ? String(it.handoffCategory) : undefined,
      handoffDate: it.handoffDate ? String(it.handoffDate) : undefined,
      partySize: it.partySize ? Number(it.partySize) : undefined,
      adults: it.adults ? Number(it.adults) : undefined,
      children: it.children ? Number(it.children) : undefined,
      cruiseShip: it.cruiseShip ? String(it.cruiseShip) : undefined,
      cruiseShipSlug: it.cruiseShipSlug ? String(it.cruiseShipSlug) : undefined,
      timeOfDay: it.timeOfDay ? String(it.timeOfDay) : undefined,
      budgetTier: it.budgetTier ? String(it.budgetTier) : undefined,
      portSlug: it.portSlug ? String(it.portSlug) : undefined,
    }));
  }, [items]);
  const estimatedTotal = useMemo(() => {
    const source = (items || []) as Array<Record<string, unknown>>;
    return source.reduce((sum, it) => {
      const price = Number(it.price || 0);
      const qty = Number(it.qty || 0);
      const line = price * qty;
      return sum + (Number.isFinite(line) ? line : 0);
    }, 0);
  }, [items]);
  const estimatedTotalLabel = estimatedTotal > 0
    ? (estimatedTotal / 100).toLocaleString(undefined, { style: "currency", currency: "USD" })
    : "Calculated live";

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);

    if (!stripe || !elements) return;
    if (!payloadItems.length) return setErr("Cart is empty.");
    if (!name || !email) return setErr("Please enter name + email.");

    setLoading(true);
    try {
      // 1) Create PI from server-truth totals + snapshot
      const r = await fetch("/api/stripe/create-intent", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          items: payloadItems,
          contact: { name, email, phone },
        }),
      });
      const j = await r.json();
      if (!r.ok || !j?.success) throw new Error(j?.error || "Create intent failed");

      const clientSecret = String(j.client_secret || "");
      if (!clientSecret) throw new Error("Missing client secret.");

      const card = elements.getElement(CardElement);
      if (!card) throw new Error("Card form failed to load.");

      // 2) Confirm payment using card element
      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card,
          billing_details: {
            name,
            email,
            phone: phone || undefined,
          },
        },
      });

      if (error) throw new Error(error.message || "Payment failed");
      if (!paymentIntent?.id) throw new Error("Payment completed but no payment intent id was returned.");

      if (paymentIntent.status !== "succeeded" && paymentIntent.status !== "processing") {
        throw new Error(`Payment status: ${paymentIntent.status}`);
      }

      window.location.href = `/checkout/success?payment_intent=${encodeURIComponent(paymentIntent.id)}`;
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      setErr(msg);
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10">
      <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[1.4fr_0.9fr]">
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h1 className="mb-2 text-3xl font-black tracking-tight text-slate-900">Secure Checkout</h1>
          <p className="mb-6 text-slate-600">
            Complete payment to confirm your selected departures. You will receive booking results and receipt on the confirmation page.
          </p>

          <form onSubmit={onSubmit} className="space-y-4">
            <div className="grid gap-3">
              <label className="text-sm font-semibold text-slate-700">
                Full name
                <input
                  className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-slate-900"
                  placeholder="Your full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </label>
              <label className="text-sm font-semibold text-slate-700">
                Email
                <input
                  className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-slate-900"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </label>
              <label className="text-sm font-semibold text-slate-700">
                Phone (optional)
                <input
                  className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-slate-900"
                  placeholder="(555) 123-4567"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </label>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-4">
              <CardElement
                options={{
                  hidePostalCode: true,
                  style: {
                    base: {
                      fontSize: "16px",
                      color: "#0f172a",
                      "::placeholder": { color: "#64748b" },
                    },
                  },
                }}
              />
            </div>

            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-800">
              Payments are encrypted and processed by Stripe. Tour availability and pricing are verified at confirmation time.
            </div>

            {err ? <div className="rounded-xl bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-700">{err}</div> : null}

            <button
              type="submit"
              disabled={!stripe || !elements || loading}
              className="w-full rounded-2xl bg-slate-900 py-3 font-black text-white disabled:opacity-60"
            >
              {loading ? "Processing…" : "Pay & Confirm Booking"}
            </button>
          </form>
        </section>

        <aside className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="text-sm font-semibold uppercase tracking-wide text-slate-500">Order summary</div>
          <div className="mt-2 flex items-end justify-between border-b border-slate-100 pb-3">
            <div className="text-sm text-slate-600">{payloadItems.length} item(s)</div>
            <div className="text-2xl font-black text-slate-900">{estimatedTotalLabel}</div>
          </div>
          <ul className="mt-4 space-y-2 text-sm">
            {payloadItems.map((it, idx) => (
              <li key={idx} className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                <div className="font-semibold text-slate-900">{it.title || "Tour"}</div>
                <div className="text-slate-600">{it.company} • Qty {it.qty}</div>
                {it.startAt ? <div className="text-xs text-slate-500">{String(it.startAt).slice(0, 16).replace("T", " ")}</div> : null}
              </li>
            ))}
          </ul>
          <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-600">
            After payment, we finalize booking and show per-tour status in confirmation.
          </div>
        </aside>
      </div>
    </main>
  );
}
