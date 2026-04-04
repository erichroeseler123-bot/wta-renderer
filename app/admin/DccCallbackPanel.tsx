"use client";

export type DccCallbackRow = {
  auditId: string;
  handoffId: string;
  eventType: string;
  endpoint: string | null;
  ok: boolean;
  skipped: boolean;
  responseStatus: number | null;
  error: string | null;
  attemptedAt: string;
  externalReference: string | null;
  payload?: {
    booking?: {
      portSlug?: string;
      productSlug?: string;
    };
    metadata?: {
      embedDomain?: string;
      embedPath?: string;
      widgetPlacement?: string;
      widgetId?: string;
    };
  };
};

export default function DccCallbackPanel(props: {
  rows: DccCallbackRow[];
  onRefresh: () => void;
}) {
  const { rows, onRefresh } = props;
  const widgetRows = rows.filter((row) => row.payload?.metadata?.embedDomain);

  return (
    <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-4">
      <div className="flex items-center justify-between gap-2">
        <div>
          <div className="text-sm text-white/70">DCC callback audit</div>
          <div className="text-lg font-semibold">Recent outbound lifecycle posts: {rows.length}</div>
        </div>
        <button
          onClick={onRefresh}
          className="rounded-xl bg-white/10 px-3 py-2 text-xs hover:bg-white/15"
        >
          Refresh
        </button>
      </div>

      {!rows.length ? (
        <div className="mt-3 text-sm text-white/60">No callback attempts recorded yet.</div>
      ) : (
        <div className="mt-4 space-y-2">
          {rows.map((row) => (
            <div key={row.auditId} className="rounded-xl border border-white/10 bg-black/30 p-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="font-mono text-xs text-white/70">{row.handoffId}</div>
                <div
                  className={`rounded-full px-2 py-1 text-[10px] font-semibold uppercase tracking-wide ${
                    row.ok
                      ? "bg-emerald-500/20 text-emerald-200"
                      : row.skipped
                        ? "bg-amber-500/20 text-amber-200"
                        : "bg-rose-500/20 text-rose-200"
                  }`}
                >
                  {row.ok ? "sent" : row.skipped ? "skipped" : "failed"}
                </div>
              </div>
              <div className="mt-2 text-sm text-white/85">{row.eventType}</div>
              <div className="mt-1 text-xs text-white/55">
                {row.attemptedAt}
                {row.responseStatus ? ` • HTTP ${row.responseStatus}` : ""}
                {row.externalReference ? ` • ${row.externalReference}` : ""}
              </div>
              {row.endpoint ? <div className="mt-2 break-all text-xs text-white/60">{row.endpoint}</div> : null}
              {row.error ? <div className="mt-2 text-xs text-rose-200">{row.error}</div> : null}
            </div>
          ))}
        </div>
      )}

      <div className="mt-6 border-t border-white/10 pt-4">
        <div className="text-sm text-white/70">Widget-origin callbacks</div>
        {!widgetRows.length ? (
          <div className="mt-3 text-sm text-white/60">No widget-origin callback attempts recorded yet.</div>
        ) : (
          <div className="mt-4 space-y-2">
            {widgetRows.map((row) => (
              <div key={`${row.auditId}:widget`} className="rounded-xl border border-cyan-400/20 bg-cyan-500/5 p-3">
                <div className="flex flex-wrap gap-2 text-xs text-cyan-100">
                  <span className="font-semibold">{row.eventType}</span>
                  <span className="font-mono">{row.handoffId}</span>
                </div>
                <div className="mt-2 text-xs text-white/70">
                  {row.payload?.metadata?.embedDomain || "unknown host"}
                  {row.payload?.metadata?.embedPath ? ` • ${row.payload.metadata.embedPath}` : ""}
                </div>
                <div className="mt-1 text-xs text-white/55">
                  {row.payload?.booking?.productSlug || "no product"}
                  {row.payload?.booking?.portSlug ? ` • ${row.payload.booking.portSlug}` : ""}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
