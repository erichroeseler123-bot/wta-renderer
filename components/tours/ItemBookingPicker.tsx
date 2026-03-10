"use client";

import Link from "next/link";
import { useState } from "react";
import { useCruise } from "@/context/CruiseContext";
import { useCart } from "@/app/components/cart/CartContext";

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
  const { open } = useCart();
  const [added, setAdded] = useState(false);
  const showAddedState = added && canAdd && Boolean(selectedDay && selectedTimeLabel);

  const buttonText = !selectedDay
    ? "Select a date to begin"
    : !selectedTimeLabel
      ? "Select a departure time"
      : showAddedState
        ? "Added"
        : "Add to Cart";

  function onPrimaryClick() {
    if (!canAdd) return;
    onAdd();
    setAdded(true);
    window.setTimeout(() => setAdded(false), 2200);
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-4 text-left">
        <h3 className="text-lg font-black tracking-tight text-slate-900">Choose Date and Departure Time</h3>
        <p className="mt-1 text-sm text-slate-600">
          Step 1: Select your date. Step 2: Select a departure time. Step 3: Add this tour to your cart.
        </p>
      </div>

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

      <button
        type="button"
        onClick={onPrimaryClick}
        disabled={!canAdd}
        className={[
          "w-full rounded-2xl py-5 text-lg font-black transition",
          canAdd
            ? "bg-indigo-700 text-white shadow-xl shadow-indigo-700/30 hover:bg-indigo-800"
            : "bg-slate-100 text-slate-400 cursor-not-allowed",
        ].join(" ")}
      >
        {buttonText}
      </button>

      {showAddedState ? (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm font-semibold text-emerald-800">
          Tour added to cart.
          <div className="mt-2 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={open}
              className="rounded-lg bg-emerald-700 px-3 py-1 text-xs font-bold uppercase tracking-wide text-white hover:bg-emerald-800"
            >
              View Cart
            </button>
            <Link
              href="/checkout"
              className="rounded-lg border border-emerald-300 bg-white px-3 py-1 text-xs font-bold uppercase tracking-wide text-emerald-800 hover:bg-emerald-100"
            >
              Checkout
            </Link>
          </div>
        </div>
      ) : null}

      <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-left text-xs text-slate-600">
        <div>Secure payment via Stripe</div>
        <div>Booking confirmed for selected departure</div>
        <div>Receipt and status shown immediately after checkout</div>
      </div>
    </div>
  );
}
