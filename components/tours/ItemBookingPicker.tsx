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
      <div className="p-4 bg-white rounded-2xl border border-slate-200">
        <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest">
          Selected
        </p>

        <p className="text-2xl font-black text-slate-900">
          {selectedDay ? selectedDay : "--- -- ---"}
        </p>

        <p className="text-sm text-slate-600 mt-1">
          Time: <span className="font-bold">{selectedTimeLabel || "—"}</span>
        </p>

        <p className="text-sm text-slate-600">
          Price: <span className="font-bold">{priceLabel || "Shown at checkout if not listed"}</span>
        </p>

        {ship ? (
          <p className="text-[10px] text-indigo-700 font-bold mt-3 uppercase tracking-widest">
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

      <p className="text-[10px] text-slate-400 font-medium">
        You’ll review your itinerary at checkout. Booking happens through FareHarbor for the selected time.
      </p>
    </div>
  );
}
