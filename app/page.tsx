"use client";

import Link from "next/link";
import Image from "next/image";
import { useMemo } from "react";
import { useCruise } from "@/context/CruiseContext";
import NewsletterSignup from "@/app/components/newsletter/NewsletterSignup";
import TestimonialsSection from "@/app/components/testimonials/TestimonialsSection";
import FAQSection, { type FAQItem } from "@/app/components/faq/FAQSection";

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

const featuredTours = [
  {
    title: "Whale Watching in Juneau",
    blurb: "Cruise-friendly departures with premium wildlife viewing windows.",
    href: "/tours?port=juneau&category=whale-watching",
  },
  {
    title: "Skagway Scenic Adventures",
    blurb: "Top shore options timed for day-port arrivals and returns.",
    href: "/tours?port=skagway",
  },
  {
    title: "Ketchikan Family Excursions",
    blurb: "Easy-to-book tours for mixed groups, first-timers, and families.",
    href: "/tours?port=ketchikan",
  },
];

const guideHighlights = [
  {
    title: "Best Juneau Shore Excursions for 2026",
    href: "/guides/best-juneau-shore-excursions-2026",
  },
  {
    title: "Skagway White Pass Independent Booking Guide",
    href: "/guides/skagway-white-pass-railway-independent-booking",
  },
  {
    title: "How to Save vs Ship Excursions",
    href: "/guides/independent-alaska-shore-excursions-save-vs-ship",
  },
];

const faqItems: FAQItem[] = [
  {
    question: "Do these tours fit cruise ship schedules?",
    answer:
      "Yes. Our cruise planner is designed to surface departures that align with your port timing.",
  },
  {
    question: "When will I see booking confirmation?",
    answer:
      "Right after payment, your confirmation page updates with live booking status and operator confirmation details.",
  },
  {
    question: "Can I get help picking tours?",
    answer:
      "Yes. Contact our team with your ship, date, and group size and we will help narrow down the best options.",
  },
  {
    question: "What if our cruise arrival is delayed?",
    answer:
      "Choose cruise-friendly departures with built-in time margins. Operator policies vary, so check details on each tour and in confirmation messages.",
  },
  {
    question: "Do you include hidden fees at checkout?",
    answer:
      "No. Pricing is confirmed live before payment and shown in checkout with the selected departure and rate.",
  },
];

export default function HomePage() {
  const { line, ship, date, loaded } = useCruise();
  const toursHref = useMemo(() => {
    if (!ship || !date) return "/tours";
    const qs = new URLSearchParams({ cruiseShip: ship, date });
    if (line) qs.set("cruiseLine", line);
    return `/tours?${qs.toString()}`;
  }, [line, ship, date]);

  return (
    <main className="min-h-screen bg-[#F8FAFC] text-slate-900">
      <section className="relative overflow-hidden border-b border-slate-200">
        <Image
          src="/hero/hero5678.jpg"
          fill
          priority
          sizes="100vw"
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
              Excursions That Fit
              <span className="block text-cyan-300">Your Cruise Schedule</span>
            </h1>
            <p className="mt-5 max-w-xl text-base text-slate-200 sm:text-lg">
              Enter your cruise ship and sail date to find Alaska shore tours matched to your timing, then book securely in minutes.
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
            <div className="mt-6 grid max-w-lg grid-cols-3 gap-3 text-center text-xs text-cyan-100">
              <div className="rounded-2xl border border-white/20 bg-white/10 px-3 py-2">
                <div className="text-lg font-black text-white">100%</div>
                Cruise-day focused
              </div>
              <div className="rounded-2xl border border-white/20 bg-white/10 px-3 py-2">
                <div className="text-lg font-black text-white">Live</div>
                Departure matching
              </div>
              <div className="rounded-2xl border border-white/20 bg-white/10 px-3 py-2">
                <div className="text-lg font-black text-white">Secure</div>
                Stripe checkout
              </div>
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
            <h2 className="text-2xl font-black tracking-tight sm:text-3xl">Trusted By Cruise Travelers</h2>
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
              <Image
                src={port.image}
                alt={port.name}
                fill
                sizes="(max-width: 768px) 100vw, 33vw"
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

      <section className="mx-auto max-w-7xl px-6 pb-20">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-black tracking-tight sm:text-3xl">Featured Shore Tours</h2>
            <p className="mt-1 text-sm text-slate-600">
              Fast-start picks for the most common Alaska cruise stops.
            </p>
          </div>
          <Link href="/tours" className="text-xs font-bold uppercase tracking-wide text-sky-700 hover:text-sky-900">
            Browse Everything
          </Link>
        </div>
        <div className="mt-6 grid gap-5 md:grid-cols-3">
          {featuredTours.map((tour) => (
            <Link
              key={tour.title}
              href={tour.href}
              className="rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_12px_30px_-18px_rgba(15,23,42,0.35)] transition hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="text-xs font-bold uppercase tracking-widest text-sky-700">Featured</div>
              <h3 className="mt-2 text-xl font-black tracking-tight text-slate-900">{tour.title}</h3>
              <p className="mt-2 text-sm text-slate-600">{tour.blurb}</p>
              <div className="mt-4 text-sm font-bold text-slate-900">View matching tours →</div>
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 pb-16">
        <div className="rounded-3xl border border-slate-200 bg-slate-50 p-8">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="text-2xl font-black tracking-tight sm:text-3xl">Alaska Cruise Guides</h2>
              <p className="mt-1 text-sm text-slate-600">
                Port-specific planning content targeting the questions cruisers search most.
              </p>
            </div>
            <Link href="/guides" className="text-xs font-bold uppercase tracking-wide text-sky-700 hover:text-sky-900">
              View All Guides
            </Link>
          </div>
          <div className="mt-5 grid gap-3 md:grid-cols-3">
            {guideHighlights.map((guide) => (
              <Link
                key={guide.href}
                href={guide.href}
                className="rounded-2xl border border-slate-200 bg-white p-4 text-sm font-semibold text-slate-800 transition hover:border-sky-200"
              >
                {guide.title} →
              </Link>
            ))}
          </div>
        </div>
      </section>

      <TestimonialsSection includeOrganizationSchema />
      <FAQSection faqs={faqItems} />

      <section className="mx-auto max-w-7xl px-6 pb-20">
        <NewsletterSignup
          source="homepage"
          title="Stay Updated on Alaska Adventures"
          description="Get tour updates, cruise planning tips, wildlife and environmental news, and fun Alaska facts. Unsubscribe anytime."
        />
      </section>
    </main>
  );
}
