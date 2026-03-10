"use client";

import { useEffect, useMemo, useState } from "react";

type Rate = {
  pk?: number;
  name?: string;

  // FH can vary wildly here:
  price?: number | string | null;          // sometimes dollars
  price_cents?: number | null;             // sometimes cents
  amount?: number | string | null;         // sometimes dollars
  amount_cents?: number | null;            // sometimes cents
  price_with_tax?: number | string | null;
  price_with_tax_cents?: number | null;
};

type Slot = {
  pk: number;
  start_at?: string;
  startAt?: string;
  capacity?: number | null;
  customer_type_rates?: Rate[] | unknown[];
  ratePk?: number;
  rateLabel?: string;
};

type Day = {
  day: string; // "YYYY-MM-DD"
  slots: Slot[];
};

function ymd(d: Date) {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function startOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

function addMonths(d: Date, n: number) {
  return new Date(d.getFullYear(), d.getMonth() + n, 1);
}

function daysInMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
}

function parseMoneyToCents(v: unknown): number | undefined {
  if (v === null || v === undefined) return undefined;

  if (typeof v === "number" && Number.isFinite(v)) {
    // Heuristic: if it looks like cents already (e.g., 20900), keep it
    if (v >= 1000) return Math.round(v);
    // else treat as dollars
    if (v > 0) return Math.round(v * 100);
    return undefined;
  }

  if (typeof v === "string") {
    const s = v.trim().replace(/[^0-9.]/g, "");
    if (!s) return undefined;
    const n = Number(s);
    if (!Number.isFinite(n) || n <= 0) return undefined;
    // if string looks like "20900" (no decimal) it might already be cents,
    // but most FH strings are dollars. We'll treat as dollars unless huge.
    if (n >= 1000 && !s.includes(".")) return Math.round(n);
    return Math.round(n * 100);
  }

  return undefined;
}

function minPriceCentsFromRates(rates: unknown[] | undefined): number | undefined {
  if (!rates || !Array.isArray(rates) || rates.length === 0) return undefined;

  const candidates: number[] = [];
  for (const r of rates) {
    const rate = r as Record<string, unknown>;
    const cents =
      parseMoneyToCents(rate.price_with_tax_cents) ??
      parseMoneyToCents(rate.price_cents) ??
      parseMoneyToCents(rate.amount_cents) ??
      parseMoneyToCents(rate.price_with_tax) ??
      parseMoneyToCents(rate.price) ??
      parseMoneyToCents(rate.amount);

    if (typeof cents === "number" && Number.isFinite(cents) && cents > 0) {
      candidates.push(cents);
    }
  }
  if (!candidates.length) return undefined;
  return Math.min(...candidates);
}

function fmtCents(cents?: number) {
  if (!cents || !Number.isFinite(cents) || cents <= 0) return "";
  const dollars = cents / 100;
  return dollars.toLocaleString(undefined, { style: "currency", currency: "USD" });
}

export default function AvailabilityCalendar({
  company,
  item,
  selectedDayExternal,
  onPickDay,
  onPickSlot,
}: {
  company: string;
  item: number;
  selectedDayExternal?: string | null;
  onPickDay?: (day: string) => void;
  onPickSlot: (slot: {
    availabilityPk: number;
    startAt: string;
    priceCents?: number;
    ratePk?: number;
    rateLabel?: string;
    customer_type_rates?: Rate[] | unknown[];
  }) => void;
}) {
  const [month, setMonth] = useState<Date>(() => startOfMonth(new Date()));
  const [loading, setLoading] = useState(false);
  const [days, setDays] = useState<Day[]>([]);
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [selectedSlotPk, setSelectedSlotPk] = useState<number | null>(null);

  const [jumping, setJumping] = useState(false);
  const [jumpMsg, setJumpMsg] = useState<string | null>(null);

  // parent-selected day -> sync internal + month
  useEffect(() => {
    if (!selectedDayExternal) return;
    if (selectedDayExternal === selectedDay) return;

    setSelectedDay(selectedDayExternal);
    setSelectedSlotPk(null);
    const d = new Date(selectedDayExternal + "T00:00:00");
    setMonth(startOfMonth(d));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDayExternal]);

  const dayMap = useMemo(() => {
    const m = new Map<string, Day>();
    for (const d of days) m.set(d.day, d);
    return m;
  }, [days]);

  const dayMinPrice = useMemo(() => {
    const m = new Map<string, number>();
    for (const d of days) {
      let best: number | undefined;
      for (const s of d.slots || []) {
        const p = minPriceCentsFromRates(s.customer_type_rates as unknown[]);
        if (typeof p === "number") best = typeof best === "number" ? Math.min(best, p) : p;
      }
      if (typeof best === "number") m.set(d.day, best);
    }
    return m;
  }, [days]);

  async function loadMonth(d: Date) {
    setLoading(true);
    setJumpMsg(null);

    const start = ymd(startOfMonth(d));
    const end = ymd(addMonths(d, 1));

    const url =
      `/api/fareharbor/calendar?company=${encodeURIComponent(company)}` +
      `&item=${encodeURIComponent(String(item))}` +
      `&start=${encodeURIComponent(start)}` +
      `&end=${encodeURIComponent(end)}`;

    const res = await fetch(url, { cache: "no-store" });
    const j = await res.json();

    const nextDays: Day[] = j?.days || [];
    setDays(nextDays);
    setLoading(false);

    // FH calendar often returns ONLY days that have availability.
    // If selected day isn't in this payload, snap to first available day.
    if (nextDays.length) {
      if (!selectedDay) {
        setSelectedDay(nextDays[0].day);
        setSelectedSlotPk(null);
        onPickDay?.(nextDays[0].day);
      } else if (!nextDays.some((x) => x.day === selectedDay)) {
        setSelectedDay(nextDays[0].day);
        setSelectedSlotPk(null);
        onPickDay?.(nextDays[0].day);
      }
    }
  }

  async function jumpToNextAvailable() {
    setJumping(true);
    setJumpMsg(null);

    try {
      const start = ymd(new Date());
      const url =
        `/api/fareharbor/next-availability?company=${encodeURIComponent(company)}` +
        `&item=${encodeURIComponent(String(item))}` +
        `&start=${encodeURIComponent(start)}` +
        `&horizonDays=365&chunkDays=30`;

      const res = await fetch(url, { cache: "no-store" });
      const j = await res.json();

      const startAt =
        (typeof j?.startAt === "string" && j.startAt) ||
        (typeof j?.start_at === "string" && j.start_at) ||
        (j?.availabilities?.[0]?.start_at as string | undefined) ||
        (j?.availabilities?.[0]?.startAt as string | undefined);

      if (!startAt) {
        setJumpMsg("No upcoming departures found in the next 12 months.");
        return;
      }

      const targetDay = String(startAt).slice(0, 10);
      const targetDate = new Date(targetDay + "T00:00:00");

      setMonth(startOfMonth(targetDate));
      setSelectedDay(targetDay);
      setSelectedSlotPk(null);
      onPickDay?.(targetDay);
    } catch {
      setJumpMsg("Could not find next availability.");
    } finally {
      setJumping(false);
    }
  }

  useEffect(() => {
    loadMonth(month);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [company, item, month.getFullYear(), month.getMonth()]);

  const monthLabel = month.toLocaleString(undefined, { month: "long", year: "numeric" });
  const firstDow = new Date(month.getFullYear(), month.getMonth(), 1).getDay();
  const dim = daysInMonth(month);

  const cells: Array<{ date: Date | null; dayKey?: string }> = [];
  for (let i = 0; i < firstDow; i++) cells.push({ date: null });
  for (let d = 1; d <= dim; d++) {
    const date = new Date(month.getFullYear(), month.getMonth(), d);
    cells.push({ date, dayKey: ymd(date) });
  }

  const selected = selectedDay ? dayMap.get(selectedDay) : null;

  return (
    <div className="rounded-2xl border border-white/10 bg-slate-900/80 backdrop-blur-md p-4">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="text-xs text-white/60">Departures</div>
          <div className="text-lg font-semibold text-white">{monthLabel}</div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={jumpToNextAvailable}
            disabled={jumping}
            className="rounded-xl bg-[#4CC9F0]/15 px-3 py-2 text-sm font-semibold text-[#4CC9F0] hover:bg-[#4CC9F0]/25 disabled:opacity-50"
          >
            {jumping ? "Finding…" : "Next available"}
          </button>

          <button
            type="button"
            onClick={() => setMonth((m) => addMonths(m, -1))}
            className="rounded-xl border border-white/10 bg-slate-900/80 px-3 py-2 text-sm text-white/85 hover:bg-white/5"
          >
            Prev month
          </button>
          <button
            type="button"
            onClick={() => setMonth((m) => addMonths(m, 1))}
            className="rounded-xl border border-white/10 bg-slate-900/80 px-3 py-2 text-sm text-white/85 hover:bg-white/5"
          >
            Next month
          </button>
        </div>
      </div>

      {jumpMsg ? <div className="mb-3 text-sm text-white/70">{jumpMsg}</div> : null}

      <div className="grid grid-cols-7 gap-2 text-[11px] text-white/50 mb-2">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
          <div key={d} className="px-1">
            {d}
          </div>
        ))}
      </div>

      {loading ? (
        <div className="text-sm text-white/70">Loading availability…</div>
      ) : (
        <div className="grid grid-cols-7 gap-2">
          {cells.map((c, idx) => {
            if (!c.date || !c.dayKey) return <div key={idx} className="h-10 rounded-xl" />;

            const day = c.dayKey;
            const count = dayMap.get(day)?.slots?.length ?? 0;
            const isActive = count > 0;
            const isSelected = selectedDay === day;
            const minCents = dayMinPrice.get(day);

            return (
              <button
                key={day}
                type="button"
                onClick={() => {
                  if (!isActive) return;
                  setSelectedDay(day);
                  setSelectedSlotPk(null);
                  onPickDay?.(day);
                }}
                disabled={!isActive}
                className={[
                  "h-10 rounded-xl border px-2 text-left transition",
                  isActive
                    ? "border-white/10 bg-slate-900/80 hover:bg-white/5"
                    : "border-white/5 bg-black/20 opacity-40 cursor-not-allowed",
                  isSelected ? "ring-2 ring-white/20" : "",
                ].join(" ")}
              >
                <div className="flex items-center justify-between">
                  <div className="text-sm font-semibold text-white/90">{c.date.getDate()}</div>
                  {minCents ? (
                    <div className="text-[10px] text-white/65">{fmtCents(minCents)}</div>
                  ) : null}
                </div>
                <div className="text-[10px] text-white/60">{count ? `${count} time${count === 1 ? "" : "s"}` : "—"}</div>
              </button>
            );
          })}
        </div>
      )}

      <div className="mt-4">
        {!selectedDay ? (
          <div className="text-sm text-white/60">Pick a date to see times.</div>
        ) : !selected?.slots?.length ? (
          <div className="text-sm text-white/60">No times found for {selectedDay}.</div>
        ) : (
          <div>
            <div className="mb-2 text-sm text-white/70">
              Times for <span className="text-white/90 font-semibold">{selectedDay}</span>
            </div>

            <div className="flex flex-wrap gap-2">
              {selected.slots.map((s) => {
                const start = String(s.start_at ?? s.startAt ?? "");
                const label = start.slice(11, 16);
                const priceCents = minPriceCentsFromRates(s.customer_type_rates as unknown[]);
                const firstRate = Array.isArray(s.customer_type_rates) ? s.customer_type_rates[0] : null;
                const ratePk = Number(firstRate?.pk ?? 0) || undefined;
                const rateLabel = firstRate?.customer_type?.name || firstRate?.name || undefined;
                const isPicked = selectedSlotPk === s.pk;

                return (
                  <button
                    key={s.pk}
                    type="button"
                    onClick={() => {
                      setSelectedSlotPk(s.pk);
                      onPickSlot({
                        availabilityPk: s.pk,
                        startAt: String(s.start_at ?? s.startAt ?? ""),
                        priceCents,
                        ratePk,
                        rateLabel,
                        customer_type_rates: s.customer_type_rates,
                      });
                    }}
                    className={[
                      "rounded-xl border px-3 py-2 text-sm transition",
                      "border-white/10 bg-slate-900/80 text-white/85 hover:bg-white/5",
                      isPicked ? "ring-2 ring-white/20" : "",
                    ].join(" ")}
                  >
                    <span>{label || "Time"}</span>
                    {priceCents ? (
                      <span className="ml-2 text-white/60">{fmtCents(priceCents)}</span>
                    ) : null}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
