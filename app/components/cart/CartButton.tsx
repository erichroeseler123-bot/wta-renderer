"use client";

import { useCart } from "./CartContext";

export default function CartButton() {
  const { count, open } = useCart();

  return (
    <button
      type="button"
      onClick={open}
      className="relative rounded-xl border border-white/20 bg-white/10 px-3 py-2 text-sm font-semibold text-white transition hover:bg-white/20"
      aria-label="Open itinerary cart"
      title="Cart"
    >
      <span className="mr-2">🛒</span>
      Cart
      {count > 0 ? (
        <span className="ml-2 inline-flex min-w-[1.5rem] items-center justify-center rounded-full bg-cyan-300 px-2 py-0.5 text-xs font-bold text-slate-900">
          {count}
        </span>
      ) : null}
    </button>
  );
}
