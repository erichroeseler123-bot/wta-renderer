"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import DccHandoffStatusCard from "@/app/components/handoff/DccHandoffStatusCard";
import PartnerForwardCard from "@/app/components/handoff/PartnerForwardCard";
import NewsletterSignup from "@/app/components/newsletter/NewsletterSignup";
import { trackPurchase } from "@/lib/analytics/ga";

type ReceiptResult = {
  ok?: boolean;
  error?: string;
  line?: {
    title?: string;
    qty?: number;
    company?: string;
    startAt?: string;
  };
  booking?: {
    display_id?: string;
    uuid?: string;
    pk?: string | number;
  };
};

type ReceiptItem = {
  title?: string;
  company?: string;
  itemPk?: number;
  qty?: number;
  startAt?: string;
  widgetPlacement?: string | null;
  embedDomain?: string | null;
  widgetId?: string | null;
};

type ReceiptPayload = {
  status?: string;
  results?: ReceiptResult[];
  items?: ReceiptItem[];
  lastError?: string | null;
  order_id?: string;
  totalCents?: number;
  currency?: string;
  attribution?: {
    handoffSource?: string;
    handoffId?: string;
    sourceSlug?: string;
    sourcePage?: string;
    topicSlug?: string;
    authorityTopic?: string;
    referrerPath?: string;
    portSlug?: string;
    productSlug?: string;
    dccReturnUrl?: string;
    date?: string;
    embedDomain?: string;
    embedPath?: string;
    widgetPlacement?: string;
    widgetPlacements?: string[];
    widgetId?: string;
  } | null;
};

export default function SuccessPage() {
  const [data, setData] = useState<ReceiptPayload | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const pi = useMemo(() => {
    if (typeof window === "undefined") return "";
    const u = new URL(window.location.href);
    return u.searchParams.get("payment_intent") || "";
  }, []);

  useEffect(() => {
    if (!pi) return;

    let stop = false;
    let finalizeTriggered = false;

    async function triggerFinalize() {
      if (finalizeTriggered) return;
      finalizeTriggered = true;
      try {
        await fetch("/api/stripe/finalize", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ payment_intent_id: pi }),
        });
      } catch {
        // Ignore here; polling below keeps the page updated.
      }
    }

    async function poll() {
      try {
        const r = await fetch(`/api/receipt?pi=${encodeURIComponent(pi)}`, { cache: "no-store" });
        const j = await r.json();
        if (stop) return;
        setData(j);
        if (j?.status === "pending" || j?.status === "payment_pending" || j?.status === "booking_pending") {
          setTimeout(poll, 1500);
        }
      } catch (e: unknown) {
        if (!stop) setErr(e instanceof Error ? e.message : String(e));
      }
    }
    triggerFinalize();
    poll();
    return () => {
      stop = true;
    };
  }, [pi]);

  const status = data?.status || "pending";
  const isDone = status === "booked" || status === "completed";
  const isFailed = status === "booking_failed" || status === "failed";

  useEffect(() => {
    if (!isDone || !data) return;
    const orderId = data.order_id || pi;
    if (!orderId) return;

    trackPurchase({
      orderId,
      value: typeof data.totalCents === "number" ? data.totalCents / 100 : undefined,
      currency: data.currency || "USD",
      items: data.results?.map((res) => ({
        item_id: String(res.booking?.pk || res.booking?.uuid || ""),
        item_name: res.line?.title || "Alaska Excursion",
        item_brand: res.line?.company || "Welcome to Alaska Tours",
        quantity: res.line?.qty || 1,
      })),
    });
  }, [isDone, data, pi]);

  const headingText = isDone
    ? "Booking Confirmed"
    : isFailed
      ? "Payment Received — Operator Reservation Not Yet Confirmed"
      : "Processing Your Reservation…";

  const subheadingText = isDone
    ? "Your payment and operator reservation have been confirmed."
    : isFailed
      ? "Your payment was recorded, but the operator reservation was not confirmed automatically."
      : "We are verifying your payment and finalizing operator reservation details.";

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10">
      <div className="mx-auto max-w-4xl rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1
          data-testid="checkout-status-heading"
          className="text-3xl font-black tracking-tight text-slate-900"
        >
          {headingText}
        </h1>
        <p className="mt-2 text-slate-600">{subheadingText}</p>
        <p className="mt-2 text-sm text-slate-500">
          {isDone
            ? "Your confirmation details are shown below and a receipt email has been sent."
            : isFailed
              ? "Please note: this page is NOT a confirmed operator ticket. Our team reviews unconfirmed orders to complete the operator booking or issue a prompt refund."
              : "This page updates automatically as operator confirmation completes."}
        </p>

        {isFailed ? (
          <div
            data-testid="booking-unconfirmed-banner"
            role="alert"
            className="mt-4 rounded-2xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-950"
          >
            <div className="font-bold">
              Operator Reservation Unconfirmed ({data?.lastError || "Automated booking disabled or unavailable"})
            </div>
            <p className="mt-1 text-xs leading-relaxed text-amber-900">
              Your excursion reservation with the tour operator has not been finalized yet. Do not treat this screen as a boarding voucher until you receive an official operator confirmation number.
            </p>
          </div>
        ) : null}

        {!pi ? (
          <div className="mt-4 rounded-xl bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-700">
            Missing payment_intent in URL.
          </div>
        ) : null}

        {err ? (
          <div className="mt-4 rounded-xl bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-700">
            {err}
          </div>
        ) : null}

        <div className="mt-6 grid gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 md:grid-cols-[1fr_auto] md:items-end">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">Payment Intent</div>
            <div className="font-mono text-sm break-all text-slate-700">{pi || "n/a"}</div>
          </div>
          <div className="text-right">
            <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">Status</div>
            <div
              data-testid="checkout-status-badge"
              className={`text-lg font-black uppercase ${
                isDone ? "text-emerald-700" : isFailed ? "text-rose-700" : "text-slate-900"
              }`}
            >
              {status}
            </div>
          </div>
        </div>

        {data?.attribution?.handoffSource === "dcc" ? (
          <DccHandoffStatusCard
            handoffId={data.attribution.handoffId}
            status={status}
            sourcePage={data.attribution.sourcePage || data.attribution.referrerPath}
            topic={data.attribution.topicSlug || data.attribution.authorityTopic}
            returnUrl={data.attribution.dccReturnUrl}
            orderId={data.order_id}
            portSlug={data.attribution.portSlug}
            productSlug={data.attribution.productSlug}
            eventDate={data.attribution.date}
            embedDomain={data.attribution.embedDomain}
            embedPath={data.attribution.embedPath}
            widgetPlacement={data.attribution.widgetPlacement}
            widgetId={data.attribution.widgetId}
          />
        ) : null}

        {isDone && data?.attribution?.handoffSource === "dcc" ? (
          <PartnerForwardCard
            handoffId={data.attribution.handoffId}
            orderId={data.order_id}
            dccReturnUrl={data.attribution.dccReturnUrl}
            topic={data.attribution.authorityTopic}
            eventDate={data.attribution.date}
          />
        ) : null}

        {data?.results?.length ? (
          <div className="mt-6 space-y-3">
            {data.results.map((r, idx) => (
              <div key={idx} className="rounded-2xl border border-slate-200 bg-white p-4">
                <div className="font-bold text-slate-900">
                  {r?.line?.title || "Tour"} — qty {r?.line?.qty}
                </div>
                <div className="text-sm text-slate-600">
                  {r?.line?.company} • {r?.line?.startAt || "Time pending"}
                </div>
                {r.ok ? (
                  <div className="mt-2 text-sm font-semibold text-emerald-700">
                    Booked ✓ {r?.booking?.display_id || r?.booking?.uuid || r?.booking?.pk || ""}
                  </div>
                ) : (
                  <div className="mt-2 text-sm font-semibold text-rose-700">
                    Operator Reservation Unconfirmed ✕ {r?.error || "Booking still processing"}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : data?.items?.length ? (
          <div className="mt-6 space-y-3">
            {data.items.map((item, idx) => (
              <div key={idx} className="rounded-2xl border border-slate-200 bg-white p-4">
                <div className="font-bold text-slate-900">
                  {item.title || "Tour"} — qty {item.qty || 1}
                </div>
                <div className="text-sm text-slate-600">
                  {item.company} • {item.startAt || "Time pending"}
                  {item.widgetPlacement ? ` • Placement: ${item.widgetPlacement}` : ""}
                </div>
                <div
                  className={`mt-2 text-sm font-semibold ${
                    isFailed ? "text-rose-700" : "text-amber-700"
                  }`}
                >
                  {isFailed
                    ? `Operator Reservation Unconfirmed ✕ (${data?.lastError || "Awaiting manual confirmation"})`
                    : "Finalizing operator reservation…"}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600">
            {status === "pending" || status === "payment_pending" || status === "booking_pending"
              ? "Finalizing your booking now. This page updates automatically."
              : "No booking line items were returned yet."}
          </div>
        )}

        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/tours" className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-bold text-white hover:bg-slate-700">
            Back to Tours
          </Link>
          <Link href="/" className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-100">
            Return Home
          </Link>
        </div>

        <div className="mt-8">
          <NewsletterSignup
            source="checkout_success"
            title="Want More Alaska Cruise Inspiration?"
            description="We share tour updates, cruise ship news, wildlife and environmental highlights, and practical port tips. Unsubscribe anytime."
          />
        </div>
      </div>
    </main>
  );
}
