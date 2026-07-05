"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import CartButton from "./CartButton";

export default function StickyCartBar() {
  const pathname = usePathname();

  // Hide the sticky checkout bar on checkout and checkout success routes
  if (pathname === "/checkout" || pathname === "/checkout/success") {
    return null;
  }

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-stone-200 bg-white/95 px-4 py-3 backdrop-blur sm:inset-auto sm:bottom-4 sm:right-4 sm:left-auto sm:w-auto sm:rounded-2xl sm:border sm:shadow-xl">
      <div className="mx-auto flex max-w-3xl items-center gap-3 sm:max-w-none">
        <Link
          href="/checkout"
          className="inline-flex flex-1 items-center justify-center rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white sm:flex-none"
        >
          Checkout
        </Link>
        <CartButton />
      </div>
    </div>
  );
}
