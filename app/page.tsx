import type { Metadata } from "next";
import Link from "next/link";
import HomepageForm from "@/app/components/home/HomepageForm";

export const metadata: Metadata = {
  title: "Alaska Cruise Port Excursions | Welcome To Alaska Tours",
  description:
    "Find Alaska shore excursions for your cruise port day. Start with your port and ship timing, then compare excursions and booking calendars for Juneau, Skagway, and Ketchikan.",
  alternates: { canonical: "https://welcometoalaskatours.com" },
};

const APPROVED_PORTS = [
  { slug: "juneau", title: "Juneau", image: "/hero/juneau.jpg", description: "Glacier flights, dog sledding, whale watching, and Mendenhall experiences." },
  { slug: "skagway", title: "Skagway", image: "/hero/skagway.jpg", description: "White Pass-area sightseeing, helicopter experiences, gold-rush history, and active adventures." },
  { slug: "ketchikan", title: "Ketchikan", image: "/hero/ketchikan.png", description: "Rainforest, wildlife, flightseeing, kayaking, bear viewing, and cultural experiences." }
];

const SHOPPING_PATHS = [
  { title: "Bucket-list Alaska", description: "Glacier flights, dog sledding, and flightseeing for travelers planning a once-in-a-lifetime port day.", href: "/categories/juneau-helicopter-tours", cta: "See bucket-list tours" },
  { title: "Wildlife & whales", description: "Start with wildlife-focused options when seeing Alaska animals matters more than adrenaline.", href: "/categories/whale-watching", cta: "See wildlife options" },
  { title: "Glaciers without guessing", description: "Compare glacier-focused experiences and use your ship timing to narrow what can fit your day.", href: "/categories/mendenhall-glacier", cta: "See glacier options" },
  { title: "See Alaska from the air", description: "Browse helicopter and flightseeing experiences when scenery is the main event.", href: "/categories/flightseeing", cta: "See flightseeing" },
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <section className="relative min-h-[75vh] flex items-center overflow-hidden bg-slate-950 text-white py-16 sm:py-24">
        <div className="absolute inset-0">
          <img
            src="/images/home-hero.jpg"
            alt="Alaska cruise port scenery"
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/75 to-slate-950/20 md:bg-gradient-to-r md:from-slate-950/85 md:via-slate-950/50 md:to-transparent" />
        </div>

        <div className="relative mx-auto w-full max-w-5xl px-6">
          <div className="max-w-2xl rounded-[2.5rem] border border-white/10 bg-slate-950/65 p-6 md:p-8 backdrop-blur-md shadow-2xl space-y-6">
            <div className="inline-flex rounded-full border border-sky-400/30 bg-sky-500/10 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-sky-300">
              Juneau • Skagway • Ketchikan
            </div>
            <h1 className="text-3xl font-black uppercase tracking-tight sm:text-5xl lg:text-6xl leading-[0.95] text-white">
              What can you do while your ship is in port?
            </h1>
            <p className="text-base leading-relaxed text-slate-200 sm:text-lg">
              Start with your Alaska port day and ship timing. Then compare excursions, durations, and booking calendars without piecing the day together across a dozen tabs.
            </p>

            <div className="pt-2 flex flex-col sm:flex-row gap-4 items-stretch sm:items-center">
              <a
                href="#find-your-port-day"
                className="inline-flex min-h-12 items-center justify-center rounded-2xl bg-cyan-400 px-8 py-3 text-sm font-black uppercase tracking-wider text-slate-950 hover:bg-cyan-300 transition shadow-lg text-center"
              >
                Find tours for my port day
              </a>
              <Link
                href="/tours"
                className="inline-flex min-h-12 items-center justify-center rounded-2xl border border-white/20 bg-white/10 px-8 py-3 text-sm font-black uppercase tracking-wider text-white hover:bg-white/25 transition backdrop-blur text-center"
              >
                Browse excursions
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-sky-50 border-y border-sky-100 py-12">
        <div className="mx-auto max-w-5xl px-6">
          <h2 className="text-center text-2xl font-black text-slate-900 tracking-tight">
            Built Around the Cruise Day
          </h2>
          <p className="mt-2 text-center text-sm text-slate-600 max-w-2xl mx-auto">
            Welcome To Alaska Tours helps you compare independent excursions against the time you actually have in port. Always confirm final meeting and all-aboard details before booking.
          </p>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-3xl border border-sky-100 bg-white p-6 shadow-sm">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-sky-100 text-sky-800 text-lg">🛳️</div>
              <h3 className="mt-4 font-black text-slate-900 text-sm">Start With Your Ship</h3>
              <p className="mt-2 text-xs text-slate-500 leading-relaxed">Use your port and schedule as the starting point instead of browsing tours with no timing context.</p>
            </div>
            <div className="rounded-3xl border border-sky-100 bg-white p-6 shadow-sm">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-sky-100 text-sky-800 text-lg">🧭</div>
              <h3 className="mt-4 font-black text-slate-900 text-sm">Compare the Day</h3>
              <p className="mt-2 text-xs text-slate-500 leading-relaxed">Review duration, departure information, operator notes, and posted booking availability together.</p>
            </div>
            <div className="rounded-3xl border border-sky-100 bg-white p-6 shadow-sm">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-sky-100 text-sky-800 text-lg">⏱️</div>
              <h3 className="mt-4 font-black text-slate-900 text-sm">Return-Time Guidance</h3>
              <p className="mt-2 text-xs text-slate-500 leading-relaxed">Use timing guidance to identify tours that appear comfortable, tight, or incompatible with your port window.</p>
            </div>
            <div className="rounded-3xl border border-sky-100 bg-white p-6 shadow-sm">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-sky-100 text-sky-800 text-lg">📅</div>
              <h3 className="mt-4 font-black text-slate-900 text-sm">Open the Live Calendar</h3>
              <p className="mt-2 text-xs text-slate-500 leading-relaxed">When a tour is bookable, continue to its booking calendar to confirm current dates, times, pricing, and capacity.</p>
            </div>
          </div>
        </div>
      </section>

      <section id="find-your-port-day" className="mx-auto max-w-4xl px-6 py-12 scroll-mt-6">
        <div className="rounded-[2.5rem] border border-slate-200 bg-white p-6 sm:p-8 shadow-sm">
          <div className="text-center max-w-2xl mx-auto">
            <div className="text-[10px] font-black uppercase tracking-[0.2em] text-sky-700">Best place to start</div>
            <h2 className="mt-2 text-2xl font-black text-slate-900 tracking-tight">Show Me What Fits My Port Day</h2>
            <p className="mt-2 text-sm text-slate-600">Choose your port and ship details first. The goal is to narrow the shopping problem before you fall in love with a tour that does not fit your schedule.</p>
          </div>
          <div className="mt-6">
            <HomepageForm approvedPorts={APPROVED_PORTS} />
          </div>
        </div>
      </section>

      <section id="ports" className="mx-auto max-w-5xl px-6 py-12 space-y-8 scroll-mt-6">
        <div className="text-center space-y-2 max-w-2xl mx-auto">
          <h2 className="text-3xl font-black tracking-tight text-slate-900">Shop by Alaska Port</h2>
          <p className="text-sm text-slate-600">Start with the stop on your itinerary, then compare the excursions currently connected for Juneau, Skagway, or Ketchikan.</p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {APPROVED_PORTS.map((port) => (
            <Link
              key={port.slug}
              href={`/ports/${port.slug}`}
              className="group overflow-hidden rounded-[2.5rem] border border-slate-200 bg-white shadow-sm hover:shadow-md transition hover:-translate-y-1 block flex flex-col justify-between"
            >
              <div className="aspect-[16/10] w-full overflow-hidden relative">
                <img src={port.image} alt={port.title} className="h-full w-full object-cover group-hover:scale-105 transition duration-500" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/40 to-transparent" />
                <span className="absolute bottom-4 left-4 rounded-xl bg-slate-950/70 px-3 py-1.5 text-xs font-black uppercase text-white tracking-widest backdrop-blur-sm">{port.title}</span>
              </div>
              <div className="p-6 space-y-2 flex-grow flex flex-col justify-between">
                <p className="text-xs text-slate-600 leading-relaxed">{port.description}</p>
                <div className="pt-4 border-t border-slate-100 flex justify-between items-center text-xs font-black uppercase text-sky-800 tracking-wider">
                  <span>Plan This Port Day</span><span>→</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-6 py-12 space-y-8">
        <div className="text-center space-y-2 max-w-2xl mx-auto">
          <h2 className="text-3xl font-black tracking-tight text-slate-900">Not Sure What You Want Yet?</h2>
          <p className="text-sm text-slate-600">Shop by the kind of Alaska day you want, then check whether it fits your ship.</p>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {SHOPPING_PATHS.map((path) => (
            <Link key={path.title} href={path.href} className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition hover:-translate-y-1 block">
              <h3 className="text-lg font-black text-slate-950">{path.title}</h3>
              <p className="mt-2 text-xs leading-relaxed text-slate-600">{path.description}</p>
              <span className="mt-4 text-xs font-bold text-sky-800 block">{path.cta} →</span>
            </Link>
          ))}
        </div>

        <div className="pt-6 max-w-2xl mx-auto">
          <div className="rounded-[2rem] border border-sky-100 bg-sky-50/60 p-6 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
            <div className="text-left space-y-1">
              <span className="inline-block rounded bg-sky-100 px-2 py-0.5 text-[9px] font-black uppercase text-sky-800 tracking-wider">Cruise planners</span>
              <h4 className="text-sm font-black text-slate-950">Already know your ship?</h4>
              <p className="text-xs text-slate-600">Go straight to ship-specific planning and use the port window as your filter.</p>
            </div>
            <Link href="/ships" className="rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-bold text-white hover:bg-slate-800 transition whitespace-nowrap shadow">Browse Ships</Link>
          </div>
        </div>
      </section>
    </main>
  );
}
