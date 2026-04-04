"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import DccHandoffStatusCard from "@/app/components/handoff/DccHandoffStatusCard";
import PartnerForwardCard from "@/app/components/handoff/PartnerForwardCard";
import NewsletterSignup from "@/app/components/newsletter/NewsletterSignup";

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

type ReceiptPayload = {
  status?: string;
  results?: ReceiptResult[];
  order_id?: string;
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

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10">
      <div className="mx-auto max-w-4xl rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-3xl font-black tracking-tight text-slate-900">Booking Confirmation</h1>
        <p className="mt-2 text-slate-600">
          Payment was received. We are finalizing your booking details and operator confirmations.
        </p>
        <p className="mt-2 text-sm text-slate-500">
          You should receive a payment receipt email, and tour confirmation details are shown below as processing completes.
        </p>

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
            <div className={`text-lg font-black uppercase ${isDone ? "text-emerald-700" : "text-slate-900"}`}>
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
                    Pending/Failed ✕ {r?.error || "Booking still processing"}
                  </div>
                )}
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
