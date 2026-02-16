"use client";

import Link from "next/link";
import { useCart } from "./CartContext";

export default function CheckoutClient() {
  const { items, clear } = useCart();

  return (
    <div className="mt-6">
      {items.length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-white/70">
          Your itinerary cart is empty.{" "}
          <Link href="/tours" className="text-[#4CC9F0] hover:underline">
            Browse tours →
          </Link>
        </div>
      ) : (
        <>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <div className="text-lg font-semibold text-white">
              Review your itinerary
            </div>
            <div className="mt-1 text-sm text-white/60">
              You’ve selected {items.length} tour(s). Next: open each item’s
              details to book with the supplier.
            </div>

            <div className="mt-5 grid gap-3">
              {items.map((it) => (
                <div
                  key={it.id}
                  className="rounded-2xl border border-white/10 bg-black/20 p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="truncate font-semibold text-white">
                        {it.title}
                      </div>
                      <div className="text-xs text-white/60">
                        {it.supplierLabel || it.company} • Qty {it.qty}
                      </div>
                      {it.headline ? (
                        <div className="mt-2 line-clamp-2 text-sm text-white/70">
                          {it.headline}
                        </div>
                      ) : null}
                    </div>

                    <Link
                      href={`/tours/${it.company}/${it.itemPk}`}
                      className="shrink-0 text-sm text-[#4CC9F0] hover:underline"
                    >
                      Book →
                    </Link>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-5 flex gap-2">
              <Link
                href="/tours"
                className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/80 hover:bg-white/10"
              >
                Add more
              </Link>
              <button
                onClick={clear}
                className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/80 hover:bg-white/10"
              >
                Clear cart
              </button>
            </div>
          </div>

          <div className="mt-4 text-xs text-white/50">
            v2 note: This cart is an itinerary planner. Each supplier checkout
            happens on their FareHarbor flow.
          </div>
        </>
      )}
    </div>
  );
}
