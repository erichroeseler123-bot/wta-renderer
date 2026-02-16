"use client";

import { useCart } from "./CartContext";

export default function CartButton() {
  const { count, open } = useCart();

  return (
    <button
      type="button"
      onClick={open}
      className="relative rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/80 hover:bg-white/10 hover:text-white transition"
      aria-label="Open itinerary cart"
      title="Itinerary"
    >
      <span className="mr-2">🧭</span>
      Itinerary
      {count > 0 ? (
        <span className="ml-2 inline-flex min-w-[1.5rem] items-center justify-center rounded-full bg-white/15 px-2 py-0.5 text-xs text-white">
          {count}
        </span>
      ) : null}
    </button>
  );
}
