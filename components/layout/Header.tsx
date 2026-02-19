"use client";
import { useState } from 'react';
import Link from 'next/link';
import { useCruise } from '@/context/CruiseContext';
import ShipPicker from './ShipPicker';
import CartDrawer from "../../app/components/cart/CartDrawer";
import CartDrawer from "@/app/components/cart/CartDrawer";
import CartButton from "@/app/components/cart/CartButton";

export default function Header() {
  const { ship, date } = useCruise();
  const [isPickerOpen, setIsPickerOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-[#0F172A] border-b border-white/10 px-6 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between text-white">
        <Link href="/" className="text-xl font-black tracking-tighter uppercase">
          Welcome <span className="text-blue-500">To</span> Alaska
        </Link>
        <div className="flex items-center gap-6">
          
            <CartButton />
<button onClick={() => setIsPickerOpen(true)} className="flex flex-col items-end group">
            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-widest group-hover:text-blue-400 transition-colors">Your Ship</span>
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
