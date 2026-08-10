import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About Welcome To Alaska Tours",
  description:
    "Learn how Welcome To Alaska Tours helps cruise travelers compare shore excursions in Juneau, Skagway, and Ketchikan using live operator availability and cruise-day timing guidance.",
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  return (
    <main className="mx-auto max-w-4xl px-4 py-12 sm:px-6 sm:py-16">
      <div className="rounded-3xl border border-white/10 bg-white/[0.05] p-6 sm:p-10">
        <p className="text-xs font-black uppercase tracking-[0.18em] text-cyan-300">
          About Welcome To Alaska Tours
        </p>
        <h1 className="mt-3 text-3xl font-black tracking-tight text-white sm:text-5xl">
          Alaska shore excursions built around your port day.
        </h1>
        <p className="mt-5 text-base leading-7 text-slate-300">
          Welcome To Alaska Tours helps cruise travelers compare excursions in Juneau, Skagway, and Ketchikan, then check current dates, departure times, pricing, and capacity before booking.
        </p>
        <p className="mt-4 text-base leading-7 text-slate-300">
          Our goal is simple: make independent Alaska excursion planning easier to understand. We organize tours by port and experience type, connect travelers to live operator availability, and surface the timing details that matter when a ship has a fixed all-aboard time.
        </p>

        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          {[
            ["Live availability", "Connected operator calendars help you see currently posted dates and departures."],
            ["Cruise-day focus", "Port timing, duration, and return-window guidance stay central to the shopping experience."],
            ["Three core ports", "The current catalog focuses on Juneau, Skagway, and Ketchikan."],
          ].map(([title, body]) => (
            <div key={title} className="rounded-2xl border border-white/10 bg-black/10 p-4">
              <h2 className="font-black text-white">{title}</h2>
              <p className="mt-2 text-sm leading-6 text-slate-400">{body}</p>
            </div>
          ))}
        </div>

        <div className="mt-8 rounded-2xl border border-cyan-300/20 bg-cyan-300/10 p-5">
          <h2 className="text-lg font-black text-white">Need help choosing?</h2>
          <p className="mt-2 text-sm leading-6 text-slate-300">
            Call us at <a className="font-black text-cyan-200 hover:text-cyan-100" href="tel:+19077238908">907-723-8908</a> or browse the full Alaska excursion catalog.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link href="/tours" className="rounded-xl bg-white px-4 py-2 text-sm font-black text-slate-950 hover:bg-slate-100">Browse tours</Link>
            <Link href="/ports" className="rounded-xl border border-white/20 px-4 py-2 text-sm font-black text-white hover:bg-white/10">Choose a port</Link>
          </div>
        </div>
      </div>
    </main>
  );
}
