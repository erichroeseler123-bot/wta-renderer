"use client";

import { useCruise } from "@/context/CruiseContext";

export default function ItemBookingPicker({
  selectedDay,
  selectedTimeLabel,
  priceLabel,
  canAdd,
  onAdd,
}: {
  selectedDay: string | null;
  selectedTimeLabel: string | null; // "10:00"
  priceLabel: string | null;        // "$209.00"
  canAdd: boolean;
  onAdd: () => void;
}) {
  const { ship } = useCruise();

  return (
    <div className="text-center space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-4 text-left">
        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
          Selected departure
        </p>

        <p className="text-2xl font-black text-slate-900">
          {selectedDay ? selectedDay : "--- -- ---"}
        </p>

        <p className="mt-1 text-sm text-slate-700">
          Time: <span className="font-bold">{selectedTimeLabel || "—"}</span>
        </p>

        <p className="text-sm text-slate-700">
          Price: <span className="font-bold">{priceLabel || "Shown at checkout if not listed"}</span>
        </p>

        {ship ? (
          <p className="mt-3 text-[10px] font-bold uppercase tracking-widest text-indigo-700">
            Ship: {ship}
          </p>
        ) : null}
      </div>

      <button type="button"
        onClick={onAdd}
        disabled={!canAdd}
        className={[
          "w-full py-5 rounded-2xl font-black text-lg transition",
          canAdd
            ? "bg-indigo-700 text-white shadow-xl shadow-indigo-700/30 hover:bg-indigo-800"
            : "bg-slate-100 text-slate-400 cursor-not-allowed",
        ].join(" ")}
      >
        {canAdd ? "Add to Alaska Itinerary" : "Select a Time Above"}
      </button>

      <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-left text-xs text-slate-600">
        <div>Secure payment via Stripe</div>
        <div>Booking confirmed for selected departure</div>
        <div>Receipt and status shown immediately after checkout</div>
      </div>
    </div>
  );
}
