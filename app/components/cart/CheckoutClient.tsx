"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useCart } from "./CartContext";

function money(cents?: number) {
  const n = Number(cents || 0);
  return `$${(n / 100).toFixed(2)}`;
}

export default function CheckoutClient({ disabled }: { disabled?: boolean }) {
  const { items, clear } = useCart();
  const [working, setWorking] = useState(false);

  const missingSelection = useMemo(() => {
    return (items || []).some((it) => !it.availabilityPk || !it.startAt);
  }, [items]);

  const totalCents = useMemo(() => {
    return (items || []).reduce((acc, it) => {
      const price = Number(it.price || 0);
      const qty = Number(it.qty || 1);
      return acc + price * qty;
    }, 0);
  }, [items]);

  async function go() {
    if (missingSelection) return;

    setWorking(true);
    try {
      // TODO: This is where you'll call your server booking endpoint.
      // Example future call:
      // await fetch("/api/fareharbor/book", { method:"POST", body: JSON.stringify({ items }) })
      // Then redirect to success page.

      // For now: just simulate "checkout"
      clear();
perl -0777 -pi -e 's/window\.location\.href\s*=\s*["'\'']\/checkout\/success["'\'']\s*;?/alert("Demo mode: checkout is not enabled yet. This preview shows the tour picker + itinerary cart UI.");/g' app/components/cart/CheckoutClient.tsx
    } finally {
      setWorking(false);
    }
  }

  return (
    <div className="space-y-3">
      <div className="rounded-2xl border border-white/10 bg-slate-900/40 p-4">
        <div className="text-xs text-white/60">Order total</div>
        <div className="mt-1 text-2xl font-black text-white">{money(totalCents)}</div>
        <div className="mt-1 text-[11px] text-white/60">
          Total is based on the selected departure time’s FareHarbor rate (when available).
        </div>
      </div>

      {missingSelection ? (
        <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-200">
          One or more items are missing a departure time. Go back and pick a time.
          <div className="mt-2">
            <Link href="/tours" className="underline text-amber-100 hover:text-white">
              Back to tours →
            </Link>
          </div>
        </div>
      ) : null}

      <button
        type="button"
        onClick={go}
        disabled={working || missingSelection || !items?.length}
        className={[
          "w-full rounded-2xl px-5 py-4 text-base font-black shadow-xl transition",
          working
            ? "bg-slate-600 text-white/80 cursor-wait"
            : missingSelection || !items?.length
              ? "bg-slate-300 text-slate-600 cursor-not-allowed"
              : "bg-indigo-700 text-white hover:bg-indigo-800",
        ].join(" ")}
      >
        {working ? "Processing…" : "Checkout"}
      </button>

      <div className="text-[11px] text-white/60">
        No payment collected today. Deposit rules can be shown here (or pulled from supplier).
      </div>
    </div>
  );
}

