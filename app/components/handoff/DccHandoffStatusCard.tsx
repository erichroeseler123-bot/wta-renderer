"use client";

import Link from "next/link";

type Props = {
  handoffId?: string | null;
  status?: string | null;
  sourcePage?: string | null;
  topic?: string | null;
  returnUrl?: string | null;
  orderId?: string | null;
  portSlug?: string | null;
  productSlug?: string | null;
  eventDate?: string | null;
  embedDomain?: string | null;
  embedPath?: string | null;
  widgetPlacement?: string | null;
  widgetId?: string | null;
};

export default function DccHandoffStatusCard(props: Props) {
  const {
    handoffId,
    status,
    sourcePage,
    topic,
    returnUrl,
    orderId,
    portSlug,
    productSlug,
    eventDate,
    embedDomain,
    embedPath,
    widgetPlacement,
    widgetId,
  } = props;

  if (!handoffId && !returnUrl) return null;

  const returnHref = returnUrl
    ? `/handoff/return?target=${encodeURIComponent(returnUrl)}&handoff_id=${encodeURIComponent(handoffId || "")}&status=${encodeURIComponent(status || "")}&order_id=${encodeURIComponent(orderId || "")}&sourcePage=${encodeURIComponent(sourcePage || "")}&topicSlug=${encodeURIComponent(topic || "")}&portSlug=${encodeURIComponent(portSlug || "")}&productSlug=${encodeURIComponent(productSlug || "")}&eventDate=${encodeURIComponent(eventDate || "")}&embedDomain=${encodeURIComponent(embedDomain || "")}&embedPath=${encodeURIComponent(embedPath || "")}&widgetPlacement=${encodeURIComponent(widgetPlacement || "")}&widgetId=${encodeURIComponent(widgetId || "")}`
    : null;

  return (
    <section className="mt-6 rounded-2xl border border-sky-200 bg-sky-50 p-4">
      <div className="text-xs font-semibold uppercase tracking-wide text-sky-700">DCC Handoff</div>
      <div className="mt-2 text-sm text-slate-700">
        {status ? `Current status: ${status}.` : "This booking came from a Destination Command Center handoff."}
      </div>
      {handoffId ? <div className="mt-2 font-mono text-xs text-slate-600">{handoffId}</div> : null}

      <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-600">
        {topic ? <span className="rounded-full bg-white px-2 py-1">Topic {topic}</span> : null}
        {sourcePage ? <span className="rounded-full bg-white px-2 py-1">From {sourcePage}</span> : null}
      </div>

      {returnHref ? (
        <div className="mt-4">
          <Link
            href={returnHref}
            className="inline-flex items-center rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
          >
            Return To DCC
          </Link>
        </div>
      ) : null}
    </section>
  );
}
