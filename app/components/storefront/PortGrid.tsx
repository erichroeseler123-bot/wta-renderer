import Link from "next/link";

const PORTS = [
  {
    slug: "juneau",
    name: "Juneau",
    copy: "Helicopter, glacier, and whale tours with the most live availability.",
  },
  {
    slug: "skagway",
    name: "Skagway",
    copy: "White Pass rail, glacier, and scenic drives close to the dock.",
  },
  {
    slug: "ketchikan",
    name: "Ketchikan",
    copy: "Wildlife, totems, and rainforest tours a short walk from the pier.",
  },
  {
    slug: "sitka",
    name: "Sitka",
    copy: "Sea otters, wildlife, and coastal history on a quieter port day.",
  },
  {
    slug: "icy-strait-point",
    name: "Icy Strait Point",
    copy: "Whale watching and wilderness from Hoonah's cruise dock.",
  },
  {
    slug: "haines",
    name: "Haines",
    copy: "Bald eagles, river floats, and fewer crowds up Lynn Canal.",
  },
  {
    slug: "seward",
    name: "Seward",
    copy: "Kenai Fjords cruises and glacier access for pre or post-cruise days.",
  },
  {
    slug: "whittier",
    name: "Whittier",
    copy: "Prince William Sound glaciers and a quick gateway to Anchorage.",
  },
  {
    slug: "anchorage",
    name: "Anchorage Area",
    copy: "Day trips, train rides, and wildlife along the road system.",
  },
] as const;

export default function PortGrid() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
      <div className="max-w-2xl">
        <div className="text-[11px] font-black uppercase tracking-[0.18em] text-sky-700">
          Browse by cruise port
        </div>
        <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl text-balance">
          Start with where your ship docks.
        </h2>
        <p className="mt-3 text-sm leading-7 text-slate-600 sm:text-base">
          Each port has different tours, travel times, and timing risk. Pick your port to see
          options matched to your day ashore.
        </p>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {PORTS.map((port) => (
          <Link
            key={port.slug}
            href={`/ports/${port.slug}`}
            className="group flex flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_12px_40px_rgba(15,23,42,0.06)] transition hover:-translate-y-1 hover:border-sky-300"
          >
            <div className="text-[11px] font-black uppercase tracking-[0.16em] text-sky-700">
              Port
            </div>
            <h3 className="mt-2 text-xl font-black tracking-tight text-slate-950">{port.name}</h3>
            <p className="mt-2 flex-1 text-sm leading-7 text-slate-600">{port.copy}</p>
            <div className="mt-4 text-sm font-black uppercase tracking-[0.12em] text-cyan-700 group-hover:text-cyan-600">
              See tours
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
