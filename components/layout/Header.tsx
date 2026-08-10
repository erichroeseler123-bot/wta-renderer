"use client";

import Link from "next/link";
import CartDrawer from "@/app/components/cart/CartDrawer";
import CartButton from "@/app/components/cart/CartButton";

export default function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[#0F172A] px-4 py-3 sm:px-6 sm:py-4">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3">
        <Link
          href="/"
          className="text-base font-black tracking-tighter text-white/90 hover:text-white sm:text-xl"
        >
          Welcome To Alaska <span className="text-blue-500">Tours</span>
        </Link>

        <div className="flex items-center gap-2 sm:gap-4">
          <a
            href="tel:+19077238908"
            aria-label="Call Welcome To Alaska Tours at 907-723-8908"
            className="rounded-xl border border-cyan-300/30 bg-cyan-300/10 px-3 py-2 text-xs font-black text-cyan-200 transition hover:bg-cyan-300/20 sm:text-sm"
          >
            <span className="sm:hidden">Call</span>
            <span className="hidden sm:inline">907-723-8908</span>
          </a>
          <Link
            href="/checkout"
            className="hidden rounded-xl border border-white/20 bg-white/10 px-3 py-2 text-sm font-semibold text-white transition hover:bg-white/20 md:inline-flex"
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
