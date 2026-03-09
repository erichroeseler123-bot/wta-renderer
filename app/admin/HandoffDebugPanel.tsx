"use client";

export type HandoffDebugRow = {
  handoffId: string;
  source: string;
  version: string;
  sourceMode: "id" | "payload";
  targetUrl: string;
  intent?: {
    destination?: { portSlug?: string };
    bookingIntent?: { category?: string; date?: string; itemSlug?: string };
    traveler?: { partySize?: number; cruiseDate?: string };
    context?: { referrerPath?: string; authorityTopic?: string; campaign?: string };
  };
  receivedAt: string;
  ip?: string;
  userAgent?: string;
};

export default function HandoffDebugPanel(props: {
  rows: HandoffDebugRow[];
  onRefresh: () => void;
}) {
  const { rows, onRefresh } = props;

  return (
    <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-4">
      <div className="flex items-center justify-between gap-2">
        <div>
          <div className="text-sm text-white/70">DCC handoff debug</div>
          <div className="text-lg font-semibold">Recent received handoffs: {rows.length}</div>
        </div>
        <button
          onClick={onRefresh}
          className="rounded-xl bg-white/10 hover:bg-white/15 px-3 py-2 text-xs"
        >
          Refresh
        </button>
      </div>

      {!rows.length ? (
        <div className="mt-3 text-sm text-white/60">No handoffs recorded yet.</div>
      ) : (
        <div className="mt-4 space-y-2">
          {rows.map((r) => (
            <div key={r.handoffId} className="rounded-xl border border-white/10 bg-black/30 p-3">
              <div className="font-mono text-xs text-white/70">{r.handoffId}</div>
              <div className="text-xs text-white/60 mt-1">
                {r.sourceMode} • {r.receivedAt}
              </div>

              <div className="mt-2 text-sm text-white/80 break-all">{r.targetUrl}</div>

              <div className="mt-2 text-xs text-white/60 flex flex-wrap gap-2">
                {r.intent?.destination?.portSlug ? (
                  <span className="rounded-full bg-white/10 px-2 py-1">port {r.intent.destination.portSlug}</span>
                ) : null}
                {r.intent?.bookingIntent?.category ? (
                  <span className="rounded-full bg-white/10 px-2 py-1">category {r.intent.bookingIntent.category}</span>
                ) : null}
                {r.intent?.bookingIntent?.date ? (
                  <span className="rounded-full bg-white/10 px-2 py-1">date {r.intent.bookingIntent.date}</span>
                ) : null}
                {r.intent?.traveler?.partySize ? (
                  <span className="rounded-full bg-white/10 px-2 py-1">party {r.intent.traveler.partySize}</span>
                ) : null}
                {r.intent?.context?.authorityTopic ? (
                  <span className="rounded-full bg-white/10 px-2 py-1">topic {r.intent.context.authorityTopic}</span>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
