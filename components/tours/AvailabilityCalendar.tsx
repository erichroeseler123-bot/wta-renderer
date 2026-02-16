"use client";

import { useEffect, useMemo, useState } from "react";

type Slot = {
  pk: number;
  start_at?: string;
  startAt?: string;
  capacity?: number | null;
  customer_type_rates?: any[];
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

export default function AvailabilityCalendar({
  company,
  item,
  onPickSlot,
}: {
  company: string;
  item: number;
  onPickSlot: (slot: { availabilityPk: number; startAt: string }) => void;
}) {
  const [month, setMonth] = useState<Date>(() => startOfMonth(new Date()));
  const [loading, setLoading] = useState(false);
  const [days, setDays] = useState<Day[]>([]);
  const [selectedDay, setSelectedDay] = useState<string | null>(null);

  const dayMap = useMemo(() => {
    const m = new Map<string, Day>();
    for (const d of days) m.set(d.day, d);
    return m;
  }, [days]);

  async function loadMonth(d: Date) {
    setLoading(true);
    setSelectedDay(null);

    const start = ymd(startOfMonth(d));
    const end = ymd(addMonths(d, 1)); // exclusive-ish; your API accepts start/end
    const url = `/api/fareharbor/calendar?company=${encodeURIComponent(company)}&item=${item}&start=${start}&end=${end}`;

    const res = await fetch(url, { cache: "no-store" });
    const j = await res.json();

    setDays(j.days || []);
    setLoading(false);
  }

  useEffect(() => {
    loadMonth(month);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [company, item, month.getFullYear(), month.getMonth()]);

  const monthLabel = month.toLocaleString(undefined, {
    month: "long",
    year: "numeric",
  });

  // build a simple grid: Sun..Sat
  const firstDow = new Date(month.getFullYear(), month.getMonth(), 1).getDay(); // 0=Sun
  const dim = daysInMonth(month);
  const cells: Array<{ date: Date | null; dayKey?: string }> = [];

  for (let i = 0; i < firstDow; i++) cells.push({ date: null });

  for (let d = 1; d <= dim; d++) {
    const date = new Date(month.getFullYear(), month.getMonth(), d);
    cells.push({ date, dayKey: ymd(date) });
  }

  const selected = selectedDay ? dayMap.get(selectedDay) : null;

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <div className="text-sm text-white/60">Pick a date</div>
          <div className="text-lg font-semibold text-white">{monthLabel}</div>
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setMonth((m) => addMonths(m, -1))}
            className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/80 hover:bg-white/10"
          >
            ←
          </button>
          <button
            type="button"
            onClick={() => setMonth((m) => addMonths(m, 1))}
            className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/80 hover:bg-white/10"
          >
            →
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-2 text-xs text-white/50 mb-2">
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
            if (!c.date || !c.dayKey)
              return <div key={idx} className="h-12 rounded-xl" />;

            const day = c.dayKey;
            const count = dayMap.get(day)?.slots?.length ?? 0;
            const isActive = count > 0;
            const isSelected = selectedDay === day;

            return (
              <button
                key={day}
                type="button"
                onClick={() => isActive && setSelectedDay(day)}
                disabled={!isActive}
                className={[
                  "h-12 rounded-xl border px-2 text-left transition",
                  isActive
                    ? "border-white/10 bg-white/5 hover:bg-white/10"
                    : "border-white/5 bg-black/20 opacity-40 cursor-not-allowed",
                  isSelected ? "ring-2 ring-white/20" : "",
                ].join(" ")}
              >
                <div className="text-sm font-semibold text-white/90">
                  {c.date.getDate()}
                </div>
                <div className="text-[11px] text-white/60">
                  {count ? `${count} times` : "—"}
                </div>
              </button>
            );
          })}
        </div>
      )}

      <div className="mt-4">
        {!selectedDay ? (
          <div className="text-sm text-white/60">
            Select an available day to see departure times.
          </div>
        ) : !selected?.slots?.length ? (
          <div className="text-sm text-white/60">
            No times found for {selectedDay}.
          </div>
        ) : (
          <div>
            <div className="mb-2 text-sm text-white/70">
              Times for{" "}
              <span className="text-white/90 font-semibold">{selectedDay}</span>
            </div>

            <div className="flex flex-wrap gap-2">
              {selected.slots.map((s) => {
                const start = (s.start_at ?? s.startAt ?? "").replace("T", " ");
                const label = start.slice(11, 16); // HH:MM
                return (
                  <button
                    key={s.pk}
                    type="button"
                    onClick={() =>
                      onPickSlot({
                        availabilityPk: s.pk,
                        startAt: s.start_at ?? s.startAt ?? "",
                      })
                    }
                    className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/85 hover:bg-white/10"
                  >
                    {label}
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
