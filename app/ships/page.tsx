import Image from "next/image";
import Link from "next/link";
import JsonLd from "@/components/seo/JsonLd";
import Breadcrumbs from "@/app/components/seo/Breadcrumbs";

const SHIPS = [
  { slug: "celebrity-edge", name: "Celebrity Edge", line: "Celebrity Cruises", use: "Plan independent Juneau, Skagway, and Ketchikan excursions around the current sailing's port-day details.", image: "/images/ketchikan/ketchikan-cruise-port.jpg" },
  { slug: "royal-princess", name: "Royal Princess", line: "Princess Cruises", use: "Compare connected Alaska excursions and confirm berth, meeting-point, and all-aboard timing for your sailing.", image: "/hero/juneau.jpg" },
  { slug: "discovery-princess", name: "Discovery Princess", line: "Princess Cruises", use: "Move from ship planning into live Juneau, Skagway, and Ketchikan excursion inventory.", image: "/hero/skagway.jpg" },
  { slug: "norwegian-bliss", name: "Norwegian Bliss", line: "Norwegian Cruise Line", use: "Plan around berth or shuttle requirements before choosing a live Alaska excursion departure.", image: "/hero/hero8521.jpg" },
  { slug: "koningsdam", name: "Koningsdam", line: "Holland America Line", use: "Compare Alaska port-day options while keeping the ship's current schedule and operator instructions in view.", image: "/images/home-hero.jpg" },
];

export const metadata = {
  title: "Alaska Cruise Ship Excursion Planners | Welcome To Alaska Tours",
  description: "Browse Alaska shore-excursion planning pages for selected cruise ships, then compare connected Juneau, Skagway, and Ketchikan tours with live operator calendars.",
  alternates: { canonical: "https://www.welcometoalaskatours.com/ships" },
  openGraph: {
    title: "Alaska Cruise Ship Excursion Planners | Welcome To Alaska Tours",
    description: "Browse Alaska shore-excursion planning pages for selected cruise ships, then compare connected Juneau, Skagway, and Ketchikan tours with live operator calendars.",
    images: [{ url: "https://www.welcometoalaskatours.com/images/ketchikan/ketchikan-cruise-port.jpg", width: 1200, height: 630, alt: "Cruise ships docked in Southeast Alaska port" }],
  },
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
      url: `https://www.welcometoalaskatours.com/ships/${ship.slug}`,
    })),
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://www.welcometoalaskatours.com/" },
      { "@type": "ListItem", position: 2, name: "Ships", item: "https://www.welcometoalaskatours.com/ships" },
    ],
  };

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#eef7ff_0%,#f8fafc_42%,#ffffff_100%)] text-slate-900 pb-20">
      <JsonLd data={itemListSchema} />
      <JsonLd data={breadcrumbSchema} />

      <section className="relative overflow-hidden bg-slate-900 px-6 py-16 text-white sm:py-24">
        <div className="absolute inset-0">
          <Image
            src="/images/home-hero.jpg"
            alt="Cruise ship navigating the scenic fjords of Southeast Alaska"
            fill
            priority
            sizes="100vw"
            className="object-cover object-center opacity-30"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/80 to-transparent" />
        </div>
        <div className="relative z-10 mx-auto max-w-5xl">
          <div className="inline-flex rounded-full border border-sky-300/30 bg-sky-950/60 px-3.5 py-1 text-[11px] font-black uppercase tracking-[0.2em] text-cyan-300 backdrop-blur">
            Cruise Ship Directory
          </div>
          <h1 className="mt-3 text-3xl font-black tracking-tight text-white sm:text-5xl lg:text-6xl leading-tight">
            Alaska Cruise Ship Excursion Planners
          </h1>
          <p className="mt-4 text-base sm:text-lg text-slate-200 max-w-2xl leading-relaxed">
            Start with your ship&rsquo;s custom planner, then explore connected Juneau, Skagway, and Ketchikan excursion pages with verified local operators and guaranteed on-time return.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-5xl px-6 sm:px-8 py-10 space-y-10">
        <Breadcrumbs items={[{ href: "/", label: "Home" }, { label: "Ships" }]} />

        <section className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {SHIPS.map((ship) => (
            <div key={ship.slug} className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm hover:shadow-md transition hover:-translate-y-1 flex flex-col justify-between">
              <div className="relative h-44 w-full bg-slate-100">
                <Image
                  src={ship.image}
                  alt={`${ship.name} Alaska cruise excursions`}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  className="object-cover"
                />
                <span className="absolute top-3 left-3 rounded-full bg-slate-950/80 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-white backdrop-blur">
                  {ship.line}
                </span>
                <span className="absolute bottom-3 right-3 rounded-xl bg-white/95 px-2.5 py-1 text-[10px] font-black text-sky-800 shadow">
                  Planner Available
                </span>
              </div>
              <div className="p-6 flex-1 flex flex-col justify-between space-y-3">
                <div>
                  <h2 className="text-xl font-black text-slate-950 leading-tight">{ship.name}</h2>
                  <p className="mt-2 text-xs leading-5 text-slate-600">{ship.use}</p>
                </div>
                <div className="pt-4 border-t border-slate-100">
                  <Link href={`/ships/${ship.slug}`} className="rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-bold text-white hover:bg-slate-800 transition block text-center">
                    View Ship Planner →
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </section>

        <section className="grid gap-4 sm:grid-cols-3">
          <Link href="/ports/juneau" className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm hover:shadow-md transition flex flex-col">
            <div className="relative h-28 w-full bg-slate-100">
              <Image src="/hero/juneau.jpg" alt="Juneau excursions" fill sizes="(max-width: 640px) 100vw, 33vw" className="object-cover group-hover:scale-105 transition duration-300" />
            </div>
            <div className="p-4 text-center font-bold text-slate-900 group-hover:text-sky-700 transition">Juneau excursions →</div>
          </Link>
          <Link href="/ports/skagway" className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm hover:shadow-md transition flex flex-col">
            <div className="relative h-28 w-full bg-slate-100">
              <Image src="/hero/skagway.jpg" alt="Skagway excursions" fill sizes="(max-width: 640px) 100vw, 33vw" className="object-cover group-hover:scale-105 transition duration-300" />
            </div>
            <div className="p-4 text-center font-bold text-slate-900 group-hover:text-sky-700 transition">Skagway excursions →</div>
          </Link>
          <Link href="/ports/ketchikan" className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm hover:shadow-md transition flex flex-col">
            <div className="relative h-28 w-full bg-slate-100">
              <Image src="/images/ketchikan/ketchikan-cruise-port.jpg" alt="Ketchikan excursions" fill sizes="(max-width: 640px) 100vw, 33vw" className="object-cover group-hover:scale-105 transition duration-300" />
            </div>
            <div className="p-4 text-center font-bold text-slate-900 group-hover:text-sky-700 transition">Ketchikan excursions →</div>
          </Link>
        </section>

        <section className="rounded-[2rem] border border-amber-200 bg-amber-50/50 p-5 text-center">
          <p className="text-xs text-slate-700">These pages are planning aids, not live cruise-line schedules. Confirm your exact sailing details and operator instructions before booking.</p>
        </section>
      </div>
    </main>
  );
}
