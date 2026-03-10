"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { useCart } from "./CartContext";

export default function CartDrawer() {
  const { items, isOpen, close, removeItem, setQty, clear, count } = useCart();
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);
  const estimatedTotal = items.reduce((sum, it) => {
    const line = Number(it.price || 0) * Number(it.qty || 0);
    return sum + (Number.isFinite(line) ? line : 0);
  }, 0);
  const estimatedTotalLabel = estimatedTotal > 0
    ? (estimatedTotal / 100).toLocaleString(undefined, { style: "currency", currency: "USD" })
    : null;

  // ESC to close
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") close();
    }
    if (isOpen) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, close]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <button
        aria-label="Close itinerary cart"
        className="absolute inset-0 bg-black/60"
        onClick={close}
      />

      {/* Panel */}
      <div
        className="absolute right-0 top-0 h-[100dvh] w-full max-w-md border-l border-slate-200 bg-white text-slate-900 shadow-2xl flex flex-col"
        onTouchStart={(e) => {
          const t = e.changedTouches[0];
          touchStartX.current = t.clientX;
          touchStartY.current = t.clientY;
        }}
        onTouchEnd={(e) => {
          const t = e.changedTouches[0];
          const sx = touchStartX.current;
          const sy = touchStartY.current;
          touchStartX.current = null;
          touchStartY.current = null;
          if (sx == null || sy == null) return;
          const deltaX = t.clientX - sx;
          const deltaY = Math.abs(t.clientY - sy);
          if (deltaX > 80 && deltaY < 70) close();
        }}
      >
        <div className="shrink-0 flex items-center justify-between border-b border-slate-200 p-4">
          <div>
            <div className="text-lg font-semibold">Your Cart</div>
            <div className="text-xs text-slate-600">{count} item(s)</div>
          </div>

          <button
            onClick={close}
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
          >
            Close
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto p-4">
          {items.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 text-slate-700">
              Your cart is empty. Browse tours and add a departure to start checkout.
            </div>
          ) : (
            <div className="grid gap-3">
              {items.map((it) => (
                <div
                  key={it.id}
                  className="rounded-2xl border border-slate-200 bg-white p-4"
                >
                  <div className="flex gap-3">
                    <div className="h-16 w-16 overflow-hidden rounded-xl bg-slate-100">
                      {it.image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={it.image}
                          alt={it.title}
                          className="h-full w-full object-cover"
                        />
                      ) : null}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="truncate font-semibold">{it.title}</div>
                      <div className="text-xs text-slate-600">
                        {it.supplierLabel || it.company}
                      </div>
                      {it.headline ? (
                        <div className="mt-1 line-clamp-2 text-sm text-slate-600">
                          {it.headline}
                        </div>
                      ) : null}

                      <div className="mt-3 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <label className="text-xs text-slate-600">Qty</label>
                          <input
                            value={it.qty}
                            onChange={(e) =>
                              setQty(it.id, Number(e.target.value))
                            }
                            className="min-h-11 w-16 rounded-lg border border-slate-300 bg-white px-2 py-1 text-sm text-slate-900 outline-none"
                            inputMode="numeric"
                          />
                        </div>
                        {typeof it.price === "number" ? (
                          <div className="text-sm font-bold text-slate-900">
                            {(Number(it.price) / 100).toLocaleString(undefined, { style: "currency", currency: "USD" })}
                          </div>
                        ) : null}

                        <button
                          onClick={() => removeItem(it.id)}
                          className="text-sm text-slate-500 hover:text-slate-800"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="mt-3">
                    <Link
                      href={`/tours/${it.company}/${it.itemPk}`}
                      onClick={close}
                      className="text-sm font-semibold text-blue-700 hover:underline"
                    >
                      View details →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="shrink-0 border-t border-slate-200 bg-slate-50 p-4 pb-[calc(1rem+env(safe-area-inset-bottom))]">
          {items.length > 0 ? (
            <div className="mb-3 rounded-xl border border-slate-200 bg-white p-3">
              <div className="flex items-center justify-between text-sm">
                <span className="font-semibold text-slate-700">Estimated total</span>
                <span className="text-lg font-black text-slate-900">{estimatedTotalLabel || "Calculated at checkout"}</span>
              </div>
              <div className="mt-1 text-xs text-slate-600">
                Final total is confirmed live at checkout based on selected departure rates.
              </div>
            </div>
          ) : null}
          <div className="flex gap-2">
            <Link
              href="/checkout"
              onClick={close}
              className="flex-1 min-h-11 rounded-xl bg-slate-900 py-2 text-center text-sm font-semibold text-white hover:bg-slate-700"
            >
              Checkout →
            </Link>
            <button
              onClick={clear}
              className="min-h-11 rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm text-slate-700 hover:bg-slate-100"
            >
              Clear
            </button>
          </div>

          <div className="mt-2 text-xs text-slate-600">
            Secure checkout with Stripe. Booking confirmation and receipt are shown immediately after payment.
          </div>
        </div>
      </div>
    </div>
  );
}
