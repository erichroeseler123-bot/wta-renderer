"use client";

import Link from "next/link";

export default function PartnerForwardCard(props: {
  handoffId?: string | null;
  orderId?: string | null;
  dccReturnUrl?: string | null;
  topic?: string | null;
  eventDate?: string | null;
}) {
  const { handoffId, orderId, dccReturnUrl, topic, eventDate } = props;

  if (!handoffId) return null;

  const href = `/handoff/partner/partyatredrocks?handoff_id=${encodeURIComponent(handoffId)}&order_id=${encodeURIComponent(orderId || "")}&dcc_return=${encodeURIComponent(dccReturnUrl || "")}&source_page=${encodeURIComponent("/checkout/success")}&topic=${encodeURIComponent(topic || "")}&date=${encodeURIComponent(eventDate || "")}`;

  return (
    <section className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-4">
      <div className="text-xs font-semibold uppercase tracking-wide text-amber-700">Colorado Network</div>
      <h2 className="mt-2 text-lg font-bold text-slate-900">Need Red Rocks concert transport later?</h2>
      <p className="mt-2 text-sm text-slate-700">
        Start with Party At Red Rocks. DCC keeps the shared handoff timeline intact across both sites.
      </p>
      <div className="mt-4">
        <Link
          href={href}
          className="inline-flex items-center rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
        >
          Open Red Rocks Transport
        </Link>
      </div>
    </section>
  );
}
