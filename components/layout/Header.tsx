"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useCruise } from "@/context/CruiseContext";
import ShipPicker from "./ShipPicker";
import CartDrawer from "@/app/components/cart/CartDrawer";
import CartButton from "@/app/components/cart/CartButton";

export default function Header() {
  const { ship, date, setCruise } = useCruise();
  const [isPickerOpen, setIsPickerOpen] = useState(false);

  // Hide owner link unless URL has ?admin=1
  const showOwner = useMemo(() => {
    if (typeof window === "undefined") return false;
    return new URLSearchParams(window.location.search).has("admin");
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (ship && date) return;

    const sp = new URLSearchParams(window.location.search);
    const shipFromUrl = sp.get("cruiseShip") || "";
    const dateFromUrl = sp.get("date") || sp.get("cruiseDate") || "";

    if (shipFromUrl && dateFromUrl) {
      setCruise(shipFromUrl, dateFromUrl);
    }
  }, [ship, date, setCruise]);

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[#0F172A] px-6 py-4">
      <div className="mx-auto flex max-w-7xl items-center justify-between">
        <Link
          href="/"
          className="text-xl font-black tracking-tighter text-white/90 hover:text-white"
        >
          Welcome <span className="text-blue-500">To</span> Alaska
        </Link>

        <div className="flex items-center gap-4">
          {showOwner && (
            <Link
              href="/admin"
              className="text-xs text-white/40 hover:text-white/80"
              aria-label="Owner settings"
              title="Owner settings"
            >
              Owner
            </Link>
          )}

          <CartButton />

          <button
            type="button"
            onClick={() => setIsPickerOpen(true)}
            className="flex flex-col items-end rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-left hover:bg-white/10"
            aria-label="Select cruise ship"
            title="Select cruise ship"
          >
            <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
              Cruise Ship
            </span>
            <span className="text-sm font-semibold text-amber-500">
              {ship ? `${ship} (${date})` : "Select Ship →"}
            </span>
          </button>
        </div>
      </div>

      <ShipPicker isOpen={isPickerOpen} onClose={() => setIsPickerOpen(false)} />
      <CartDrawer />
    </header>
  );
}
