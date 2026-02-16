"use client";

import { useEffect, useMemo, useState } from "react";
import { useCart } from "@/app/components/cart/CartContext";

type Rate = {
  pk: number;
  capacity: number | null;
  customer_type: { singular: string; note?: string | null };
  customer_prototype: { total: number };
};

type Slot = {
  pk: number;
  start_at: string;
  end_at?: string;
  capacity?: number | null;
  customer_type_rates: Rate[];
};

type CalendarResponse = {
  ok: boolean;
  days: Array<{ day: string; slots: Slot[] }>;
  totalSlots?: number;
  error?: string;
};

function ymd(d: Date) {
  return d.toISOString().slice(0, 10);
}
function monthStartYmd(d: Date) {
  return ymd(new Date(d.getFullYear(), d.getMonth(), 1));
}
function nextMonthStart(startYmd: string) {
  const d = new Date(startYmd + "T00:00:00");
  return ymd(new Date(d.getFullYear(), d.getMonth() + 1, 1));
}
function formatTime(start_at: string) {
  const t = start_at.split("T")[1] || "";
  return t.slice(0, 5);
}
function formatDateTime(start_at: string) {
  const [date, timePart] = start_at.split("T");
  const hhmm = (timePart || "").slice(0, 5);
  return `${date} ${hhmm}`;
}
function centsToUsd(cents: number) {
  const dollars = (cents || 0) / 100;
  return dollars.toLocaleString(undefined, {
    style: "currency",
    currency: "USD",
  });
}
export default function ItemBookingPicker({
  company,
  itemPk,
  title,
}: {
  company: string;
  itemPk: number;
  title: string;
}) {
  const { addItem: add } = useCart();

  const [monthStart, setMonthStart] = useState(() => monthStartYmd(new Date()));
  const [days, setDays] = useState<Array<{ day: string; slots: Slot[] }>>([]);
  const [selected, setSelected] = useState<Slot | null>(null);
  const [qty, setQty] = useState<Record<number, number>>({});
  const [loading, setLoading] = useState(false);
  const [jumping, setJumping] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const totalQty = useMemo(
    () => Object.values(qty).reduce((a, b) => a + (b || 0), 0),
    [qty],
  );
  const canAdd = !!selected && totalQty > 0;

  function pickSlot(slot: Slot) {
    setSelected(slot);
    setQty({});
  }

  function setRate(ratePk: number, n: number) {
    setQty((prev) => ({ ...prev, [ratePk]: Math.max(0, n) }));
  }

  function addToCart() {
    if (!selected) return;

    const selections = (selected.customer_type_rates || [])
      .map((r) => ({
        ratePk: r.pk,
        qty: qty[r.pk] || 0,
        label: r.customer_type?.singular || "Passenger",
        price: r.customer_prototype?.total || 0,
      }))
      .filter((x) => x.qty > 0);

    if (!selections.length) return;

    const totalPrice = selections.reduce(
      (sum, s) => sum + (s.qty || 0) * (s.price || 0),
      0,
    );
    const breakdown = selections
      .map((s) => String(s.qty) + " " + s.label + (s.qty === 1 ? "" : "s"))
      .join(", ");
    const headline =
      (breakdown || totalQty + " Passenger" + (totalQty === 1 ? "" : "s")) +
      " • " +
      centsToUsd(totalPrice);

    add(
      {
        company,
        itemPk,
        title,
        availabilityPk: selected.pk,
        startAt: selected.start_at,
        price: totalPrice,
        headline,
      },
      totalQty,
    );
  }

  async function fetchCalendar(start: string) {
    const end = nextMonthStart(start);
    const url = `/api/fareharbor/calendar?company=${encodeURIComponent(
      company,
    )}&item=${encodeURIComponent(String(itemPk))}&start=${encodeURIComponent(
      start,
    )}&end=${encodeURIComponent(end)}`;

    const r = await fetch(url, { cache: "no-store" });
    const j = (await r.json()) as CalendarResponse;
    return { start, end, j };
  }

  async function jumpToNextAvailable(fromYmd: string) {
    setJumping(true);
    setError(null);
    try {
      const url = `/api/fareharbor/next-availability?company=${encodeURIComponent(
        company,
      )}&item=${encodeURIComponent(String(itemPk))}&start=${encodeURIComponent(
        fromYmd,
      )}&horizonDays=365&chunkDays=30`;

      const r = await fetch(url, { cache: "no-store" });
      const j = await r.json();

      const first = (j.availabilities || [])[0];
      const start_at: string | undefined = first?.start_at || first?.startAt;

      if (!start_at) {
        setError("No upcoming availability found.");
        return;
      }

      const targetMonth = monthStartYmd(
        new Date(start_at.slice(0, 10) + "T00:00:00"),
      );
      setMonthStart(targetMonth);
    } catch {
      setError("Could not find next availability.");
    } finally {
      setJumping(false);
    }
  }

  useEffect(() => {
    let alive = true;
    setLoading(true);
    setError(null);
    setSelected(null);
    setQty({});

    (async () => {
      try {
        const { j } = await fetchCalendar(monthStart);
        if (!alive) return;

        setDays(j.days || []);

        const total = (j.days || []).reduce(
          (sum, d) => sum + (d.slots?.length || 0),
          0,
        );

        if (total === 0) {
          await jumpToNextAvailable(ymd(new Date()));
        }
      } catch {
        if (!alive) return;
        setDays([]);
        setError("Failed to load availability.");
      } finally {
        if (!alive) return;
        setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [company, itemPk, monthStart]);

  const totalSlotsThisMonth = useMemo(
    () => days.reduce((sum, d) => sum + (d.slots?.length || 0), 0),
    [days],
  );

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <div className="flex items-center justify-between gap-3">
        <div className="text-white/90 font-semibold">Choose a departure</div>

        <input
          className="rounded-xl bg-black/30 border border-white/10 px-3 py-2 text-white/80"
          type="month"
          value={monthStart.slice(0, 7)}
          onChange={(e) => setMonthStart(e.target.value + "-01")}
        />
      </div>

      <div className="mt-2 text-xs text-white/50 flex items-center justify-between">
        <div>
          {loading
            ? "Loading availability…"
            : `${totalSlotsThisMonth} departures this month`}
        </div>
        <button
          type="button"
          onClick={() => jumpToNextAvailable(ymd(new Date()))}
          disabled={jumping}
          className="text-[#4CC9F0] hover:underline disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {jumping ? "Searching…" : "Jump to next available"}
        </button>
      </div>

      {error ? (
        <div className="mt-3 rounded-xl border border-red-400/20 bg-red-500/10 p-3 text-sm text-red-200">
          {error}
        </div>
      ) : null}

      {!loading && totalSlotsThisMonth === 0 ? (
        <div className="mt-4 rounded-xl border border-white/10 bg-black/20 p-4">
          <div className="text-white/80 font-semibold">
            No departures this month
          </div>
          <div className="mt-1 text-sm text-white/60">
            This tour is seasonal. Try late spring / summer (June is common).
          </div>
          <button
            type="button"
            onClick={() => jumpToNextAvailable(ymd(new Date()))}
            disabled={jumping}
            className="mt-3 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/85 hover:bg-white/10 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {jumping
              ? "Finding next availability…"
              : "Show next available month"}
          </button>
        </div>
      ) : null}

      <div className="mt-3 grid gap-2">
        {days.map((d) => (
          <div
            key={d.day}
            className="rounded-xl border border-white/10 bg-black/20 p-3"
          >
            <div className="text-white/70 text-sm mb-2">{d.day}</div>
            <div className="flex flex-wrap gap-2">
              {d.slots.map((s) => (
                <button
                  key={s.pk}
                  onClick={() => pickSlot(s)}
                  className={`rounded-xl px-3 py-2 text-sm border ${
                    selected?.pk === s.pk
                      ? "border-[#4CC9F0]/50 bg-[#4CC9F0]/15 text-white"
                      : "border-white/10 bg-white/5 text-white/80 hover:bg-white/10"
                  }`}
                  type="button"
                >
                  {formatTime(s.start_at)}
                </button>
              ))}
              {d.slots.length === 0 ? (
                <div className="text-xs text-white/40">No times</div>
              ) : null}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4">
        {!selected ? (
          <div className="text-sm text-white/60">
            Select a time to choose passenger types.
          </div>
        ) : (
          <div className="space-y-2">
            <div className="text-white/80 text-sm">
              Selected:{" "}
              <span className="text-white">
                {formatDateTime(selected.start_at)}
              </span>
            </div>

            {(selected.customer_type_rates || []).map((r) => {
              const n = qty[r.pk] || 0;
              const price = r.customer_prototype?.total || 0;

              return (
                <div
                  key={r.pk}
                  className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-3 py-2"
                >
                  <div className="min-w-0">
                    <div className="text-white/90 text-sm truncate">
                      {r.customer_type?.singular}{" "}
                      <span className="text-white/50">
                        • {centsToUsd(price)}
                      </span>
                    </div>
                    {r.customer_type?.note ? (
                      <div className="text-white/50 text-xs">
                        {r.customer_type.note}
                      </div>
                    ) : null}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      className="rounded-lg border border-white/10 bg-black/30 px-2 py-1"
                      onClick={() => setRate(r.pk, n - 1)}
                    >
                      -
                    </button>
                    <div className="w-6 text-center text-white/80">{n}</div>
                    <button
                      type="button"
                      className="rounded-lg border border-white/10 bg-black/30 px-2 py-1"
                      onClick={() => setRate(r.pk, n + 1)}
                    >
                      +
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/80">
        Choose a departure time in the calendar to continue.
      </div>
    </div>
  );
}
