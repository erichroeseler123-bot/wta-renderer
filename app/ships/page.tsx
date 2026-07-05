import Link from "next/link";

const SHIPS = [
  {
    slug: "celebrity-edge",
    name: "Celebrity Edge",
    line: "Celebrity Cruises",
    use: "Juneau flightseeing and Skagway train timing checks.",
  },
  {
    slug: "royal-princess",
    name: "Royal Princess",
    line: "Princess Cruises",
    use: "AJ Dock shuttle timing and Skagway walk margins.",
  },
  {
    slug: "discovery-princess",
    name: "Discovery Princess",
    line: "Princess Cruises",
    use: "Downtown Ketchikan walks and Juneau glacier transfers.",
  },
  {
    slug: "norwegian-bliss",
    name: "Norwegian Bliss",
    line: "Norwegian Cruise Line",
    use: "Ketchikan Ward Cove shuttle timing and Juneau helicopter fits.",
  },
  {
    slug: "koningsdam",
    name: "Koningsdam",
    line: "Holland America Line",
    use: "HAL downtown Juneau docks and Ketchikan disembarkation.",
  },
];

export const metadata = {
  title: "Alaska Cruise Ship Planners | Welcome To Alaska Tours",
  description: "Browse timing-first shore excursion planning guides for all major cruise ships visiting Alaska.",
  alternates: {
    canonical: "https://welcometoalaskatours.com/ships",
  },
};

export default function ShipsIndexPage() {
  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#eef7ff_0%,#f8fafc_42%,#ffffff_100%)] text-slate-900 pb-20">
      <div className="mx-auto max-w-5xl px-6 sm:px-8 py-12 space-y-8">
        
        {/* Header */}
        <section className="text-center space-y-2">
          <div className="inline-flex rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-sky-800">
            Cruise Ship Directory
          </div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900 sm:text-4xl leading-tight">
            Alaska Cruise Ship Planners
          </h1>
          <p className="text-sm text-slate-605 max-w-xl mx-auto">
            Select your cruise ship below to view custom disembarkation guides, port layout timing, and live excursion fits.
          </p>
        </section>

        {/* Ships Grid */}
        <section className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {SHIPS.map((ship) => (
            <div
              key={ship.slug}
              className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition hover:-translate-y-1 flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    {ship.line}
                  </span>
                  <span className="rounded bg-sky-50 px-1.5 py-0.5 text-[9px] font-bold text-sky-800">
                    Planner Active
                  </span>
                </div>
                <h2 className="text-lg font-black text-slate-950 leading-tight">
                  {ship.name}
                </h2>
                <p className="text-xs leading-5 text-slate-600">
                  {ship.use}
                </p>
              </div>
              <div className="pt-4 mt-4 border-t border-slate-100">
                <Link
                  href={`/ships/${ship.slug}`}
                  className="rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-bold text-white hover:bg-slate-800 transition block text-center"
                >
                  View Ship Planner
                </Link>
              </div>
            </div>
          ))}
        </section>

        {/* Cautious Note */}
        <section className="rounded-[2rem] border border-amber-200 bg-amber-50/40 p-5 text-center">
          <p className="text-xs text-slate-700">
            We do not have every sailing loaded yet. Confirm your exact all-aboard time before booking.
          </p>
        </section>

      </div>
    </main>
  );
}
