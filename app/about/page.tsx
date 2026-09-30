import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";

export const metadata: Metadata = {
  title: "About Welcome To Alaska Tours",
  description:
    "Learn how Welcome To Alaska Tours helps cruise travelers compare shore excursions in Juneau, Skagway, and Ketchikan using live operator availability and cruise-day timing guidance.",
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  return (
    <main className="mx-auto max-w-4xl px-4 py-12 sm:px-6 sm:py-16">
      <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.05] p-6 sm:p-10">
        <div className="relative mb-8 h-48 w-full overflow-hidden rounded-2xl sm:h-64">
          <Image
            src="/images/home-hero.jpg"
            alt="Alaska coastal waterway and mountain landscape"
            fill
            priority
            sizes="(max-width: 896px) 100vw, 896px"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent" />
          <div className="absolute bottom-4 left-4 right-4 sm:bottom-6 sm:left-6">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-cyan-300">
              Welcome To Alaska Tours
            </p>
            <p className="text-lg font-bold text-white sm:text-2xl drop-shadow">
              Connecting Southeast Alaska Shore Excursions
            </p>
          </div>
        </div>

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

        <div className="mt-8">
          <h2 className="text-sm font-black uppercase tracking-wider text-slate-300 mb-4">Ports We Serve</h2>
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              { name: "Juneau", image: "/hero/juneau.jpg", desc: "Whale watching, Mendenhall Glacier, helicopter landings", slug: "juneau" },
              { name: "Skagway", image: "/hero/skagway.jpg", desc: "White Pass Summit, Yukon frontier, Klondike gold rush", slug: "skagway" },
              { name: "Ketchikan", image: "/images/ketchikan/ketchikan-cruise-port.jpg", desc: "Misty Fjords flightseeing, wildlife charters, totem parks", slug: "ketchikan" },
            ].map((port) => (
              <Link key={port.slug} href={`/ports/${port.slug}`} className="group overflow-hidden rounded-2xl border border-white/10 bg-black/20 hover:border-cyan-400/40 transition">
                <div className="relative h-28 w-full overflow-hidden">
                  <Image src={port.image} alt={port.name} fill sizes="(max-width: 640px) 100vw, 33vw" className="object-cover group-hover:scale-105 transition-transform duration-300" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                  <div className="absolute bottom-2 left-3 right-3 text-white">
                    <span className="font-bold text-sm drop-shadow">{port.name}</span>
                  </div>
                </div>
                <div className="p-3">
                  <p className="text-xs text-slate-400">{port.desc}</p>
                </div>
              </Link>
            ))}
          </div>
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
