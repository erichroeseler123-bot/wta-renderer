import Link from "next/link";

const GUIDES = [
  {
    slug: "best-shore-excursions-in-juneau",
    title: "Best Shore Excursions in Juneau",
    description: "Top picks for cruise passengers: whale watching, Mendenhall Glacier, helicopter landings, dog sledding, and fishing charters.",
  },
  {
    slug: "how-to-get-to-mendenhall-glacier-from-cruise-port",
    title: "How to Get to Mendenhall Glacier from Cruise Port",
    description: "Transport comparison: commercial shuttles, combos, taxi/rideshare shortages, and USFS permit restrictions.",
  },
  {
    slug: "juneau-whale-watching-vs-mendenhall",
    title: "Juneau Whale Watching vs Mendenhall Glacier",
    description: "A side-by-side cruise-day decision guide: choose wildlife, glacier scenery, or a combination based on your group and actual ship window.",
  },
  {
    slug: "best-things-to-do-in-skagway-4-6-hours",
    title: "Best Things to Do in Skagway in 4 to 6 Hours",
    description: "Maximize a short port call: helicopter icefield flights, Liarsville camp, electric scooters, and historic Broadway without missing all-aboard.",
  },
  {
    slug: "first-time-in-ketchikan-shore-excursions",
    title: "First Time in Ketchikan Shore Excursions",
    description: "Essential first-timer guide: Misty Fjords seaplanes, coastal bear viewing, sea kayaking, Creek Street, and Ward Cove logistics.",
  },
  {
    slug: "how-much-do-alaska-shore-excursions-cost",
    title: "How Much Do Alaska Shore Excursions Cost?",
    description: "2026 pricing transparency across all categories, saving 20–40% booking independent vs cruise ship markups.",
  },
  {
    slug: "what-happens-if-my-alaska-tour-runs-late",
    title: "What Happens If My Alaska Tour Runs Late?",
    description: "Cruise-safety timing: tour return time + 45–60 min <= all-aboard, traffic-free port routes, and 100% missed-port refund protection.",
  },
  {
    slug: "easy-alaska-shore-excursions",
    title: "Best Easy Alaska Shore Excursions",
    description: "Low-walking, scenic, and accessible excursions in Juneau, Skagway, and Ketchikan for seniors and multigenerational families.",
  },
  {
    slug: "private-premium-alaska-shore-excursions",
    title: "Private & Premium Alaska Shore Excursions",
    description: "VIP charters: private 6-pack whale watching, private glacier helicopters, luxury vans, and custom timing.",
  },
  {
    slug: "juneau-private-whale-watching-charters",
    title: "Private Charters for Whale Watching in Juneau, AK",
    description: "Compare boat sizes (6 to 14+ guests), per-person economics ($193–$338), Auke Bay marina logistics, and dock return timing.",
  },
  {
    slug: "cruise-ship-vs-independent-alaska-excursions",
    title: "Independent vs Cruise Ship Excursions",
    description: "Compare pricing, group sizes, timing buffers, and 100% missed-port refund protection between independent operators and ship tours.",
  },
  {
    slug: "how-long-does-it-take-to-get-off-the-ship-in-juneau",
    title: "How Long to Get Off the Cruise Ship in Juneau",
    description: "Juneau disembarkation times, Franklin Street vs AJ Dock shuttle logistics, Mt. Roberts Tramway tour pickup walking guides, and critical timing buffers.",
  },
  {
    slug: "how-long-does-it-take-to-get-off-the-ship-in-skagway",
    title: "How Long to Get Off the Cruise Ship in Skagway",
    description: "Broadway, Ore, and Railroad dock disembarkation procedures, long pier walking distances, and White Pass railway direct pier transfer times.",
  },
  {
    slug: "how-long-does-it-take-to-get-off-the-ship-in-ketchikan",
    title: "How Long to Get Off the Cruise Ship in Ketchikan",
    description: "Ketchikan downtown berths 1-4 walkability vs Ward Cove (NCL) 7-mile transit shuttle lines, check-in logistics, and safety buffers.",
  },
  {
    slug: "best-alaska-cruise-ports-for-bird-watching",
    title: "Best Alaska Cruise Ports for Bird Watching",
    description: "Port-by-port birding guide: coastal walking spots in Juneau, Ketchikan, and Skagway, key species, seasonal flyway timing, and excursion tips.",
  },
  {
    slug: "alaska-nature-by-cruise-port",
    title: "Alaska Nature by Cruise Port: Birds, Northern Lights & Whale Sightings",
    description: "Complete port-by-port nature guide for Juneau, Ketchikan, Skagway, Sitka, and Icy Strait Point with realistic seasonal sighting calendars and cruise logistics.",
  },
];

const GUIDE_IMAGES: Record<string, { src: string; alt: string; badge: string }> = {
  "best-shore-excursions-in-juneau": {
    src: "/hero/juneau.jpg",
    alt: "Juneau Alaska harbor and mountain backdrop",
    badge: "Juneau Excursions",
  },
  "how-to-get-to-mendenhall-glacier-from-cruise-port": {
    src: "https://cdn.filestackcontent.com/CT2dtoRkRU2deQYYVMz8",
    alt: "Mendenhall Glacier guided hike and trail",
    badge: "Mendenhall Transit",
  },
  "juneau-whale-watching-vs-mendenhall": {
    src: "https://cdn.filestackcontent.com/yhEJiyfzTFygwKNl107S",
    alt: "Humpback whale breaching out of the water near a Juneau tour boat",
    badge: "Juneau Decision",
  },
  "best-things-to-do-in-skagway-4-6-hours": {
    src: "/hero/skagway.jpg",
    alt: "Skagway historic Gold Rush port and railway town",
    badge: "Skagway Highlights",
  },
  "first-time-in-ketchikan-shore-excursions": {
    src: "https://cdn.filestackcontent.com/F68TIQZRJSNvKvyDfnyl",
    alt: "Taquan Air floatplane soaring over the granite cliffs of Misty Fjords",
    badge: "First-Timer Guide",
  },
  "how-much-do-alaska-shore-excursions-cost": {
    src: "/images/home-hero.jpg",
    alt: "Scenic Alaska cruise fjord and mountain landscape",
    badge: "Cost Transparency",
  },
  "what-happens-if-my-alaska-tour-runs-late": {
    src: "/images/ketchikan/ketchikan-cruise-port.jpg",
    alt: "Cruise ship berthed in Alaska port",
    badge: "Cruise Ship Buffer",
  },
  "easy-alaska-shore-excursions": {
    src: "/hero/skagway.jpg",
    alt: "Scenic railroad and low-walking Alaska excursions",
    badge: "Low-Walking & Seniors",
  },
  "private-premium-alaska-shore-excursions": {
    src: "/images/juneau/juneau-helicopter-glacier.jpg",
    alt: "Helicopter landed atop pristine blue glacier ice",
    badge: "Private Charters",
  },
  "juneau-private-whale-watching-charters": {
    src: "https://cdn.filestackcontent.com/BiZrxNkTHaMstzWv7dEA",
    alt: "Private whale-watching charter boat in Juneau watching a humpback whale dive",
    badge: "Private Whale Charters",
  },
  "cruise-ship-vs-independent-alaska-excursions": {
    src: "/images/ketchikan/ketchikan-cruise-port.jpg",
    alt: "Cruise ship port and independent tour comparison",
    badge: "Independent vs Ship",
  },
  "how-long-does-it-take-to-get-off-the-ship-in-juneau": {
    src: "/hero/juneau.jpg",
    alt: "Juneau cruise dock and Mt. Roberts Tramway staging area",
    badge: "Juneau Timing",
  },
  "how-long-does-it-take-to-get-off-the-ship-in-skagway": {
    src: "/hero/skagway.jpg",
    alt: "Skagway Broadway, Ore, and Railroad piers",
    badge: "Skagway Timing",
  },
  "how-long-does-it-take-to-get-off-the-ship-in-ketchikan": {
    src: "/images/ketchikan/ketchikan-cruise-port.jpg",
    alt: "Ketchikan downtown berths and Ward Cove shuttle terminal",
    badge: "Ketchikan Timing",
  },
  "best-alaska-cruise-ports-for-bird-watching": {
    src: "/hero/hero8521.jpg",
    alt: "Southeast Alaska bald eagle and temperate coastal habitat",
    badge: "Birding & Coastal Nature",
  },
  "alaska-nature-by-cruise-port": {
    src: "/images/ketchikan/ketchikan-misty-fjords.jpg",
    alt: "Misty Fjords National Monument granite cliffs and wilderness",
    badge: "Alaska Nature & Fjord",
  },
};

export const metadata = {
  title: "Alaska Cruise Planning Guides | Welcome To Alaska Tours",
  description: "Compare Alaska cruise-port decisions, excursion choices, dock logistics, disembarkation timing, and safety buffers for Juneau, Skagway, and Ketchikan.",
  alternates: {
    canonical: "https://www.welcometoalaskatours.com/guides",
  },
};

export default function GuidesIndexPage() {
  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#eef7ff_0%,#f8fafc_42%,#ffffff_100%)] text-slate-900 pb-20">
      <section className="relative isolate overflow-hidden bg-[linear-gradient(135deg,#082f49_0%,#0f172a_58%,#164e63_100%)] px-6 py-14 text-white sm:py-20">
        <img
          src="/images/home-hero.jpg"
          alt=""
          aria-hidden="true"
          className="absolute inset-0 -z-20 h-full w-full object-cover opacity-25"
        />
        <div className="absolute inset-0 -z-10 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent" />
        <div className="relative z-10 mx-auto max-w-5xl text-center space-y-4">
          <div className="inline-flex rounded-full border border-cyan-400/30 bg-white/10 px-4 py-2 text-xs font-black uppercase tracking-[0.2em] text-cyan-200 backdrop-blur-sm">
            Resource Directory
          </div>
          <h1 className="text-4xl font-black tracking-tight text-white sm:text-5xl max-w-3xl mx-auto leading-tight">
            Alaska Cruise Planning Guides
          </h1>
          <p className="text-base text-slate-200 max-w-2xl mx-auto leading-relaxed">
            Make the big port-day decisions first, then check dock logistics, excursion timing, and return buffers before you book.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 sm:py-16 space-y-8">
        <section className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {GUIDES.map((guide) => {
            const imgData = GUIDE_IMAGES[guide.slug];
            return (
              <Link
                key={guide.slug}
                href={`/guides/${guide.slug}`}
                className="group overflow-hidden rounded-[2.5rem] border border-slate-200 bg-white shadow-sm hover:shadow-md transition hover:-translate-y-1 flex flex-col justify-between"
              >
                <div>
                  <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-900">
                    <img
                      src={imgData?.src || "/images/home-hero.jpg"}
                      alt={imgData?.alt || guide.title}
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-105 opacity-90 group-hover:opacity-100"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent" />
                    {imgData?.badge && (
                      <span className="absolute top-3 left-3 rounded-full bg-slate-950/80 backdrop-blur-sm px-2.5 py-1 text-[9px] font-black uppercase tracking-wider text-cyan-200 border border-cyan-400/30">
                        {imgData.badge}
                      </span>
                    )}
                  </div>
                  <div className="p-6 space-y-3">
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 block">
                      Planning Guide
                    </span>
                    <h2 className="text-xl font-black text-slate-950 block leading-tight">
                      {guide.title}
                    </h2>
                    <p className="text-xs leading-5 text-slate-600 block">
                      {guide.description}
                    </p>
                  </div>
                </div>
                <div className="p-6 pt-0">
                  <span className="text-xs font-bold text-sky-800 block group-hover:text-sky-950 pt-4 border-t border-slate-100 flex justify-between items-center">
                    <span>Read Guide</span>
                    <span>→</span>
                  </span>
                </div>
              </Link>
            );
          })}
        </section>

        <section className="pt-8 border-t border-slate-205 grid gap-4 sm:grid-cols-3">
          <Link
            href="/ports"
            className="rounded-2xl border border-slate-205 bg-white p-5 text-center shadow-sm hover:shadow transition block"
          >
            <span className="text-[10px] font-black uppercase tracking-wider text-sky-700 block">
              Port Guides
            </span>
            <span className="mt-2 text-sm font-bold text-slate-900 block">
              Browse Port Directories
            </span>
          </Link>
          <Link
            href="/tours"
            className="rounded-2xl border border-slate-205 bg-white p-5 text-center shadow-sm hover:shadow transition block"
          >
            <span className="text-[10px] font-black uppercase tracking-wider text-sky-700 block">
              Full Catalog
            </span>
            <span className="mt-2 text-sm font-bold text-slate-900 block">
              Browse All Shore Excursions
            </span>
          </Link>
          <Link
            href="/plan"
            className="rounded-2xl border border-slate-205 bg-white p-5 text-center shadow-sm hover:shadow transition block"
          >
            <span className="text-[10px] font-black uppercase tracking-wider text-sky-700 block">
              Timing Tool
            </span>
            <span className="mt-2 text-sm font-bold text-slate-900 block">
              Match Excursions to Ship Window
            </span>
          </Link>
        </section>
      </div>
    </main>
  );
}
