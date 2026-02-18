"use client";

import { useMemo, useState } from "react";
import { useCart } from "@/app/components/cart/CartContext";

// you may need to adjust the import below to your actual calendar component
// import ProductDepartureCalendar from "@/components/tours/ProductDepartureCalendar";

type Slot = { availabilityPk?: number; startAt: string };

export default function AddToItineraryPanel({
  company,
  itemPk,
  title,
  image,
  Calendar,
}: {
  company: string;
  itemPk: number;
  title: string;
  image?: string;
  Calendar: (props: { company: string; item: number; onPickSlot: (slot: Slot) => void }) => JSX.Element;
}) {
  const cart = useCart();
  const [slot, setSlot] = useState<Slot | null>(null);

  const when = useMemo(() => {
    if (!slot?.startAt) return null;
    const date = slot.startAt.slice(0, 10);
    const time = slot.startAt.slice(11, 16);
    return { date, time };
  }, [slot?.startAt]);

  return (
    <div className="space-y-3">
      <Calendar company={company} item={itemPk} onPickSlot={(s) => setSlot(s)} />

      <button
        type="button"
        disabled={!when}
        onClick={() => {
          if (!when || !slot) return;
          cart.add({
            company,
            itemPk,
            title,
            image,
            date: when.date,
            time: when.time,
            startAt: slot.startAt,
            qty: 1,
          });
        }}
        className="w-full rounded-2xl bg-slate-950 px-4 py-3 text-sm font-bold text-white disabled:opacity-40"
      >
        {when ? `Add to Itinerary (${when.date} · ${when.time})` : "Pick a time to add"}
      </button>
    </div>
  );
}
