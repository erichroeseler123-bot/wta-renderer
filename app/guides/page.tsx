import Link from "next/link";

const GUIDES = [
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
    slug: "how-long-does-it-take-to-get-off-the-ship-in-sitka",
    title: "How Long to Get Off the Cruise Ship in Sitka",
    description: "Sitka disembarkation guide. Halibut Point Marine shuttle buses to Centennial Hall, tendering procedures, and Crescent Harbor wildlife tour transit.",
  },
  {
    slug: "how-long-does-it-take-to-get-off-the-ship-in-icy-strait-point",
    title: "How Long to Get Off the Cruise Ship in Icy Strait Point",
    description: "Icy Strait Point private Hoonah destination layouts, Adventure Landing cannery walk vs Wilderness Landing Trans-Porter gondola queues.",
  },
  {
    slug: "how-long-does-it-take-to-get-off-the-ship-in-haines",
    title: "How Long to Get Off the Cruise Ship in Haines",
    description: "Port Chilkoot Dock disembarkation, walking paths to Parade Grounds, Fort Seward sights, and local rafting tour arrival timings.",
  },
];

export const metadata = {
  title: "Alaska Cruise Port timing Guides | Welcome To Alaska Tours",
  description: "Check disembarkation schedules, dock walk distances, tendering times, and excursion timing buffers for all major Alaska ports.",
  alternates: {
    canonical: "https://welcometoalaskatours.com/guides",
  },
};

export default function GuidesIndexPage() {
  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#eef7ff_0%,#f8fafc_42%,#ffffff_100%)] text-slate-900 pb-20">
      <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 sm:py-16 space-y-8">
        
        {/* Header */}
        <section className="text-center space-y-4">
          <div className="inline-flex rounded-full border border-sky-200 bg-sky-50 px-4 py-2 text-xs font-black uppercase tracking-[0.2em] text-sky-800">
            Resource Directory
          </div>
          <h1 className="text-4xl font-black tracking-tight text-slate-900 sm:text-5xl max-w-3xl mx-auto leading-tight">
            Alaska Cruise Port Timing Guides
          </h1>
          <p className="text-base text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Excursion scheduling is all about timing buffers. Compare disembarkation processes, dock layouts, and walking times to guarantee you never miss your ship.
          </p>
        </section>

        {/* Guides List */}
        <section className="grid gap-6 md:grid-cols-2">
          {GUIDES.map((guide) => (
            <Link
              key={guide.slug}
              href={`/guides/${guide.slug}`}
              className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition hover:-translate-y-1 block space-y-3"
            >
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 block">
                Timing Guide
              </span>
              <h2 className="text-xl font-black text-slate-950 block leading-tight">
                {guide.title}
              </h2>
              <p className="text-xs leading-5 text-slate-600 block">
                {guide.description}
              </p>
              <span className="text-xs font-bold text-sky-800 block hover:text-sky-900 pt-2 border-t border-slate-100">
                Read Guide →
              </span>
            </Link>
          ))}
        </section>

        {/* Navigation Action Links */}
        <section className="pt-8 border-t border-slate-200 grid gap-4 sm:grid-cols-3">
          <Link
            href="/ports"
            className="rounded-2xl border border-slate-200 bg-white p-5 text-center shadow-sm hover:shadow transition block"
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
            className="rounded-2xl border border-slate-200 bg-white p-5 text-center shadow-sm hover:shadow transition block"
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
            className="rounded-2xl border border-slate-200 bg-white p-5 text-center shadow-sm hover:shadow transition block"
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
