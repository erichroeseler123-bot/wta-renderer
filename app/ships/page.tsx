import Link from "next/link";
import JsonLd from "@/components/seo/JsonLd";
import Breadcrumbs from "@/app/components/seo/Breadcrumbs";

const SHIPS = [
  { slug: "celebrity-edge", name: "Celebrity Edge", line: "Celebrity Cruises", use: "Plan independent Juneau, Skagway, and Ketchikan excursions around the current sailing's port-day details." },
  { slug: "royal-princess", name: "Royal Princess", line: "Princess Cruises", use: "Compare connected Alaska excursions and confirm berth, meeting-point, and all-aboard timing for your sailing." },
  { slug: "discovery-princess", name: "Discovery Princess", line: "Princess Cruises", use: "Move from ship planning into live Juneau, Skagway, and Ketchikan excursion inventory." },
  { slug: "norwegian-bliss", name: "Norwegian Bliss", line: "Norwegian Cruise Line", use: "Plan around berth or shuttle requirements before choosing a live Alaska excursion departure." },
  { slug: "koningsdam", name: "Koningsdam", line: "Holland America Line", use: "Compare Alaska port-day options while keeping the ship's current schedule and operator instructions in view." },
];

export const metadata = {
  title: "Alaska Cruise Ship Excursion Planners | Welcome To Alaska Tours",
  description: "Browse Alaska shore-excursion planning pages for selected cruise ships, then compare connected Juneau, Skagway, and Ketchikan tours with live operator calendars.",
  alternates: { canonical: "https://welcometoalaskatours.com/ships" },
};

export default function ShipsIndexPage() {
  const itemListSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Alaska cruise ship excursion planners",
    numberOfItems: SHIPS.length,
    itemListElement: SHIPS.map((ship, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: `${ship.name} Alaska excursion planner`,
      url: `https://welcometoalaskatours.com/ships/${ship.slug}`,
    })),
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://welcometoalaskatours.com/" },
      { "@type": "ListItem", position: 2, name: "Ships", item: "https://welcometoalaskatours.com/ships" },
    ],
  };

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#eef7ff_0%,#f8fafc_42%,#ffffff_100%)] text-slate-900 pb-20">
      <JsonLd data={itemListSchema} />
      <JsonLd data={breadcrumbSchema} />
      <div className="mx-auto max-w-5xl px-6 sm:px-8 py-12 space-y-8">
        <Breadcrumbs items={[{ href: "/", label: "Home" }, { label: "Ships" }]} />

        <section className="text-center space-y-2">
          <div className="inline-flex rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-sky-800">Cruise Ship Directory</div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900 sm:text-4xl leading-tight">Alaska Cruise Ship Excursion Planners</h1>
          <p className="text-sm text-slate-600 max-w-2xl mx-auto">Start with one of the ship planners currently built, then move into connected Juneau, Skagway, and Ketchikan excursion pages. Always confirm the current sailing's berth, arrival, meeting instructions, and all-aboard time.</p>
        </section>

        <section className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {SHIPS.map((ship) => (
            <div key={ship.slug} className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition hover:-translate-y-1 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex justify-between items-center"><span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">{ship.line}</span><span className="rounded bg-sky-50 px-1.5 py-0.5 text-[9px] font-bold text-sky-800">Planner available</span></div>
                <h2 className="text-lg font-black text-slate-950 leading-tight">{ship.name}</h2>
                <p className="text-xs leading-5 text-slate-600">{ship.use}</p>
              </div>
              <div className="pt-4 mt-4 border-t border-slate-100"><Link href={`/ships/${ship.slug}`} className="rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-bold text-white hover:bg-slate-800 transition block text-center">View Ship Planner</Link></div>
            </div>
          ))}
        </section>

        <section className="grid gap-4 sm:grid-cols-3">
          <Link href="/ports/juneau" className="rounded-2xl border border-slate-200 bg-white p-5 text-center font-bold text-slate-900">Juneau excursions</Link>
          <Link href="/ports/skagway" className="rounded-2xl border border-slate-200 bg-white p-5 text-center font-bold text-slate-900">Skagway excursions</Link>
          <Link href="/ports/ketchikan" className="rounded-2xl border border-slate-200 bg-white p-5 text-center font-bold text-slate-900">Ketchikan excursions</Link>
        </section>

        <section className="rounded-[2rem] border border-amber-200 bg-amber-50/40 p-5 text-center"><p className="text-xs text-slate-700">These pages are planning aids, not live cruise-line schedules. Confirm your exact sailing details and operator instructions before booking.</p></section>
      </div>
    </main>
  );
}
