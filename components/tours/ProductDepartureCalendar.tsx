"use client";

import { useEffect, useState } from "react";
import AvailabilityCalendar from "./AvailabilityCalendar";

export type DepartureSelection = {
  availabilityPk: number;
  startAt: string;
  priceCents?: number;
};

type Props = {
  selectedDay: string | null;                 // YYYY-MM-DD
  setSelectedDay: (day: string | null) => void;
  company: string;
  itemPk: number;

  onPickSelection: (sel: DepartureSelection) => void;
};

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
        onPickSlot={(slot) => {
          setSelectedDay(slot.startAt.slice(0, 10));
          onPickSelection({
            availabilityPk: slot.availabilityPk,
            startAt: slot.startAt,
            priceCents: slot.priceCents,
          });
        }}
      />
    </div>
  );
}
