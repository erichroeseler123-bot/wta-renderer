"use client";

import { useMemo, useState } from "react";

type PlanEventRow = {
  eventId: string;
  occurredAt: string;
  event: string;
  requestedLane?: string;
  resolvedLane?: string;
  degradedFallback?: boolean;
  reason?: string;
  productSlug?: string;
  rank?: number;
  port?: string;
  topic?: string;
  subtype?: string;
  partyType?: string;
  timeWindow?: string;
  budgetBand?: string;
  sourcePage?: string;
};

const EVENT_FILTERS = [
  { value: "all", label: "All Events" },
  { value: "lane", label: "Lane Resolution" },
  { value: "shortlist", label: "Shortlist" },
  { value: "funnel", label: "Funnel Stages" },
  { value: "requested_lane", label: "requested_lane" },
  { value: "resolved_lane", label: "resolved_lane" },
  { value: "shortlist_impression", label: "shortlist_impression" },
  { value: "shortlist_click", label: "shortlist_click" },
  { value: "detail_view", label: "detail_view" },
  { value: "calendar_start", label: "calendar_start" },
  { value: "checkout_start", label: "checkout_start" },
] as const;

const LIMIT_OPTIONS = [
  { value: "50", label: "Last 50" },
  { value: "200", label: "Last 200" },
] as const;

function fmtDate(value?: string) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString();
}

function boolLabel(value?: boolean) {
  if (value === true) return "yes";
  if (value === false) return "no";
  return "—";
}

function matchesEventFilter(row: PlanEventRow, eventFilter: string) {
  if (eventFilter === "all") return true;
  if (eventFilter === "lane") {
    return row.event === "requested_lane" || row.event === "resolved_lane";
  }
  if (eventFilter === "shortlist") {
    return row.event === "shortlist_impression" || row.event === "shortlist_click";
  }
  if (eventFilter === "funnel") {
    return row.event === "detail_view" || row.event === "calendar_start" || row.event === "checkout_start";
  }
  return row.event === eventFilter;
}

function collectLaneOptions(events: PlanEventRow[], field: "requestedLane" | "resolvedLane") {
  return Array.from(
    new Set(events.map((event) => event[field]).filter((value): value is string => Boolean(value))),
  ).sort((a, b) => a.localeCompare(b));
}

function topValues(events: PlanEventRow[], pick: (row: PlanEventRow) => string | undefined, limit = 1) {
  const counts = new Map<string, number>();
  for (const row of events) {
    const value = pick(row);
    if (!value) continue;
    counts.set(value, (counts.get(value) || 0) + 1);
  }

  return Array.from(counts.entries())
    .sort((a, b) => {
      if (b[1] !== a[1]) return b[1] - a[1];
      return a[0].localeCompare(b[0]);
    })
    .slice(0, limit);
}

export default function AdminPlanEventsPage() {
  const [secret, setSecret] = useState("");
  const [events, setEvents] = useState<PlanEventRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [eventFilter, setEventFilter] = useState("all");
  const [requestedLaneFilter, setRequestedLaneFilter] = useState("all");
  const [resolvedLaneFilter, setResolvedLaneFilter] = useState("all");
  const [degradedOnly, setDegradedOnly] = useState(false);
  const [limit, setLimit] = useState("50");

  const requestedLaneOptions = useMemo(
    () => collectLaneOptions(events, "requestedLane"),
    [events],
  );
  const resolvedLaneOptions = useMemo(
    () => collectLaneOptions(events, "resolvedLane"),
    [events],
  );

  const filteredEvents = useMemo(() => {
    return events.filter((row) => {
      if (!matchesEventFilter(row, eventFilter)) return false;
      if (requestedLaneFilter !== "all" && row.requestedLane !== requestedLaneFilter) return false;
      if (resolvedLaneFilter !== "all" && row.resolvedLane !== resolvedLaneFilter) return false;
      if (degradedOnly && row.degradedFallback !== true) return false;
      return true;
    });
  }, [degradedOnly, eventFilter, events, requestedLaneFilter, resolvedLaneFilter]);

  const totalLabel = useMemo(
    () => `${filteredEvents.length} event${filteredEvents.length === 1 ? "" : "s"}`,
    [filteredEvents.length],
  );

  const summary = useMemo(() => {
    const degradedCount = filteredEvents.filter((row) => row.degradedFallback === true).length;
    const degradedRate = filteredEvents.length ? `${Math.round((degradedCount / filteredEvents.length) * 100)}%` : "—";
    const topRequestedLane = topValues(filteredEvents, (row) => row.requestedLane, 1)[0]?.[0] || "—";
    const topResolvedLane = topValues(filteredEvents, (row) => row.resolvedLane, 1)[0]?.[0] || "—";
    const topStages: Array<[string, number]> = topValues(
      filteredEvents.filter((row) => row.event === "detail_view" || row.event === "calendar_start" || row.event === "checkout_start"),
      (row) => row.event,
      3,
    );

    return {
      degradedRate,
      topRequestedLane,
      topResolvedLane,
      topStages: topStages.length ? topStages : ([ ["—", 0] ] as Array<[string, number]>),
    };
  }, [filteredEvents]);

  async function loadEvents() {
    setLoading(true);
    setError(null);
    try {
      const qs = new URLSearchParams({ limit });
      if (secret.trim()) qs.set("secret", secret.trim());
      const response = await fetch(`/api/admin/plan-events?${qs.toString()}`, { cache: "no-store" });
      const json = await response.json().catch(() => null);
      if (!response.ok || !json?.success) {
        throw new Error(json?.error || "Failed to load plan events");
      }
      setEvents(Array.isArray(json.events) ? (json.events as PlanEventRow[]) : []);
      setLoaded(true);
    } catch (err: unknown) {
      setEvents([]);
      setLoaded(true);
      setError(err instanceof Error ? err.message : "Network error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto max-w-7xl px-6 py-10 text-slate-900">
      <h1 className="text-3xl font-black tracking-tight">Recent Plan Events</h1>
      <p className="mt-2 text-sm text-slate-600">
        Read-only chooser telemetry stream for lane resolution, shortlist behavior, and funnel-stage movement.
      </p>

      <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-4">
        <div className="grid gap-3 md:grid-cols-[1fr_180px_auto]">
          <label className="text-sm font-semibold text-slate-700">
            Admin Secret (optional if already logged in)
            <input
              type="password"
              value={secret}
              onChange={(e) => setSecret(e.target.value)}
              className="mt-1 min-h-11 w-full rounded-xl border border-slate-300 px-3 py-2"
              placeholder="WTA_ADMIN_SECRET"
            />
          </label>
          <label className="text-sm font-semibold text-slate-700">
            Window
            <select
              value={limit}
              onChange={(e) => setLimit(e.target.value)}
              className="mt-1 min-h-11 w-full rounded-xl border border-slate-300 px-3 py-2"
            >
              {LIMIT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          <button
            type="button"
            onClick={loadEvents}
            disabled={loading}
            className="min-h-11 self-end rounded-xl bg-slate-900 px-4 py-2 text-sm font-bold text-white disabled:opacity-60"
          >
            {loading ? "Loading..." : "Load Recent Events"}
          </button>
        </div>
      </div>

      <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4">
        <div className="grid gap-3 md:grid-cols-4 xl:grid-cols-5">
          <label className="text-sm font-semibold text-slate-700">
            Event Type
            <select
              value={eventFilter}
              onChange={(e) => setEventFilter(e.target.value)}
              className="mt-1 min-h-11 w-full rounded-xl border border-slate-300 px-3 py-2"
            >
              {EVENT_FILTERS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <label className="text-sm font-semibold text-slate-700">
            Requested Lane
            <select
              value={requestedLaneFilter}
              onChange={(e) => setRequestedLaneFilter(e.target.value)}
              className="mt-1 min-h-11 w-full rounded-xl border border-slate-300 px-3 py-2"
            >
              <option value="all">All requested lanes</option>
              {requestedLaneOptions.map((lane) => (
                <option key={lane} value={lane}>
                  {lane}
                </option>
              ))}
            </select>
          </label>

          <label className="text-sm font-semibold text-slate-700">
            Resolved Lane
            <select
              value={resolvedLaneFilter}
              onChange={(e) => setResolvedLaneFilter(e.target.value)}
              className="mt-1 min-h-11 w-full rounded-xl border border-slate-300 px-3 py-2"
            >
              <option value="all">All resolved lanes</option>
              {resolvedLaneOptions.map((lane) => (
                <option key={lane} value={lane}>
                  {lane}
                </option>
              ))}
            </select>
          </label>

          <label className="flex min-h-11 items-center gap-3 rounded-xl border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 md:mt-6">
            <input
              type="checkbox"
              checked={degradedOnly}
              onChange={(e) => setDegradedOnly(e.target.checked)}
            />
            Degraded fallback only
          </label>

          <button
            type="button"
            onClick={() => {
              setEventFilter("all");
              setRequestedLaneFilter("all");
              setResolvedLaneFilter("all");
              setDegradedOnly(false);
            }}
            className="min-h-11 rounded-xl border border-slate-300 px-4 py-2 text-sm font-bold text-slate-900 md:mt-6"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {error ? <div className="mt-4 rounded-xl bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-700">Error: {error}</div> : null}
      {loaded && !error ? <div className="mt-4 text-sm font-semibold text-slate-600">{totalLabel}</div> : null}

      {loaded && !error ? (
        <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3">
            <div className="text-[11px] font-black uppercase tracking-[0.16em] text-slate-500">Degraded Rate</div>
            <div className="mt-2 text-2xl font-black tracking-tight text-slate-900">{summary.degradedRate}</div>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3">
            <div className="text-[11px] font-black uppercase tracking-[0.16em] text-slate-500">Top Requested Lane</div>
            <div className="mt-2 text-2xl font-black tracking-tight text-slate-900">{summary.topRequestedLane}</div>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3">
            <div className="text-[11px] font-black uppercase tracking-[0.16em] text-slate-500">Top Resolved Lane</div>
            <div className="mt-2 text-2xl font-black tracking-tight text-slate-900">{summary.topResolvedLane}</div>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3">
            <div className="text-[11px] font-black uppercase tracking-[0.16em] text-slate-500">Top Funnel Stages</div>
            <div className="mt-2 space-y-1 text-sm font-semibold text-slate-900">
              {summary.topStages.map(([stage, count], index) => (
                <div key={`${stage}-${index}`}>
                  {index + 1}. {stage} {count > 0 ? `(${count})` : ""}
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : null}

      <div className="mt-4 overflow-x-auto rounded-2xl border border-slate-200 bg-white">
        <table className="min-w-full border-collapse text-sm">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-3 py-3 text-left">Timestamp</th>
              <th className="px-3 py-3 text-left">Event</th>
              <th className="px-3 py-3 text-left">Requested Lane</th>
              <th className="px-3 py-3 text-left">Resolved Lane</th>
              <th className="px-3 py-3 text-left">Degraded</th>
              <th className="px-3 py-3 text-left">Product</th>
              <th className="px-3 py-3 text-left">Rank</th>
              <th className="px-3 py-3 text-left">Port</th>
              <th className="px-3 py-3 text-left">Topic</th>
              <th className="px-3 py-3 text-left">Subtype</th>
            </tr>
          </thead>
          <tbody>
            {filteredEvents.map((row) => (
              <tr key={row.eventId} className="border-t border-slate-100 align-top">
                <td className="px-3 py-3 whitespace-nowrap">{fmtDate(row.occurredAt)}</td>
                <td className="px-3 py-3 font-semibold text-slate-900">{row.event}</td>
                <td className="px-3 py-3">{row.requestedLane || "—"}</td>
                <td className="px-3 py-3">{row.resolvedLane || "—"}</td>
                <td className="px-3 py-3">{boolLabel(row.degradedFallback)}</td>
                <td className="px-3 py-3 font-mono text-xs">{row.productSlug || "—"}</td>
                <td className="px-3 py-3">{typeof row.rank === "number" ? row.rank : "—"}</td>
                <td className="px-3 py-3">{row.port || "—"}</td>
                <td className="px-3 py-3">{row.topic || "—"}</td>
                <td className="px-3 py-3">{row.subtype || "—"}</td>
              </tr>
            ))}
            {loaded && filteredEvents.length < 1 ? (
              <tr>
                <td className="px-3 py-6 text-slate-500" colSpan={10}>
                  No plan events match the current filters.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </main>
  );
}
