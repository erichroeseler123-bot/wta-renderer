"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { CardElement, useElements, useStripe } from "@stripe/react-stripe-js";
import { useCart } from "./CartContext";
import TurnstileWidget from "@/app/components/security/TurnstileWidget";
import { trackCheckoutStart } from "@/lib/analytics/ga";
import { getOperatorCancellationPolicy } from "@/lib/operatorCancellationPolicies";

function sendPlanEvent(payload: Record<string, unknown>) {
  const body = JSON.stringify(payload);

  if (typeof navigator !== "undefined" && typeof navigator.sendBeacon === "function") {
    const blob = new Blob([body], { type: "application/json" });
    navigator.sendBeacon("/api/plan-events", blob);
    return;
  }

  void fetch("/api/plan-events", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
    keepalive: true,
  });
}

type PayloadItem = {
  company: string;
  itemPk: number;
  availabilityPk: number;
  ratePk: number;
  qty: number;
  title?: string;
  day?: string;
  startAt?: string;
  expectedUnitCents?: number;
  handoffSource?: string;
  handoffId?: string;
  sourceSlug?: string;
  sourcePage?: string;
  topicSlug?: string;
  authorityTopic?: string;
  referrerPath?: string;
  handoffCategory?: string;
  handoffDate?: string;
  dccReturnUrl?: string;
  productSlug?: string;
  requestedLane?: string;
  resolvedLane?: string;
  degradedFallback?: boolean;
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
  portSlug?: string;
};

export type ServerPriceChangeNotice = {
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
};

export function applyServerPriceChangesToCartItems<T extends Record<string, unknown>>(
  items: T[],
  priceChanges: ServerPriceChangeNotice[],
): T[] {
  if (!Array.isArray(items) || !Array.isArray(priceChanges) || priceChanges.length === 0) {
    return items;
  }
  return items.map((item) => {
    const match = priceChanges.find(
      (pc) =>
        String(pc.company || "").toLowerCase() === String(item.company || "").toLowerCase() &&
        Number(pc.itemPk) === Number(item.itemPk) &&
        Number(pc.availabilityPk) === Number(item.availabilityPk) &&
        Number(pc.ratePk) === Number(item.ratePk),
    );
    if (!match) return item;
    return {
      ...item,
      price: match.updatedUnitCents,
      unitCents: match.updatedUnitCents,
      expectedUnitCents: match.updatedUnitCents,
    };
  });
}

export function formatCentsUsd(cents: number): string {
  const n = Number(cents || 0);
  if (!Number.isFinite(n)) return "$0.00";
  return (n / 100).toLocaleString("en-US", { style: "currency", currency: "USD" });
}

export default function CheckoutClient() {
  const { items, setSelection } = useCart();
  const stripe = useStripe();
  const elements = useElements();

  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [pendingPriceApproval, setPendingPriceApproval] = useState<{
    previousTotalCents: number;
    updatedTotalCents: number;
    priceChanges: ServerPriceChangeNotice[];
  } | null>(null);
  const [acceptedTotalCents, setAcceptedTotalCents] = useState<number | null>(null);

  // basic contact fields (you can replace with your own form)
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [turnstileToken, setTurnstileToken] = useState("");
  const turnstileSiteKey = String(process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || "").trim();

  const payloadItems = useMemo<PayloadItem[]>(() => {
    const source = (items || []) as Array<Record<string, unknown>>;
    return source.map((it) => ({
      company: String(it.company || ""),
      itemPk: Number(it.itemPk || 0),
      availabilityPk: Number(it.availabilityPk || 0),
      ratePk: Number(it.ratePk || 0),
      qty: Number(it.qty || 0),
      title: it.title ? String(it.title) : undefined,
      day: it.day ? String(it.day) : undefined,
      startAt: it.startAt ? String(it.startAt) : undefined,
      expectedUnitCents:
        typeof it.unitCents === "number"
          ? Number(it.unitCents)
          : typeof it.price === "number"
            ? Number(it.price)
            : undefined,
      handoffSource: it.handoffSource ? String(it.handoffSource) : undefined,
      handoffId: it.handoffId ? String(it.handoffId) : undefined,
      sourceSlug: it.sourceSlug ? String(it.sourceSlug) : undefined,
      sourcePage: it.sourcePage ? String(it.sourcePage) : undefined,
      topicSlug: it.topicSlug ? String(it.topicSlug) : undefined,
      authorityTopic: it.authorityTopic ? String(it.authorityTopic) : undefined,
      referrerPath: it.referrerPath ? String(it.referrerPath) : undefined,
      handoffCategory: it.handoffCategory ? String(it.handoffCategory) : undefined,
      handoffDate: it.handoffDate ? String(it.handoffDate) : undefined,
      dccReturnUrl: it.dccReturnUrl ? String(it.dccReturnUrl) : undefined,
      productSlug: it.productSlug ? String(it.productSlug) : undefined,
      requestedLane: it.requestedLane ? String(it.requestedLane) : undefined,
      resolvedLane: it.resolvedLane ? String(it.resolvedLane) : undefined,
      degradedFallback: typeof it.degradedFallback === "boolean" ? it.degradedFallback : undefined,
      embedDomain: it.embedDomain ? String(it.embedDomain) : undefined,
      embedPath: it.embedPath ? String(it.embedPath) : undefined,
      widgetPlacement: it.widgetPlacement ? String(it.widgetPlacement) : undefined,
      widgetId: it.widgetId ? String(it.widgetId) : undefined,
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
  const distinctCompanies = useMemo(() => {
    return Array.from(new Set(payloadItems.map((it) => it.company).filter(Boolean)));
  }, [payloadItems]);
  const estimatedTotal = useMemo(() => {
    if (pendingPriceApproval) {
      return pendingPriceApproval.updatedTotalCents;
    }
    const source = (items || []) as Array<Record<string, unknown>>;
    return source.reduce((sum, it) => {
      const price = Number(it.price || it.unitCents || 0);
      const qty = Number(it.qty || 0);
      const line = price * qty;
      return sum + (Number.isFinite(line) ? line : 0);
    }, 0);
  }, [items, pendingPriceApproval]);
  const estimatedTotalLabel = estimatedTotal > 0
    ? (estimatedTotal / 100).toLocaleString(undefined, { style: "currency", currency: "USD" })
    : "Calculated live";

  const checkoutTelemetrySentRef = useRef(false);

  useEffect(() => {
    if (checkoutTelemetrySentRef.current || payloadItems.length < 1) return;
    checkoutTelemetrySentRef.current = true;

    const first = payloadItems[0];
    trackCheckoutStart({
      value: estimatedTotal > 0 ? estimatedTotal / 100 : undefined,
      itemCount: payloadItems.length,
    });
    sendPlanEvent({
      event: "checkout_start",
      path: "/checkout",
      requestedLane: first.requestedLane,
      resolvedLane: first.resolvedLane,
      degradedFallback: first.degradedFallback,
      productSlug: first.productSlug,
      port: first.portSlug,
      topic: first.topicSlug || first.authorityTopic,
      sourcePage: first.sourcePage || first.referrerPath,
    });
  }, [payloadItems, estimatedTotal]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);

    if (!stripe || !elements) return;
    if (!payloadItems.length) return setErr("Cart is empty.");
    if (!name || !email) return setErr("Please enter name + email.");
    if (turnstileSiteKey && !turnstileToken) return setErr("Please complete human verification.");

    const effectiveAcceptedTotalCents =
      pendingPriceApproval?.updatedTotalCents ?? acceptedTotalCents ?? undefined;

    setLoading(true);
    try {
      // 1) Create PI from server-truth totals + snapshot
      const r = await fetch("/api/stripe/create-intent", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          items: payloadItems,
          contact: { name, email, phone },
          turnstileToken,
          ...(typeof effectiveAcceptedTotalCents === "number"
            ? { acceptedTotalCents: effectiveAcceptedTotalCents }
            : {}),
        }),
      });
      const j = await r.json();
      if (!r.ok || !j?.success) {
        if (r.status === 409 && j?.code === "price_changed" && Array.isArray(j?.priceChanges)) {
          const updatedTotalCents = Number(j.updatedTotalCents || 0);
          const previousTotalCents = Number(j.previousTotalCents || estimatedTotal || 0);
          const changes = j.priceChanges as ServerPriceChangeNotice[];
          setPendingPriceApproval({
            previousTotalCents,
            updatedTotalCents,
            priceChanges: changes,
          });
          setAcceptedTotalCents(updatedTotalCents);
          if (Array.isArray(items) && typeof setSelection === "function") {
            const updatedCart = applyServerPriceChangesToCartItems(
              items as unknown as Array<Record<string, unknown>>,
              changes,
            );
            for (const updatedItem of updatedCart) {
              const id = String(updatedItem.id || "");
              const availabilityPk = Number(updatedItem.availabilityPk || 0);
              const startAt = String(updatedItem.startAt || "");
              if (id && availabilityPk && startAt) {
                setSelection(id, {
                  day: updatedItem.day ? String(updatedItem.day) : undefined,
                  availabilityPk,
                  startAt,
                  ratePk: updatedItem.ratePk ? Number(updatedItem.ratePk) : undefined,
                  price: typeof updatedItem.price === "number" ? updatedItem.price : undefined,
                  unitCents:
                    typeof updatedItem.unitCents === "number" ? updatedItem.unitCents : undefined,
                });
              }
            }
          }
          setLoading(false);
          return;
        }
        throw new Error(j?.error || "Create intent failed");
      }

      setPendingPriceApproval(null);

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

            <div className="space-y-1">
              <label className="text-sm font-semibold text-slate-700 block">
                Credit card details
                <span className="block text-xs font-normal text-slate-500">
                  Payments are processed securely.
                </span>
                <div className="mt-1.5 rounded-xl border border-slate-300 bg-white p-3 shadow-sm">
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
              </label>
            </div>

            {turnstileSiteKey ? (
              <TurnstileWidget siteKey={turnstileSiteKey} onToken={setTurnstileToken} />
            ) : null}

            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-800">
              Payments are encrypted and processed by Stripe. Tour availability and pricing are verified at confirmation time.
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3.5 text-xs text-slate-700 space-y-2">
              <span className="font-bold text-slate-900 block">Pre-Payment Cancellation & Refund Terms</span>
              {distinctCompanies.length > 0 ? (
                distinctCompanies.map((comp) => {
                  const policy = getOperatorCancellationPolicy(comp);
                  return (
                    <div key={comp} className="border-t border-slate-200/60 pt-2 first:border-0 first:pt-0 space-y-0.5">
                      <span className="font-bold text-slate-800 block text-[11px] uppercase tracking-wide">{policy.operatorName}</span>
                      <p className="leading-relaxed text-slate-600">
                        • <strong>Weather & Safety:</strong> 100% full refund if canceled by operator.
                      </p>
                      <p className="leading-relaxed text-slate-600">
                        • <strong>Guest Cancellation:</strong> {policy.guestCutoffNotice}
                      </p>
                    </div>
                  );
                })
              ) : (
                <p className="leading-relaxed">
                  100% refund if your excursion is canceled due to weather or safety. Specific operator cancellation cutoffs apply as disclosed on your chosen tour.
                </p>
              )}
            </div>

            {pendingPriceApproval ? (
              <div
                role="alert"
                className="rounded-2xl border border-amber-300 bg-amber-50 p-4 text-xs text-amber-950 space-y-2"
              >
                <div className="font-bold text-sm text-amber-900">
                  Live Departure Price Updated — Please Review Before Payment
                </div>
                <p className="text-amber-900 leading-relaxed">
                  The operator’s live rate for your selected departure changed since it was added to your cart. Your card has <strong>not</strong> been charged.
                </p>
                <ul className="space-y-1 border-t border-amber-200 pt-2">
                  {pendingPriceApproval.priceChanges.map((pc, idx) => (
                    <li key={idx} className="flex flex-wrap items-center justify-between gap-2">
                      <span className="font-semibold">
                        {pc.title || `${pc.company} #${pc.itemPk}`} (Qty {pc.qty})
                      </span>
                      <span>
                        <span className="line-through text-amber-700 mr-1.5">
                          {formatCentsUsd(pc.previousLineTotalCents)}
                        </span>
                        <strong className="text-amber-950">
                          {formatCentsUsd(pc.updatedLineTotalCents)}
                        </strong>{" "}
                        ({formatCentsUsd(pc.updatedUnitCents)} each)
                      </span>
                    </li>
                  ))}
                </ul>
                <div className="flex items-center justify-between border-t border-amber-200 pt-2 font-bold text-sm">
                  <span>Updated Order Total</span>
                  <span>
                    <span className="line-through text-amber-700 font-normal mr-2">
                      {formatCentsUsd(pendingPriceApproval.previousTotalCents)}
                    </span>
                    {formatCentsUsd(pendingPriceApproval.updatedTotalCents)}
                  </span>
                </div>
              </div>
            ) : null}

            {err ? <div className="rounded-xl bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-700">{err}</div> : null}

            <button
              type="submit"
              disabled={!stripe || !elements || loading}
              className="w-full rounded-2xl bg-slate-900 py-3 font-black text-white disabled:opacity-60"
            >
              {loading
                ? "Processing…"
                : pendingPriceApproval
                  ? `Accept Updated Total (${formatCentsUsd(pendingPriceApproval.updatedTotalCents)}) & Pay`
                  : "Pay & Confirm Booking"}
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
            {payloadItems.map((it, idx) => {
              const itemPolicy = getOperatorCancellationPolicy(it.company);
              return (
                <li key={idx} className="rounded-xl border border-slate-200 bg-slate-50 p-3 space-y-1">
                  <div className="font-semibold text-slate-900">{it.title || "Tour"}</div>
                  <div className="text-slate-600">{itemPolicy.operatorName || it.company} • Qty {it.qty}</div>
                  {it.startAt ? <div className="text-xs text-slate-500">{String(it.startAt).slice(0, 16).replace("T", " ")}</div> : null}
                  <div className="mt-1 text-[11px] text-slate-500 border-t border-slate-200/60 pt-1">
                    Cancellation: {itemPolicy.guestCutoffNotice}
                  </div>
                </li>
              );
            })}
          </ul>
          <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-600">
            After payment, we finalize booking and show per-tour status in confirmation.
          </div>
        </aside>
      </div>
    </main>
  );
}
