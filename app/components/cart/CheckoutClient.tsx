"use client";

import { useMemo, useState } from "react";
import { PaymentElement, useElements, useStripe } from "@stripe/react-stripe-js";
import { useCart } from "./CartContext";

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

  const payloadItems = useMemo(() => {
    return (items || []).map((it: any) => ({
      company: it.company,
      itemPk: it.itemPk,
      availabilityPk: it.availabilityPk,
      ratePk: it.ratePk,
      qty: it.qty,
      title: it.title,
      startAt: it.startAt,
      handoffSource: it.handoffSource,
      handoffId: it.handoffId,
      authorityTopic: it.authorityTopic,
      referrerPath: it.referrerPath,
      handoffCategory: it.handoffCategory,
      handoffDate: it.handoffDate,
      partySize: it.partySize,
      adults: it.adults,
      children: it.children,
      cruiseShip: it.cruiseShip,
      cruiseShipSlug: it.cruiseShipSlug,
      timeOfDay: it.timeOfDay,
      budgetTier: it.budgetTier,
      portSlug: it.portSlug,
    }));
  }, [items]);

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

      const clientSecret = j.client_secret as string;

      // 2) Confirm payment (keeps user on your site)
      const { error } = await stripe.confirmPayment({
        elements,
        clientSecret,
        confirmParams: {
          return_url: `${window.location.origin}/checkout/success`,
        },
      });

      if (error) throw new Error(error.message || "Payment failed");
    } catch (e: any) {
      setErr(String(e?.message || e));
      setLoading(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-3xl font-black mb-2">Checkout</h1>
      <p className="text-slate-600 mb-6">Complete payment to lock in your bookings.</p>

      <div className="mb-6 rounded-2xl border p-4 bg-white">
        <div className="font-bold mb-2">Cart ({payloadItems.length})</div>
        <ul className="text-sm text-slate-700 space-y-1">
          {payloadItems.map((it: any, idx: number) => (
            <li key={idx}>
              {it.title || "Tour"} — {it.company} — qty {it.qty}
            </li>
          ))}
        </ul>
      </div>

      <form onSubmit={onSubmit} className="space-y-4">
        <div className="grid gap-3">
          <input
            className="w-full rounded-xl border px-3 py-2"
            placeholder="Full name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <input
            className="w-full rounded-xl border px-3 py-2"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            className="w-full rounded-xl border px-3 py-2"
            placeholder="Phone (optional)"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        </div>

        <div className="rounded-2xl border p-4 bg-white">
          <PaymentElement />
        </div>

        {err ? <div className="text-red-600 font-semibold">{err}</div> : null}

        <button
          type="submit"
          disabled={!stripe || !elements || loading}
          className="w-full rounded-2xl bg-blue-600 text-white font-black py-3 disabled:opacity-60"
        >
          {loading ? "Processing…" : "Pay & Book"}
        </button>
      </form>
    </div>
  );
}
