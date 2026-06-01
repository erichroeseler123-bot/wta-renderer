import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Alaska Tours by Cruise Port | Welcome To Alaska Tours",
  description:
    "Pick your Alaska cruise port to see tours matched to your day ashore. Juneau, Skagway, Ketchikan, Sitka, Icy Strait Point, Haines, Seward, Whittier, and Anchorage.",
  alternates: { canonical: "https://welcometoalaskatours.com/ports" },
};

const PORTS = [
  { slug: "juneau", title: "Juneau", copy: "Helicopter, glacier, and whale tours with the most live availability." },
  { slug: "skagway", title: "Skagway", copy: "White Pass rail, glacier, and scenic drives close to the dock." },
  { slug: "ketchikan", title: "Ketchikan", copy: "Wildlife, totems, and rainforest tours a short walk from the pier." },
  { slug: "sitka", title: "Sitka", copy: "Sea otters, wildlife, and coastal history on a quieter port day." },
  { slug: "icy-strait-point", title: "Icy Strait Point", copy: "Whale watching and wilderness from Hoonah's cruise dock." },
  { slug: "haines", title: "Haines", copy: "Bald eagles, river floats, and fewer crowds up Lynn Canal." },
  { slug: "seward", title: "Seward", copy: "Kenai Fjords cruises and glacier access for pre or post-cruise days." },
  { slug: "whittier", title: "Whittier", copy: "Prince William Sound glaciers and a quick gateway to Anchorage." },
  { slug: "anchorage", title: "Anchorage Area", copy: "Day trips, train rides, and wildlife along the road system." },
] as const;

export default function PortsPage() {
  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#eef7ff_0%,#f8fafc_42%,#ffffff_100%)] text-slate-950">
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-10">
        <section className="overflow-hidden rounded-[2rem] border border-sky-100 bg-[linear-gradient(135deg,#082f49_0%,#0f172a_42%,#134e4a_100%)] p-6 text-white shadow-[0_24px_80px_rgba(15,23,42,0.14)] sm:p-8">
          <div className="max-w-3xl">
            <div className="inline-flex rounded-full border border-white/15 bg-white/10 px-4 py-2 text-[11px] font-black uppercase tracking-[0.22em] text-cyan-100">Cruise Ports</div>
            <h1 className="mt-4 text-4xl font-black tracking-tight sm:text-5xl text-balance">Alaska tours by cruise port.</h1>
            <p className="mt-4 text-sm leading-7 text-white/82 sm:text-[15px]">Each port has different tours, travel times, and timing risk. Pick where your ship docks to see options matched to your day ashore.</p>
          </div>
        </section>

        <section className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {PORTS.map((port) => (
            <Link
              key={port.slug}
              href={`/ports/${port.slug}`}
              className="flex flex-col rounded-[2rem] border border-slate-200 bg-white p-6 shadow-[0_18px_60px_rgba(15,23,42,0.08)] transition hover:-translate-y-1 hover:border-sky-300"
            >
              <div className="text-[11px] font-black uppercase tracking-[0.18em] text-sky-700">Port</div>
              <h2 className="mt-3 text-2xl font-black tracking-tight text-slate-950">{port.title}</h2>
              <p className="mt-3 flex-1 text-sm leading-7 text-slate-600">{port.copy}</p>
              <div className="mt-5 text-sm font-black uppercase tracking-[0.12em] text-cyan-700">See tours</div>
            </Link>
          ))}
        </section>
      </div>
    </main>
  );
}
