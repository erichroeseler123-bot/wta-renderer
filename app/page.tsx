"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useCruise } from "@/context/CruiseContext";

const ports = [
  { name: "Juneau", href: "/tours?port=juneau", image: "/hero/juneau.jpg" },
  { name: "Skagway", href: "/tours?port=skagway", image: "/hero/skagway.jpg" },
  { name: "Ketchikan", href: "/tours?port=ketchikan", image: "/hero/ketchikan.png" },
];

const capabilities = [
  {
    title: "Real-Time Availability",
    detail: "See current departure options and pricing before you commit.",
  },
  {
    title: "Cruise-Day Planning",
    detail: "Add your ship and sail date to surface tours that fit your schedule.",
  },
  {
    title: "Secure Checkout",
    detail: "Fast payment flow with confirmation tracking from checkout to receipt.",
  },
  {
    title: "Local Tour Operators",
    detail: "Book direct with trusted operators across Juneau, Skagway, and Ketchikan.",
  },
];

const pipeline = [
  "Pick your port and tour style",
  "Choose the date and departure time",
  "Checkout in minutes",
  "Get booking confirmation and receipt",
];

export default function HomePage() {
  const { ship, date, loaded } = useCruise();
  const toursHref = useMemo(() => {
    if (!ship || !date) return "/tours";
    const qs = new URLSearchParams({ cruiseShip: ship, date });
    return `/tours?${qs.toString()}`;
  }, [ship, date]);

  return (
    <main className="min-h-screen bg-[#F8FAFC] text-slate-900">
      <section className="relative overflow-hidden border-b border-slate-200">
        <img
          src="/hero/hero5678.jpg"
          className="absolute inset-0 h-full w-full object-cover opacity-20"
          alt="Alaska coast"
        />
        <div className="absolute inset-0 bg-[linear-gradient(125deg,rgba(15,23,42,0.94),rgba(15,23,42,0.72),rgba(14,116,144,0.45))]" />

        <div className="relative mx-auto grid max-w-7xl gap-10 px-6 py-16 md:grid-cols-2 md:py-24">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-3 py-1 text-xs uppercase tracking-[0.2em] text-cyan-100">
              Alaska Shore Excursions
            </div>
            <h1 className="mt-5 text-4xl font-black leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl">
              Plan Shore Days
              <span className="block text-cyan-300">You’ll Actually Enjoy</span>
            </h1>
            <p className="mt-5 max-w-xl text-base text-slate-200 sm:text-lg">
              Find the right Alaska excursion for your ship schedule, book directly with local operators, and head to port with confidence.
            </p>
            {loaded ? (
              <div className="mt-4 flex flex-wrap gap-2">
                {ship && date ? (
                  <>
                    <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold text-cyan-100">
                      {ship}
                    </span>
                    <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold text-cyan-100">
                      {date}
                    </span>
                  </>
                ) : (
                  <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold text-cyan-100">
                    Add your ship + sail date for a personalized tour match
                  </span>
                )}
              </div>
            ) : null}
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href={toursHref}
                className="rounded-2xl bg-cyan-400 px-6 py-3 text-sm font-bold uppercase tracking-wide text-slate-900 transition hover:bg-cyan-300"
              >
                {ship && date ? "See My Best Matches" : "Find My Tours"}
              </Link>
              <Link
                href="/ports/juneau"
                className="rounded-2xl border border-white/25 bg-white/10 px-6 py-3 text-sm font-bold uppercase tracking-wide text-white transition hover:bg-white/20"
              >
                Explore Juneau Tours
              </Link>
            </div>
          </div>

          <div className="rounded-3xl border border-white/15 bg-white/10 p-5 backdrop-blur-md">
            <div className="text-sm font-bold uppercase tracking-[0.2em] text-cyan-100">
              How Booking Works
            </div>
            <ol className="mt-4 space-y-3">
              {pipeline.map((step, idx) => (
                <li key={step} className="flex items-start gap-3 rounded-2xl bg-black/20 p-3 text-white">
                  <span className="mt-0.5 flex h-6 w-6 items-center justify-center rounded-full bg-cyan-400 text-xs font-black text-slate-900">
                    {idx + 1}
                  </span>
                  <span className="text-sm font-semibold">{step}</span>
                </li>
              ))}
            </ol>
            <div className="mt-4 rounded-2xl border border-cyan-200/25 bg-cyan-500/10 p-3 text-xs text-cyan-100">
              Built to keep your booking simple, clear, and reliable.
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-14">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-black tracking-tight sm:text-3xl">Why Travelers Book Here</h2>
            <p className="mt-1 text-sm text-slate-600">
              Practical features designed for stress-free cruise days.
            </p>
          </div>
          <Link href="/tours" className="text-xs font-bold uppercase tracking-wide text-sky-700 hover:text-sky-900">
            Browse Tours
          </Link>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {capabilities.map((item) => (
            <div
              key={item.title}
              className="rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_12px_30px_-18px_rgba(15,23,42,0.35)]"
            >
              <div className="text-lg font-black tracking-tight text-slate-900">{item.title}</div>
              <p className="mt-2 text-sm text-slate-600">{item.detail}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 pb-16">
        <div className="flex items-end justify-between gap-4">
          <h2 className="text-2xl font-black tracking-tight sm:text-3xl">Choose Your Port</h2>
          <Link href="/tours" className="text-xs font-bold uppercase tracking-wide text-sky-700 hover:text-sky-900">
            View All Tours
          </Link>
        </div>
        <div className="mt-6 grid gap-5 md:grid-cols-3">
          {ports.map((port) => (
            <Link
              key={port.name}
              href={port.href}
              className="group relative block aspect-[4/5] overflow-hidden rounded-3xl border border-slate-200 bg-white"
            >
              <img
                src={port.image}
                alt={port.name}
                className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/85 via-slate-900/25 to-transparent" />
              <div className="absolute bottom-6 left-6 right-6">
                <h3 className="text-3xl font-black uppercase tracking-tight text-white">{port.name}</h3>
                <p className="mt-1 text-xs font-bold uppercase tracking-widest text-cyan-300">
                  View Top Excursions
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
