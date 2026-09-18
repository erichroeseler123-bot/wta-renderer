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
    description: "Strict cruise-safety buffers: tour end time + 45 min <= all-aboard, traffic-free port routes, and back-to-ship guarantees.",
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
    slug: "cruise-ship-vs-independent-alaska-excursions",
    title: "Independent vs Cruise Ship Excursions",
    description: "Compare pricing, group sizes, back-to-ship guarantees, and port logistics between independent operators and ship tours.",
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
      <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 sm:py-16 space-y-8">
        <section className="text-center space-y-4">
          <div className="inline-flex rounded-full border border-sky-200 bg-sky-50 px-4 py-2 text-xs font-black uppercase tracking-[0.2em] text-sky-800">
            Resource Directory
          </div>
          <h1 className="text-4xl font-black tracking-tight text-slate-900 sm:text-5xl max-w-3xl mx-auto leading-tight">
            Alaska Cruise Planning Guides
          </h1>
          <p className="text-base text-slate-655 max-w-2xl mx-auto leading-relaxed">
            Make the big port-day decisions first, then check dock logistics, excursion timing, and return buffers before you book.
          </p>
        </section>

        <section className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {GUIDES.map((guide) => (
            <Link
              key={guide.slug}
              href={`/guides/${guide.slug}`}
              className="rounded-[2.5rem] border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition hover:-translate-y-1 block space-y-3"
            >
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 block">
                Planning Guide
              </span>
              <h2 className="text-xl font-black text-slate-950 block leading-tight">
                {guide.title}
              </h2>
              <p className="text-xs leading-5 text-slate-600 block">
                {guide.description}
              </p>
              <span className="text-xs font-bold text-sky-805 block hover:text-sky-900 pt-4 border-t border-slate-100 flex justify-between items-center">
                <span>Read Guide</span>
                <span>→</span>
              </span>
            </Link>
          ))}
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
