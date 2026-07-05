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
      <section className="relative overflow-hidden bg-slate-950 py-20 text-white sm:py-28">
        <div className="absolute inset-0">
          <img
            src="/images/home-hero.jpg"
            alt="Alaska landscape"
            className="h-full w-full object-cover opacity-25"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-slate-950/80 via-slate-950/90 to-slate-950" />
        </div>
        
        <div className="relative mx-auto max-w-5xl px-6 text-center space-y-6">
          <div className="inline-flex rounded-full border border-sky-400/30 bg-sky-500/10 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-sky-300">
            Logistical Port-Day Fit
          </div>
          <h1 className="text-4xl font-black uppercase tracking-tight sm:text-6xl md:text-7xl leading-[0.9] text-white">
            Alaska excursions that fit your port day.
          </h1>
          <p className="mx-auto max-w-2xl text-base leading-relaxed text-slate-300 sm:text-lg">
            Real-time port safety checks, direct schedule synchronization, and strict return buffers so you never miss your ship.
          </p>

          <div className="pt-6 flex flex-col sm:flex-row gap-4 justify-center items-center">
            <a
              href="#ports"
              className="w-full sm:w-auto inline-flex min-h-12 items-center justify-center rounded-2xl bg-cyan-400 px-8 py-3 text-sm font-black uppercase tracking-wider text-slate-950 hover:bg-cyan-300 transition shadow-lg"
            >
              Start with your port
            </a>
            <Link
              href="/tours"
              className="w-full sm:w-auto inline-flex min-h-12 items-center justify-center rounded-2xl border border-white/20 bg-white/10 px-8 py-3 text-sm font-black uppercase tracking-wider text-white hover:bg-white/25 transition backdrop-blur"
            >
              Browse live tours
            </Link>
          </div>
        </div>
      </section>

      {/* How It Works Strip */}
      <section className="bg-slate-900 border-y border-slate-800 py-8 text-white">
        <div className="mx-auto max-w-5xl px-6">
          <div className="grid gap-8 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-slate-800 text-center md:text-left">
            <div className="pt-6 md:pt-0 md:pl-6 first:pl-0 flex items-start gap-4 flex-col md:flex-row">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-cyan-500/20 text-cyan-300 font-black text-sm">1</span>
              <div>
                <h3 className="font-bold text-slate-100">Choose Port</h3>
                <p className="mt-1 text-xs text-slate-400">Select Juneau, Skagway, or Ketchikan to see compatible excursions.</p>
              </div>
            </div>
            <div className="pt-6 md:pt-0 md:pl-6 flex items-start gap-4 flex-col md:flex-row">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-cyan-500/20 text-cyan-300 font-black text-sm">2</span>
              <div>
                <h3 className="font-bold text-slate-100">Check Timing</h3>
                <p className="mt-1 text-xs text-slate-400">Excursions are automatically cross-referenced with your ship's port times.</p>
              </div>
            </div>
            <div className="pt-6 md:pt-0 md:pl-6 flex items-start gap-4 flex-col md:flex-row">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-cyan-500/20 text-cyan-300 font-black text-sm">3</span>
              <div>
                <h3 className="font-bold text-slate-100">Book Live Availability</h3>
                <p className="mt-1 text-xs text-slate-400">Secure your seats directly with direct operator inventory integration.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Dynamic Scheduler Form */}
      <section className="mx-auto max-w-4xl px-6 py-12">
        <div className="rounded-[2.5rem] border border-slate-200 bg-white p-6 sm:p-8 shadow-sm">
          <h2 className="text-xl font-black text-center text-slate-900 tracking-tight">Search Port Departures</h2>
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

      {/* Trust & Utility points */}
      <section className="bg-slate-900/5 py-12 border-t border-slate-200">
        <div className="mx-auto max-w-5xl px-6">
          <div className="grid gap-8 md:grid-cols-3">
            <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="text-sm font-black text-slate-950 uppercase tracking-wider">Verified Capacity</h3>
              <p className="mt-2 text-xs leading-relaxed text-slate-600">
                Direct connection to operator inventories via FareHarbor API for live departure timings and seat counts.
              </p>
            </div>
            <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="text-sm font-black text-slate-955 uppercase tracking-wider">All-Aboard Sync</h3>
              <p className="mt-2 text-xs leading-relaxed text-slate-600">
                Excursion start and return times are automatically scored against ship arrival and all-aboard deadlines with safety margins.
              </p>
            </div>
            <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="text-sm font-black text-slate-955 uppercase tracking-wider">Protected Checkout</h3>
              <p className="mt-2 text-xs leading-relaxed text-slate-600">
                Confirm your booking instantly using direct payment intents processed securely via Stripe.
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
