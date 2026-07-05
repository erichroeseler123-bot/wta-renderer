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
  { slug: "juneau", title: "Juneau", description: "Mendenhall Glacier flights, helicopter dog sledding, and whale watching." },
  { slug: "skagway", title: "Skagway", description: "White Pass & Yukon Route train rides, scooter tours, and glacier helicopter trips." },
  { slug: "ketchikan", title: "Ketchikan", description: "Rainforest hikes, kayaking wilderness adventures, and Totem Bight state parks." },
  { slug: "sitka", title: "Sitka", description: "Sea otter marine quests, Russian historical landmarks, and coastal hikes." },
  { slug: "icy-strait-point", title: "Icy Strait Point", description: "High-adventure zipriders, Hoonah coastal wilderness, and brown bear searches." },
  { slug: "haines", title: "Haines", description: "Chilkat Bald Eagle rafting, wildlife safaris, and quiet fjord tours." },
  { slug: "seward", title: "Seward", description: "Kenai Fjords glacier boat cruises, Resurrection Bay sealife, and Exit Glacier hiking." },
  { slug: "whittier", title: "Whittier", description: "Prince William Sound 26-glacier catamarans, and tunnel-accessed adventures." }
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#eef7ff_0%,#f8fafc_42%,#ffffff_100%)] text-slate-900">
      {/* Hero Section */}
      <section className="mx-auto max-w-5xl px-4 pt-12 pb-8 sm:px-6 sm:pt-16 sm:pb-12 text-center space-y-6 bg-slate-900 text-white rounded-b-[3rem] shadow-[0_24px_80px_rgba(15,23,42,0.12)]">
        <div className="mx-auto max-w-5xl space-y-3">
          <div className="inline-flex rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-cyan-200">
            Logistical Port-Day Dispatch
          </div>
          <h1 className="text-4xl font-black uppercase leading-[0.9] tracking-[-0.04em] sm:text-6xl md:text-7xl text-white">
            WTA Excursion Dispatcher
          </h1>
          <p className="text-sm leading-6 text-white/80 max-w-2xl mx-auto">
            Secure your **Port-Day Fit**. Real-time availability checked against ship arrival and all-aboard times. We enforce a strict **45-minute return buffer** to guarantee return to gangway.
          </p>
        </div>

        {/* Dynamic Scheduler Form */}
        <div className="pt-4">
          <HomepageForm approvedPorts={APPROVED_PORTS} />
          <div className="pt-3 text-xs text-slate-500 font-bold">
            or <Link href="/tours" className="text-sky-800 hover:text-sky-900 underline">check Juneau Live Tour availability</Link> instantly.
          </div>
        </div>
      </section>

      {/* Trust & Utility points */}
      <section className="mx-auto max-w-5xl px-4 py-6 sm:px-6">
        <div className="grid gap-6 md:grid-cols-3">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-sm font-black text-slate-950 uppercase tracking-wider">Verified Capacity</h3>
            <p className="mt-2 text-xs leading-5 text-slate-600">
              Direct connection to operator inventories via FareHarbor API for live departure timings and seat counts.
            </p>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-sm font-black text-slate-955 uppercase tracking-wider">All-Aboard Sync</h3>
            <p className="mt-2 text-xs leading-5 text-slate-600">
              Excursion start and return times are automatically scored against ship arrival and all-aboard deadlines with safety margins.
            </p>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-sm font-black text-slate-955 uppercase tracking-wider">Protected Checkout</h3>
            <p className="mt-2 text-xs leading-5 text-slate-600">
              Confirm your booking instantly using direct payment intents processed securely via Stripe.
            </p>
          </div>
        </div>
      </section>

      {/* Category Grid */}
      <section className="mx-auto max-w-5xl px-4 py-8 sm:px-6 space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">Browse by Excursion Category</h2>
          <p className="text-sm text-slate-600">Select a category page to learn about port-day transit timing and excursions.</p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <Link
            href="/categories/juneau-helicopter-tours"
            className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition hover:-translate-y-1 block space-y-2"
          >
            <h3 className="text-lg font-black text-slate-950 block">Helicopter Tours</h3>
            <p className="text-xs leading-5 text-slate-600 block">Compare glacier landing helicopter packages, safety buffer requirements, and local icefield flight paths.</p>
            <span className="text-xs font-bold text-sky-800 block hover:text-sky-900">Browse Helicopter Tours →</span>
          </Link>
          <Link
            href="/categories/glacier-tours"
            className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition hover:-translate-y-1 block space-y-2"
          >
            <h3 className="text-lg font-black text-slate-950 block">Glacier Ice Hikes</h3>
            <p className="text-xs leading-5 text-slate-600 block">Plan active ice walking and glacier hikes. Learn about safety outfitting transit durations in Juneau.</p>
            <span className="text-xs font-bold text-sky-800 block hover:text-sky-900">Browse Glacier Hikes →</span>
          </Link>
          <Link
            href="/categories/dog-sledding"
            className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition hover:-translate-y-1 block space-y-2"
          >
            <h3 className="text-lg font-black text-slate-950 block">Glacier Dog Sledding</h3>
            <p className="text-xs leading-5 text-slate-600 block">Ultimate dog mushing summer camps. Fly by helicopter to high-altitude icefields and guide husky teams.</p>
            <span className="text-xs font-bold text-sky-800 block hover:text-sky-900">Browse Dog Sledding →</span>
          </Link>
          <Link
            href="/categories/whale-watching"
            className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition hover:-translate-y-1 block space-y-2"
          >
            <h3 className="text-lg font-black text-slate-950 block">Whale Watching</h3>
            <p className="text-xs leading-5 text-slate-600 block">Witness humpback whale bubble-net feeding departures in Auke Bay. Calculate Auke Bay harbor shuttle times.</p>
            <span className="text-xs font-bold text-sky-800 block hover:text-sky-900">Browse Whale Watching →</span>
          </Link>
          <Link
            href="/categories/mendenhall-glacier"
            className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition hover:-translate-y-1 block space-y-2"
          >
            <h3 className="text-lg font-black text-slate-950 block">Mendenhall Glacier</h3>
            <p className="text-xs leading-5 text-slate-600 block">Juneau's crown jewel. Find visitor center bus guides, photo walks, and helicopter glacier ice walks.</p>
            <span className="text-xs font-bold text-sky-800 block hover:text-sky-900">Browse Mendenhall Tours →</span>
          </Link>
          <Link
            href="/categories/flightseeing"
            className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition hover:-translate-y-1 block space-y-2"
          >
            <h3 className="text-lg font-black text-slate-950 block">Flightseeing</h3>
            <p className="text-xs leading-5 text-slate-600 block">Floatplane excursions and icefield flight paths. Track mountain visibility ceilings and flight buffer rules.</p>
            <span className="text-xs font-bold text-sky-800 block hover:text-sky-900">Browse Flightseeing →</span>
          </Link>
        </div>
      </section>

      {/* Port Chooser Grid */}
      <section className="mx-auto max-w-5xl px-4 py-12 sm:px-6 sm:py-16 space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">Browse by Alaska Port</h2>
          <p className="text-sm text-slate-600">Select a port page to review specific timing constraints and excursions.</p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 md:grid-cols-4">
          {APPROVED_PORTS.map((port) => (
            <Link
              key={port.slug}
              href={`/ports/${port.slug}`}
              className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md transition hover:-translate-y-1 block space-y-3"
            >
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">Port Directory</span>
              <h3 className="text-lg font-black text-slate-950 block">{port.title}</h3>
              <p className="text-xs leading-5 text-slate-600 block">{port.description}</p>
              <span className="text-xs font-bold text-sky-800 block hover:text-sky-900">Explore Port →</span>
            </Link>
          ))}
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
