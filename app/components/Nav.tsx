// app/components/Nav.tsx
import Link from "next/link";
import CartButton from "./cart/CartButton";

function NavLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="rounded-xl px-3 py-2 text-sm text-white/80 hover:text-white hover:bg-white/5 transition focus:outline-none focus:ring-2 focus:ring-white/20"
    >
      {children}
    </Link>
  );
}

export default function Nav() {
  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-black/55 backdrop-blur shadow-[0_1px_0_0_rgba(255,255,255,0.06)]">
      <div className="page-container">
        <div className="flex h-16 items-center justify-between gap-4">
          {/* Brand */}
          <Link
            href="/"
            className="group flex items-center gap-3 rounded-2xl px-2 py-1 hover:bg-white/5 transition focus:outline-none focus:ring-2 focus:ring-white/20"
          >
            <div className="relative h-9 w-9 overflow-hidden rounded-2xl bg-white/10 ring-1 ring-white/10">
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-white/5" />
            </div>

            <div className="leading-tight">
              <div className="text-white font-semibold tracking-tight">
                Welcome to Alaska
              </div>
              <div className="text-[11px] text-white/50 -mt-0.5">
                Build a multi-stop itinerary
              </div>
            </div>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            <NavLink href="/tours">Tours</NavLink>
            <NavLink href="/ports">Ports</NavLink>
            <NavLink href="/about">About</NavLink>

            <Link
              href="/checkout"
              className="ml-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/80 hover:bg-white/10 hover:text-white transition focus:outline-none focus:ring-2 focus:ring-white/20"
              title="Go to itinerary checkout"
            >
              Build itinerary →
            </Link>

            <div className="ml-2">
              <CartButton />
            </div>
          </nav>

          {/* Mobile */}
          <div className="md:hidden flex items-center gap-2">
            <Link
              href="/tours"
              className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/80 hover:bg-white/10 transition focus:outline-none focus:ring-2 focus:ring-white/20"
            >
              Tours
            </Link>
            <CartButton />
          </div>
        </div>

        {/* Mobile quick links */}
        <div className="md:hidden -mt-1 pb-3 flex items-center gap-2">
          <Link
            href="/ports"
            className="rounded-xl px-3 py-2 text-sm text-white/70 hover:text-white hover:bg-white/5 transition"
          >
            Ports
          </Link>
          <Link
            href="/about"
            className="rounded-xl px-3 py-2 text-sm text-white/70 hover:text-white hover:bg-white/5 transition"
          >
            About
          </Link>
          <Link
            href="/checkout"
            className="ml-auto rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/80 hover:bg-white/10 transition"
          >
            Build →
          </Link>
        </div>
      </div>
    </header>
  );
}
