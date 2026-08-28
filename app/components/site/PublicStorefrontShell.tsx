"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_LINKS = [
  ["Ports", "/ports"],
  ["Tours", "/tours"],
  ["Guides", "/guides"],
  ["About", "/about"],
] as const;

function shouldSkipChrome(pathname: string) {
  return (
    pathname === "/" ||
    pathname.startsWith("/admin") ||
    pathname.startsWith("/widget") ||
    pathname.startsWith("/hud-demo")
  );
}

function routeClass(pathname: string) {
  if (pathname === "/tours") return "wta-route-tours-index";
  if (/^\/tours\/[^/]+\/[^/]+\/calendar/.test(pathname)) return "wta-route-calendar";
  if (/^\/tours\/[^/]+\/[^/]+/.test(pathname)) return "wta-route-tour-detail";
  if (pathname === "/ports") return "wta-route-ports-index";
  if (pathname.startsWith("/ports/")) return "wta-route-port-detail";
  if (pathname.startsWith("/categories/")) return "wta-route-category";
  if (pathname === "/guides") return "wta-route-guides-index";
  if (pathname.startsWith("/guides/")) return "wta-route-guide-detail";
  if (/^\/(juneau|skagway|ketchikan)\//.test(pathname)) return "wta-route-topic";
  if (pathname === "/about") return "wta-route-about";
  if (pathname === "/contact" || pathname === "/contact-us") return "wta-route-contact";
  if (pathname === "/plan") return "wta-route-plan";
  if (pathname === "/date-search") return "wta-route-date-search";
  if (pathname.startsWith("/checkout")) return "wta-route-checkout";
  return "wta-route-standard";
}

export default function PublicStorefrontShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  if (shouldSkipChrome(pathname)) return <>{children}</>;

  return (
    <div className={`wta-storefront ${routeClass(pathname)} min-h-screen bg-[#f4ede4] text-[#2b211b]`}>
      <header className="wta-site-header sticky top-0 z-50 border-b border-white/10 bg-[#1b1714]/95 text-white shadow-[0_10px_35px_rgba(27,23,20,.18)] backdrop-blur-xl">
        <div className="mx-auto flex h-[78px] max-w-7xl items-center justify-between gap-5 px-4 sm:px-6 lg:px-8">
          <Link href="/" className="group inline-flex min-w-0 items-center gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/25 bg-white/8 text-[11px] font-black tracking-[0.16em] transition group-hover:border-[#ff8a3d] group-hover:bg-[#ff8a3d] group-hover:text-[#1b1714]">
              AK
            </span>
            <span className="min-w-0 leading-none">
              <span className="block text-[9px] font-black uppercase tracking-[0.22em] text-white/50">Welcome to</span>
              <span className="mt-1 block truncate text-base font-black tracking-tight sm:text-lg">ALASKA TOURS</span>
            </span>
          </Link>

          <nav className="hidden items-center gap-6 md:flex">
            {NAV_LINKS.map(([label, href]) => {
              const active = pathname === href || pathname.startsWith(`${href}/`);
              return (
                <Link
                  key={href}
                  href={href}
                  className={`text-sm font-bold transition ${active ? "text-[#ffb77f]" : "text-white/68 hover:text-white"}`}
                >
                  {label}
                </Link>
              );
            })}
          </nav>

          <Link
            href="/#find-your-port-day"
            className="inline-flex min-h-11 shrink-0 items-center justify-center rounded-full bg-[#ff8a3d] px-4 text-[10px] font-black uppercase tracking-[0.14em] text-[#1b1714] shadow-[0_10px_30px_rgba(255,138,61,.24)] transition hover:-translate-y-0.5 hover:bg-[#ffb77f] sm:px-5 sm:text-xs"
          >
            Find a tour
          </Link>
        </div>
      </header>

      <div className="wta-storefront-content">{children}</div>

      <footer className="border-t border-[#2b211b]/10 bg-[#1b1714] px-4 py-10 text-white sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-8 md:grid-cols-[1.2fr_.8fr] md:items-end">
          <div>
            <div className="text-[10px] font-black uppercase tracking-[0.22em] text-[#ffb77f]">Welcome to Alaska Tours</div>
            <div className="mt-2 max-w-xl text-2xl font-black tracking-[-0.035em] sm:text-3xl">Juneau · Skagway · Ketchikan</div>
            <p className="mt-3 max-w-xl text-sm leading-6 text-white/55">Compare the kind of Alaska day you want, then use the live operator calendar for current departures, pricing and capacity.</p>
            <a
              href="https://cruisepromenade.com/?utm_source=welcometoalaskatours&utm_medium=referral&utm_campaign=early-access"
              target="_blank"
              rel="noreferrer"
              className="mt-4 inline-flex text-xs font-black text-[#ffb77f] transition hover:text-white"
            >
              Planning the whole cruise? Try the free Cruise Promenade group planner ↗
            </a>
          </div>
          <div className="flex flex-wrap gap-x-5 gap-y-3 text-xs font-bold text-white/65 md:justify-end">
            <Link href="/ports" className="hover:text-white">Ports</Link>
            <Link href="/tours" className="hover:text-white">Tours</Link>
            <Link href="/guides" className="hover:text-white">Guides</Link>
            <Link href="/contact-us" className="hover:text-white">Contact</Link>
            <Link href="/privacy" className="hover:text-white">Privacy</Link>
            <Link href="/terms" className="hover:text-white">Terms</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
