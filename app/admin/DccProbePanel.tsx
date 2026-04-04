"use client";

export type DccProbeResult = {
  success: boolean;
  row?: {
    handoffId: string;
    endpoint: string | null;
    ok: boolean;
    skipped: boolean;
    responseStatus: number | null;
    responseBody: string | null;
    error: string | null;
    attemptedAt: string;
  };
  error?: string;
};

export default function DccProbePanel(props: {
  onRun: () => void;
  running: boolean;
  result: DccProbeResult | null;
}) {
  const { onRun, running, result } = props;

  return (
    <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="text-sm text-white/70">DCC callback probe</div>
          <div className="text-lg font-semibold">Send one test event to the live DCC endpoint</div>
        </div>
        <button
          onClick={onRun}
          disabled={running}
          className="rounded-xl bg-white/10 px-3 py-2 text-xs hover:bg-white/15 disabled:opacity-50"
        >
          {running ? "Sending..." : "Run Probe"}
        </button>
      </div>

      {result ? (
        <div className="mt-4 rounded-xl border border-white/10 bg-black/30 p-3 text-sm">
          <div className="font-mono text-xs text-white/70">{result.row?.handoffId || "probe_failed"}</div>
          <div className="mt-2 text-white/85">
            {result.row?.ok ? "Probe succeeded" : "Probe failed"}
            {result.row?.responseStatus ? ` • HTTP ${result.row.responseStatus}` : ""}
          </div>
          {result.row?.endpoint ? <div className="mt-2 break-all text-xs text-white/60">{result.row.endpoint}</div> : null}
          {result.row?.responseBody ? <pre className="mt-2 overflow-x-auto text-xs text-emerald-200">{result.row.responseBody}</pre> : null}
          {result.row?.error || result.error ? <div className="mt-2 text-xs text-rose-200">{result.row?.error || result.error}</div> : null}
        </div>
      ) : null}
    </div>
  );
}
