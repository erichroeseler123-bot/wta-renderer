import type { Metadata } from "next";
import Link from "next/link";
import HomepageForm from "@/app/components/home/HomepageForm";

export const metadata: Metadata = {
  title: "Alaska Cruise Port Excursions | Welcome To Alaska Tours",
  description:
    "Match Alaska shore excursions to your cruise port day. Choose your port, check live availability, and compare excursions against your ship timing with Return Buffer safety guidelines.",
  alternates: { canonical: "https://welcometoalaskatours.com" },
};

const APPROVED_PORTS = [
  { slug: "juneau", title: "Juneau", image: "/hero/juneau.jpg", description: "Mendenhall Glacier flights, helicopter dog sledding, and whale watching." },
  { slug: "skagway", title: "Skagway", image: "/hero/skagway.jpg", description: "White Pass & Yukon Route train rides, scooter tours, and glacier helicopter trips." },
  { slug: "ketchikan", title: "Ketchikan", image: "/hero/ketchikan.png", description: "Rainforest hikes, kayaking wilderness adventures, and Totem Bight state parks." }
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      {/* Hero Section */}
      <section className="relative min-h-[75vh] flex items-center overflow-hidden bg-slate-950 text-white py-16 sm:py-24">
        <div className="absolute inset-0">
          <img
            src="/images/home-hero.jpg"
            alt="Alaska Cruise Port Excursions"
            className="h-full w-full object-cover"
          />
          {/* Transparent gradient to fade out on the right on desktop, and fade out at the top on mobile */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/75 to-slate-950/20 md:bg-gradient-to-r md:from-slate-950/85 md:via-slate-950/50 md:to-transparent" />
        </div>
        
        <div className="relative mx-auto w-full max-w-5xl px-6">
          <div className="max-w-2xl rounded-[2.5rem] border border-white/10 bg-slate-950/65 p-6 md:p-8 backdrop-blur-md shadow-2xl space-y-6">
            <div className="inline-flex rounded-full border border-sky-400/30 bg-sky-500/10 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-sky-300">
              Juneau • Skagway • Ketchikan
            </div>
            <h1 className="text-3xl font-black uppercase tracking-tight sm:text-5xl lg:text-6xl leading-[0.95] text-white">
              Find Alaska excursions that fit your ship schedule.
            </h1>
            <p className="text-base leading-relaxed text-slate-200 sm:text-lg">
              Choose your port, compare live excursions, and keep enough time to get back to your ship.
            </p>

            <div className="pt-2 flex flex-col sm:flex-row gap-4 items-stretch sm:items-center">
              <a
                href="#ports"
                className="inline-flex min-h-12 items-center justify-center rounded-2xl bg-cyan-400 px-8 py-3 text-sm font-black uppercase tracking-wider text-slate-950 hover:bg-cyan-300 transition shadow-lg text-center"
              >
                Start with your port
              </a>
              <Link
                href="/tours"
                className="inline-flex min-h-12 items-center justify-center rounded-2xl border border-white/20 bg-white/10 px-8 py-3 text-sm font-black uppercase tracking-wider text-white hover:bg-white/25 transition backdrop-blur text-center"
              >
                Browse live tours
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Cards Section */}
      <section className="bg-sky-50 border-y border-sky-100 py-12">
        <div className="mx-auto max-w-5xl px-6">
          <h2 className="text-center text-2xl font-black text-slate-900 tracking-tight">
            Why Cruisers Book with WTA
          </h2>
          <p className="mt-2 text-center text-xs text-slate-600">
            The premier timing safety engine for independent Alaska excursions.
          </p>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-3xl border border-sky-100 bg-white p-6 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-sky-100 text-sky-800 text-lg">⚡</div>
                <h3 className="mt-4 font-black text-slate-900 text-sm">Live Availability</h3>
                <p className="mt-2 text-xs text-slate-500 leading-relaxed">
                  Direct connection to real-time local operator calendars.
                </p>
              </div>
            </div>

            <div className="rounded-3xl border border-sky-100 bg-white p-6 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-sky-100 text-sky-800 text-lg">🏔️</div>
                <h3 className="mt-4 font-black text-slate-900 text-sm">Real Operators</h3>
                <p className="mt-2 text-xs text-slate-500 leading-relaxed">
                  Run by fully licensed and top-rated local Alaskan outfits.
                </p>
              </div>
            </div>

            <div className="rounded-3xl border border-sky-100 bg-white p-6 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-sky-100 text-sky-800 text-lg">🛡️</div>
                <h3 className="mt-4 font-black text-slate-900 text-sm">Cruise Return Buffer</h3>
                <p className="mt-2 text-xs text-slate-500 leading-relaxed">
                  Strict 45-minute return safety margins applied automatically.
                </p>
              </div>
            </div>

            <div className="rounded-3xl border border-sky-100 bg-white p-6 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-sky-100 text-sky-800 text-lg">💳</div>
                <h3 className="mt-4 font-black text-slate-900 text-sm">Secure Checkout</h3>
                <p className="mt-2 text-xs text-slate-500 leading-relaxed">
                  Protected payments processed securely via Stripe.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Dynamic Scheduler Form */}
      <section className="mx-auto max-w-4xl px-6 py-12">
        <div className="rounded-[2.5rem] border border-slate-200 bg-white p-6 sm:p-8 shadow-sm">
          <h2 className="text-xl font-black text-center text-slate-900 tracking-tight">Find Excursions for Your Port Day</h2>
          <div className="mt-6">
            <HomepageForm approvedPorts={APPROVED_PORTS} />
          </div>
        </div>
      </section>

      {/* Port Chooser Grid (Featured Cards) */}
      <section id="ports" className="mx-auto max-w-5xl px-6 py-12 space-y-8 scroll-mt-6">
        <div className="text-center space-y-2 max-w-2xl mx-auto">
          <h2 className="text-3xl font-black tracking-tight text-slate-900">Featured Alaska Ports</h2>
          <p className="text-sm text-slate-600">We focus on three primary ports to maintain verified schedules and timing rules.</p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {APPROVED_PORTS.map((port) => (
            <Link
              key={port.slug}
              href={`/ports/${port.slug}`}
              className="group overflow-hidden rounded-[2.5rem] border border-slate-200 bg-white shadow-sm hover:shadow-md transition hover:-translate-y-1 block flex flex-col justify-between"
            >
              <div className="aspect-[16/10] w-full overflow-hidden relative">
                <img
                  src={port.image}
                  alt={port.title}
                  className="h-full w-full object-cover group-hover:scale-105 transition duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/40 to-transparent" />
                <span className="absolute bottom-4 left-4 rounded-xl bg-slate-950/70 px-3 py-1.5 text-xs font-black uppercase text-white tracking-widest backdrop-blur-sm">
                  {port.title}
                </span>
              </div>
              <div className="p-6 space-y-2 flex-grow flex flex-col justify-between">
                <div>
                  <p className="text-xs text-slate-600 leading-relaxed">{port.description}</p>
                </div>
                <div className="pt-4 border-t border-slate-100 flex justify-between items-center text-xs font-black uppercase text-sky-850 tracking-wider">
                  <span>Explore Port Excursions</span>
                  <span>→</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Category Grid (Featured Categories) */}
      <section className="mx-auto max-w-5xl px-6 py-12 space-y-8">
        <div className="text-center space-y-2 max-w-2xl mx-auto">
          <h2 className="text-3xl font-black tracking-tight text-slate-900">Excursion Categories</h2>
          <p className="text-sm text-slate-600">Compare specialized activities and verify transit buffers.</p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <Link
            href="/categories/juneau-helicopter-tours"
            className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition hover:-translate-y-1 block space-y-3"
          >
            <h3 className="text-lg font-black text-slate-950">Helicopter Tours</h3>
            <p className="text-xs leading-relaxed text-slate-600">Compare glacier landing helicopter packages, safety buffer requirements, and local icefield flight paths.</p>
            <span className="text-xs font-bold text-sky-800 block">Browse Helicopter Tours →</span>
          </Link>
          <Link
            href="/categories/glacier-tours"
            className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition hover:-translate-y-1 block space-y-3"
          >
            <h3 className="text-lg font-black text-slate-955">Glacier Ice Hikes</h3>
            <p className="text-xs leading-relaxed text-slate-600">Plan active ice walking and glacier hikes. Learn about safety outfitting transit durations in Juneau.</p>
            <span className="text-xs font-bold text-sky-800 block">Browse Glacier Hikes →</span>
          </Link>
          <Link
            href="/categories/dog-sledding"
            className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition hover:-translate-y-1 block space-y-3"
          >
            <h3 className="text-lg font-black text-slate-955">Glacier Dog Sledding</h3>
            <p className="text-xs leading-relaxed text-slate-600">Ultimate dog mushing summer camps. Fly by helicopter to high-altitude icefields and guide husky teams.</p>
            <span className="text-xs font-bold text-sky-800 block">Browse Dog Sledding →</span>
          </Link>
        </div>

        <div className="pt-6 max-w-xl mx-auto">
          <div className="rounded-[2rem] border border-sky-100 bg-sky-50/40 p-6 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
            <div className="text-left space-y-1">
              <span className="inline-block rounded bg-sky-100 px-2 py-0.5 text-[9px] font-black uppercase text-sky-850 tracking-wider">Cruise Planners</span>
              <h4 className="text-sm font-black text-slate-950">Plan for your specific ship?</h4>
              <p className="text-xs text-slate-600">Retrieve disembarkation buffer strategies for Edge, Bliss, and more.</p>
            </div>
            <Link
              href="/ships"
              className="rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-bold text-white hover:bg-slate-800 transition whitespace-nowrap shadow"
            >
              Browse Ships
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
