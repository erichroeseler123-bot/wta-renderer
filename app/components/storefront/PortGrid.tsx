import Link from "next/link";

const PORTS = [
  {
    slug: "juneau",
    name: "Juneau",
    copy: "Helicopter, glacier, and whale tours with the most live availability.",
    img: "/hero/juneau.jpg",
    fix: true,
  },
  {
    slug: "skagway",
    name: "Skagway",
    copy: "White Pass rail, glacier, and scenic drives close to the dock.",
    img: "/hero/skagway.jpg",
    fix: true,
  },
  {
    slug: "ketchikan",
    name: "Ketchikan",
    copy: "Wildlife, totems, and rainforest tours a short walk from the pier.",
    img: "/hero/ketchikan.png",
    fix: true,
  },
  {
    slug: "sitka",
    name: "Sitka",
    copy: "Sea otters, wildlife, and coastal history on a quieter port day.",
    img: "/ports/sitka.png",
    fix: false,
  },
  {
    slug: "icy-strait-point",
    name: "Icy Strait Point",
    copy: "Whale watching and wilderness from Hoonah's cruise dock.",
    img: "/ports/icy-strait-point.png",
    fix: false,
  },
  {
    slug: "haines",
    name: "Haines",
    copy: "Bald eagles, river floats, and fewer crowds up Lynn Canal.",
    img: "/ports/haines.png",
    fix: false,
  },
  {
    slug: "seward",
    name: "Seward",
    copy: "Kenai Fjords cruises and glacier access for pre or post-cruise days.",
    img: "/ports/seward.png",
    fix: false,
  },
  {
    slug: "whittier",
    name: "Whittier",
    copy: "Prince William Sound glaciers and a quick gateway to Anchorage.",
    img: "/ports/whittier.png",
    fix: false,
  },
  {
    slug: "anchorage",
    name: "Anchorage Area",
    copy: "Day trips, train rides, and wildlife along the road system.",
    img: "/ports/anchorage.png",
    fix: false,
  },
] as const;

export default function PortGrid() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20">
      <div className="max-w-2xl">
        <div className="text-[11px] font-black uppercase tracking-[0.18em] text-sky-700">
          Browse by cruise port
        </div>
        <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl text-balance">
          Start with where your ship docks.
        </h2>
        <p className="mt-3 text-sm leading-7 text-slate-600 sm:text-base text-pretty">
          Each port has different tours, travel times, and timing risk. Pick your port to see
          options matched to your day ashore.
        </p>
      </div>

      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {PORTS.map((port) => (
          <Link
            key={port.slug}
            href={`/ports/${port.slug}`}
            className="group relative flex aspect-[4/5] flex-col justify-end overflow-hidden rounded-3xl border border-slate-200 shadow-[0_18px_50px_rgba(15,23,42,0.12)] transition hover:-translate-y-1.5 hover:shadow-[0_28px_70px_rgba(15,23,42,0.22)]"
          >
            <img
              src={port.img || "/placeholder.svg"}
              alt={`${port.name}, Alaska`}
              className={`absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-105 ${
                port.fix ? "[filter:saturate(1.55)_contrast(1.22)_brightness(0.9)]" : ""
              }`}
            />
            <div
              className="absolute inset-0 bg-[linear-gradient(to_top,rgba(8,15,30,0.92)_4%,rgba(8,15,30,0.45)_42%,rgba(8,15,30,0.12)_100%)]"
              aria-hidden="true"
            />
            <div className="relative p-6">
              <div className="inline-flex rounded-full bg-white/15 px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-cyan-100 backdrop-blur-sm">
                Port
              </div>
              <h3 className="mt-3 text-2xl font-black tracking-tight text-white">{port.name}</h3>
              <p className="mt-2 text-sm leading-6 text-white/85">{port.copy}</p>
              <div className="mt-4 inline-flex items-center gap-2 text-sm font-black uppercase tracking-[0.12em] text-[#7fe0ff]">
                See tours
                <span aria-hidden="true" className="transition group-hover:translate-x-1">
                  &rarr;
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
