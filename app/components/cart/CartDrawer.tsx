"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useCart } from "./CartContext";

export default function CartDrawer() {
  const { items, isOpen, close, removeItem, setQty, clear, count } = useCart();

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
      <div className="absolute right-0 top-0 h-full w-full max-w-md border-l border-white/10 bg-zinc-950 text-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-white/10 p-4">
          <div>
            <div className="text-lg font-semibold">Your Itinerary</div>
            <div className="text-xs text-white/60">{count} item(s)</div>
          </div>

          <button
            onClick={close}
            className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/80 hover:bg-white/10"
          >
            Close
          </button>
        </div>

        <div className="h-[calc(100%-140px)] overflow-auto p-4">
          {items.length === 0 ? (
            <div className="rounded-2xl border border-white/10 bg-white/5 p-5 text-white/70">
              Your itinerary is empty. Go add tours from the Tours page.
            </div>
          ) : (
            <div className="grid gap-3">
              {items.map((it) => (
                <div
                  key={it.id}
                  className="rounded-2xl border border-white/10 bg-white/5 p-4"
                >
                  <div className="flex gap-3">
                    <div className="h-16 w-16 overflow-hidden rounded-xl bg-white/5">
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
                      <div className="text-xs text-white/60">
                        {it.supplierLabel || it.company}
                      </div>
                      {it.headline ? (
                        <div className="mt-1 line-clamp-2 text-sm text-white/70">
                          {it.headline}
                        </div>
                      ) : null}

                      <div className="mt-3 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <label className="text-xs text-white/60">Qty</label>
                          <input
                            value={it.qty}
                            onChange={(e) =>
                              setQty(it.id, Number(e.target.value))
                            }
                            className="w-16 rounded-lg border border-white/10 bg-black/30 px-2 py-1 text-sm text-white outline-none"
                            inputMode="numeric"
                          />
                        </div>

                        <button
                          onClick={() => removeItem(it.id)}
                          className="text-sm text-white/70 hover:text-white"
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
                      className="text-sm text-[#4CC9F0] hover:underline"
                    >
                      View details →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="border-t border-white/10 p-4">
          <div className="flex gap-2">
            <Link
              href="/checkout"
              onClick={close}
              className="flex-1 rounded-xl bg-white text-center py-2 text-sm font-semibold text-black hover:opacity-90"
            >
              Checkout →
            </Link>
            <button
              onClick={clear}
              className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/80 hover:bg-white/10"
            >
              Clear
            </button>
          </div>

          <div className="mt-2 text-xs text-white/50">
            This is your multi-item itinerary cart (v2). Payment/availability
            happens per supplier.
          </div>
        </div>
      </div>
    </div>
  );
}
