import type { Metadata } from "next";
import Link from "next/link";
import PortGrid from "@/app/components/storefront/PortGrid";
import TourTypeGrid from "@/app/components/storefront/TourTypeGrid";

export const metadata: Metadata = {
  title: "Alaska Tours by Port, Timing & Traveler Fit | Welcome To Alaska Tours",
  description:
    "Find the right Alaska tour for your cruise port, schedule, and group. Browse whale watching, glacier, helicopter, wildlife, and train tours with cruise-safe timing notes.",
  alternates: { canonical: "https://welcometoalaskatours.com" },
  openGraph: {
    title: "Welcome To Alaska Tours",
    description:
      "Alaska tours sorted by port, timing, and traveler fit. Browse by cruise port and compare tour types.",
    url: "https://welcometoalaskatours.com",
    siteName: "Welcome To Alaska Tours",
    type: "website",
  },
};

export default function HomePage() {
  return (
    <main className="min-h-screen bg-stone-50 text-slate-950">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div
          className="absolute inset-0 bg-[linear-gradient(135deg,#082f49_0%,#0f172a_46%,#134e4a_100%)]"
          aria-hidden="true"
        />
        <img
          src="/images/home-hero.jpg"
          alt=""
          aria-hidden="true"
          className="absolute inset-0 h-full w-full object-cover opacity-25"
        />
        <div className="relative mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
          <div className="max-w-3xl">
            <div className="inline-flex rounded-full border border-white/15 bg-white/10 px-4 py-2 text-[11px] font-black uppercase tracking-[0.22em] text-cyan-100">
              Welcome To Alaska Tours
            </div>
            <h1 className="mt-5 text-4xl font-black leading-[1.05] tracking-tight text-white sm:text-6xl text-balance">
              Alaska tours sorted by port, timing, and traveler fit.
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-white/80 sm:text-lg">
              Find the right tour for where your ship docks, how long you have ashore, and who you
              are traveling with. Browse Juneau, Skagway, Ketchikan, Sitka, Icy Strait Point,
              Haines, Seward, Whittier, and Anchorage-area tours.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/plan?intent=best-for&topic=shore-excursions"
                className="inline-flex items-center justify-center rounded-2xl bg-[#4CC9F0] px-6 py-3 text-sm font-black uppercase tracking-[0.1em] text-slate-950 transition hover:opacity-90"
              >
                Find My Alaska Tour
              </Link>
              <Link
                href="/ports"
                className="inline-flex items-center justify-center rounded-2xl border border-white/25 bg-white/10 px-6 py-3 text-sm font-black uppercase tracking-[0.1em] text-white transition hover:bg-white/20"
              >
                Browse by Cruise Port
              </Link>
            </div>
          </div>
        </div>
      </section>

      <PortGrid />
      <TourTypeGrid />

      {/* Cruise-safe timing */}
      <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
        <div className="grid gap-6 rounded-[2rem] border border-sky-100 bg-white p-6 shadow-[0_18px_60px_rgba(15,23,42,0.08)] sm:p-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div>
            <div className="text-[11px] font-black uppercase tracking-[0.18em] text-sky-700">
              Check timing before you book
            </div>
            <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl text-balance">
              On a cruise day, the return time is the real constraint.
            </h2>
            <p className="mt-3 text-sm leading-7 text-slate-600 sm:text-base">
              Plenty of tours look like they fit until you add travel time and your all-aboard. We
              flag timing notes so you can match a tour to your port window instead of guessing.
              Availability, pricing, and final booking are handled by the tour operator&apos;s
              checkout.
            </p>
            <div className="mt-6">
              <Link
                href="/plan?intent=best-for&topic=shore-excursions&window=short-window"
                className="inline-flex items-center justify-center rounded-2xl bg-slate-900 px-6 py-3 text-sm font-black uppercase tracking-[0.1em] text-white transition hover:bg-slate-800"
              >
                Start Planning
              </Link>
            </div>
          </div>
          <div className="rounded-2xl border border-sky-100 bg-sky-50 px-5 py-5">
            <div className="text-[11px] font-black uppercase tracking-[0.16em] text-sky-700">
              Plan in this order
            </div>
            <div className="mt-4 grid gap-3">
              {[
                "1. When you need to be back on the ship",
                "2. How long the experience actually takes",
                "3. Then which tour fits your day",
              ].map((item) => (
                <div
                  key={item}
                  className="rounded-xl border border-white bg-white px-4 py-3 text-sm font-semibold text-slate-900 shadow-[0_8px_24px_rgba(15,23,42,0.04)]"
                >
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="bg-white">
        <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20">
          <div className="overflow-hidden rounded-[2rem] bg-[linear-gradient(135deg,#082f49_0%,#0f172a_46%,#164e63_100%)] p-8 text-center text-white sm:p-12">
            <h2 className="mx-auto max-w-2xl text-3xl font-black tracking-tight sm:text-4xl text-balance">
              Tell us your port and schedule. We&apos;ll narrow it down.
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-white/80 sm:text-base">
              Answer a few quick questions about your day and group, and we&apos;ll point you to the
              best-fit Alaska tours before you head to operator checkout.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link
                href="/plan?intent=best-for&topic=shore-excursions"
                className="inline-flex items-center justify-center rounded-2xl bg-[#4CC9F0] px-6 py-3 text-sm font-black uppercase tracking-[0.1em] text-slate-950 transition hover:opacity-90"
              >
                Find My Alaska Tour
              </Link>
              <Link
                href="/tours"
                className="inline-flex items-center justify-center rounded-2xl border border-white/25 bg-white/10 px-6 py-3 text-sm font-black uppercase tracking-[0.1em] text-white transition hover:bg-white/20"
              >
                Browse Available Tours
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
