"use client";

import Link from "next/link";
import CartDrawer from "@/app/components/cart/CartDrawer";
import CartButton from "@/app/components/cart/CartButton";

export default function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[#0F172A] px-6 py-4">
      <div className="mx-auto flex max-w-7xl items-center justify-between">
        <Link
          href="/"
          className="text-xl font-black tracking-tighter text-white/90 hover:text-white"
        >
          Welcome To Alaska <span className="text-blue-500">Tours</span>
        </Link>

        <div className="flex items-center gap-4">
          <Link
            href="/checkout"
            className="rounded-xl border border-white/20 bg-white/10 px-3 py-2 text-sm font-semibold text-white transition hover:bg-white/20"
          >
            Checkout
          </Link>
          <CartButton />
        </div>
      </div>

      <CartDrawer />
    </header>
  );
}
