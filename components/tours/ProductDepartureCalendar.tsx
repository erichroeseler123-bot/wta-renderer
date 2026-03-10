"use client";

import { useEffect, useState } from "react";
import AvailabilityCalendar from "./AvailabilityCalendar";

export type DepartureSelection = {
  availabilityPk: number;
  startAt: string;
  priceCents?: number;

  // NEW
  ratePk: number;
  rateLabel?: string;
  qty: number;
};

type Slot = {
  availabilityPk: number;
  startAt: string;
  priceCents?: number;
  ratePk?: number;
  rateLabel?: string;
  customer_type_rates?: unknown[];
};

type Props = {
  selectedDay: string | null; // YYYY-MM-DD
  setSelectedDay: (day: string | null) => void;
  company: string;
  itemPk: number;

  onPickSelection: (sel: DepartureSelection) => void;
};

function pickRateFromSlot(slot: Slot): { ratePk: number; rateLabel?: string } | null {
  // AvailabilityCalendar's Slot type doesn't include rates yet.
  // So we read optional fields via a loose record.
  const s = slot as unknown as Record<string, unknown>;

  // If AvailabilityCalendar flattens these:
  if (Number.isFinite(Number(s?.ratePk)) && Number(s.ratePk) > 0) {
    return {
      ratePk: Number(s.ratePk),
      rateLabel: s?.rateLabel ? String(s.rateLabel) : undefined,
    };
  }
  if (Number.isFinite(Number(s?.customer_type_rate_pk)) && Number(s.customer_type_rate_pk) > 0) {
    return {
      ratePk: Number(s.customer_type_rate_pk),
      rateLabel: s?.rateLabel ? String(s.rateLabel) : undefined,
    };
  }

  // If AvailabilityCalendar passes through FH's customer_type_rates:
  const rates = s?.customer_type_rates as Array<Record<string, unknown>> | undefined;
  if (Array.isArray(rates) && rates.length) {
    const r0 = rates[0];
    const pk = Number(r0?.pk ?? 0);
    if (Number.isFinite(pk) && pk > 0) {
      const customerType = r0?.customer_type as Record<string, unknown> | undefined;
      const label = String(customerType?.name || r0?.name || "") || undefined;
      return { ratePk: pk, rateLabel: label };
    }
  }

  return null;
}

export default function ProductDepartureCalendar({
  selectedDay,
  setSelectedDay,
  company,
  itemPk,
  onPickSelection,
}: Props) {
  const [booting, setBooting] = useState(false);

  // Default: pick NEXT AVAILABLE day
  useEffect(() => {
    if (selectedDay) return;

    let cancelled = false;
    setBooting(true);

    (async () => {
      try {
        const qs = new URLSearchParams({
          company: String(company),
          itemPk: String(itemPk),
          horizonDays: "365",
          chunkDays: "30",
        });

        const res = await fetch(`/api/fareharbor/next-availability?${qs.toString()}`, {
          cache: "no-store",
        });
        const json = await res.json();

        const startAt =
          (typeof json?.startAt === "string" && json.startAt) ||
          (json?.availabilities?.[0]?.start_at || json?.availabilities?.[0]?.startAt) ||
          null;

        if (!cancelled && typeof startAt === "string" && startAt.length >= 10) {
          setSelectedDay(startAt.slice(0, 10));
        }
      } catch {
        // ignore
      } finally {
        if (!cancelled) setBooting(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [company, itemPk, selectedDay, setSelectedDay]);

  return (
    <div className="bg-[#0f172a] rounded-2xl p-4 shadow-2xl border border-white/10">
      {booting && !selectedDay ? (
        <div className="mb-3 text-sm text-white/70">Finding the next available date…</div>
      ) : null}

      <AvailabilityCalendar
        company={company}
        item={itemPk}
        selectedDayExternal={selectedDay}
        onPickDay={(day) => setSelectedDay(day)}
        onPickSlot={(slot: Slot) => {
          // Slot is typed: only startAt/availabilityPk/priceCents exist.
          setSelectedDay(slot.startAt.slice(0, 10));

          const rate = pickRateFromSlot(slot);
          // If we can't extract a ratePk yet, we still set a selection with a sentinel ratePk=0?
          // Better: do nothing so the UI forces us to wire ratePk properly.
          if (!rate) return;

          onPickSelection({
            availabilityPk: slot.availabilityPk,
            startAt: slot.startAt,
            priceCents: slot.priceCents,
            ratePk: rate.ratePk,
            rateLabel: rate.rateLabel,
            qty: 1,
          });
        }}
      />
    </div>
  );
}
