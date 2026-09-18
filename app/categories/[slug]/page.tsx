import Link from "next/link";
import { notFound } from "next/navigation";
import { getHelicopterTours } from "@/lib/helicopterTours";
import { sanitizeTours } from "@/lib/tourSeo";
import Breadcrumbs from "@/app/components/seo/Breadcrumbs";
import JsonLd from "@/components/seo/JsonLd";

const APPROVED_CATEGORIES = [
  "juneau-helicopter-tours",
  "glacier-tours",
  "dog-sledding",
  "whale-watching",
  "mendenhall-glacier",
  "flightseeing",
];

type TourType = {
  pk: number;
  slug: string;
  title: string;
  description?: string;
  image?: string;
  company: string;
  port: string;
  fromPrice?: string;
  category?: string;
};

type CategoryConfig = {
  title: string;
  headline: string;
  metaTitle: string;
  metaDescription: string;
  intro: string;
  matchFilter: (tour: TourType) => boolean;
};

const has = (tour: TourType, term: string) =>
  `${tour.title} ${tour.description || ""} ${tour.category || ""}`.toLowerCase().includes(term);

const CATEGORY_CONFIGS: Record<string, CategoryConfig> = {
  "juneau-helicopter-tours": {
    title: "Juneau Helicopter Tours",
    headline: "Juneau Helicopter Tours & Glacier Landings",
    metaTitle: "Juneau Helicopter Tours: Glacier Landings, Treks & Prices (2026)",
    metaDescription: "Compare Juneau helicopter tour prices, glacier landings on Herbert and Norris Glaciers, guided ice walks, and glacier dog sledding with 100% weather refunds.",
    intro: "Experience the Juneau Icefield from the air. Compare scenic glacier landing flights, guided crampon ice walks (NorthStar / TEMSCO style), and helicopter dog sledding camps departing with cruise dock transfers.",
    matchFilter: (tour) =>
      tour.port === "juneau" && (tour.category === "Air Tours" || has(tour, "helicopter")),
  },
  "glacier-tours": {
    title: "Glacier Tours",
    headline: "Alaska Glacier Tours & Guided Adventures",
    metaTitle: "Alaska Glacier Tours: Mendenhall, Icefield Treks & Paddles (2026)",
    metaDescription: "Compare Alaska glacier excursions across Juneau and Skagway: Mendenhall Visitor Center, lake canoe paddles, helicopter ice landings, and guided crampon treks.",
    intro: "Glacier days range from easy scenic viewing to active hikes, lake paddles, helicopter landings, and ice treks. Compare connected operator products across Juneau and Skagway.",
    matchFilter: (tour) => tour.category === "Hiking & Glaciers" || has(tour, "glacier"),
  },
  "dog-sledding": {
    title: "Dog Sledding",
    headline: "Alaska Dog Sledding Shore Excursions",
    metaTitle: "Alaska Dog Sledding Tours: Glacier Flights & Summer Camps (2026)",
    metaDescription: "Compare Alaska dog sledding excursions: helicopter glacier snow camps on the Juneau Icefield and Denver Glacier vs rainforest wheeled summer camps.",
    intro: "Browse authentic Alaska dog sledding excursions: high-altitude helicopter flights to glacier snow camps and accessible rainforest summer camps with Iditarod mushers and husky puppies.",
    matchFilter: (tour) => tour.category === "Dog Sledding" || has(tour, "dog") || has(tour, "sled"),
  },
  "whale-watching": {
    title: "Whale Watching",
    headline: "Alaska Whale Watching Shore Excursions",
    metaTitle: "Alaska Whale Watching Tours: Mendenhall Combos & Small Boats (2026)",
    metaDescription: "Compare Alaska whale watching excursions: guaranteed humpback sightings in Auke Bay, small-boat wilderness charters, and 5-hour Mendenhall Glacier combos.",
    intro: "Compare small-boat whale watches, covered heated catamarans, private charters, and 5-hour Whale Watching + Mendenhall Glacier combination tours departing with cruise dock transfers.",
    matchFilter: (tour) => tour.category === "Whale Watching" || has(tour, "whale"),
  },
  "mendenhall-glacier": {
    title: "Mendenhall Glacier",
    headline: "Mendenhall Glacier Excursions",
    metaTitle: "Mendenhall Glacier Tours from Cruise Port: Shuttles, Canoes & Hikes (2026)",
    metaDescription: "Compare Mendenhall Glacier tours from the Juneau cruise port: authorized commercial shuttles, lake canoe paddles, Nugget Falls walks, and whale combos.",
    intro: "Mendenhall Glacier is 13 miles from downtown Juneau. Compare authorized commercial shuttles, lake canoe paddles, guided hikes, and whale watching combination tours.",
    matchFilter: (tour) => has(tour, "mendenhall"),
  },
  "flightseeing": {
    title: "Flightseeing",
    headline: "Alaska Helicopter, Seaplane & Flightseeing Tours",
    metaTitle: "Alaska Flightseeing Tours: Helicopters, Seaplanes & Misty Fjords (2026)",
    metaDescription: "Compare Alaska flightseeing excursions: Juneau helicopter glacier landings, Misty Fjords floatplanes in Ketchikan, and Skagway glacier flights with weather refund protections.",
    intro: "Browse helicopter, seaplane, glacier-landing, and remote wilderness flightseeing products across Juneau, Ketchikan, and Skagway with complete cruise-day timing coordination.",
    matchFilter: (tour) =>
      tour.category === "Air Tours" || has(tour, "flight") || has(tour, "helicopter") || has(tour, "seaplane"),
  },
};

export async function generateStaticParams() {
  return APPROVED_CATEGORIES.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const config = CATEGORY_CONFIGS[slug];
  if (!config) return {};
  return {
    title: config.metaTitle,
    description: config.metaDescription,
    alternates: { canonical: `https://www.welcometoalaskatours.com/categories/${slug}` },
  };
}

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (!APPROVED_CATEGORIES.includes(slug)) notFound();
  const config = CATEGORY_CONFIGS[slug];

  const rawTours = await getHelicopterTours().catch(() => []);
  const tours = (sanitizeTours(rawTours) as TourType[]).filter(config.matchFilter);

  const categoryUrl = `https://www.welcometoalaskatours.com/categories/${slug}`;
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://www.welcometoalaskatours.com/" },
      { "@type": "ListItem", position: 2, name: "Tours", item: "https://www.welcometoalaskatours.com/tours" },
      { "@type": "ListItem", position: 3, name: config.title, item: categoryUrl },
    ],
  };
  const itemListSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: config.headline,
    numberOfItems: tours.length,
    itemListElement: tours.map((tour, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: tour.title,
      url: `https://www.welcometoalaskatours.com/tours/${tour.company}/${tour.pk}`,
    })),
  };

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 pb-20">
      <JsonLd data={breadcrumbSchema} />
      <JsonLd data={itemListSchema} />

      <section className="bg-slate-950 px-6 py-12 text-white">
        <div className="mx-auto max-w-5xl">
          <div className="[&_nav]:mb-5 [&_nav]:text-white/65 [&_nav_a]:hover:text-white [&_nav_span]:text-white/80">
            <Breadcrumbs
              items={[
                { href: "/", label: "Home" },
                { href: "/tours", label: "Tours" },
                { label: config.title },
              ]}
            />
          </div>
          <div className="inline-flex rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.22em] text-cyan-200">
            {config.title}
          </div>
          <h1 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">{config.headline}</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-white/80">{config.intro}</p>
          <p className="mt-3 max-w-2xl text-xs leading-5 text-white/60">
            Use the product page and booking calendar to confirm current times, prices, capacity, meeting details, and operator policies for your date.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-5xl px-6 sm:px-8">
        <section className="mt-8">
          <div className="flex items-end justify-between gap-4 border-b border-slate-200 pb-3">
            <div>
              <h2 className="text-2xl font-black tracking-tight text-slate-950">{tours.length} matching excursions</h2>
              <p className="mt-1 text-xs text-slate-500">Juneau, Skagway, and Ketchikan inventory is shown when it matches this experience type.</p>
            </div>
            <Link href="/tours" className="text-xs font-bold text-sky-800 hover:text-sky-700">All tours →</Link>
          </div>

          {tours.length ? (
            <div className="mt-6 grid gap-6 md:grid-cols-2">
              {tours.map((tour) => (
                <article key={`${tour.company}-${tour.pk}`} className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">
                  <div className="aspect-[16/9] overflow-hidden bg-slate-100">
                    <img
                      src={tour.image || (tour.port === "ketchikan" ? "/hero/ketchikan.png" : tour.port === "skagway" ? "/hero/skagway.jpg" : "/hero/juneau.jpg")}
                      alt={tour.title}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="p-6">
                    <div className="flex flex-wrap gap-2 text-[10px] font-black uppercase tracking-wider text-slate-500">
                      <span>{tour.port}</span>
                      <span>•</span>
                      <span>{tour.category || config.title}</span>
                    </div>
                    <h3 className="mt-2 text-xl font-black leading-tight text-slate-950">{tour.title}</h3>
                    {tour.description && <p className="mt-2 line-clamp-2 text-xs leading-5 text-slate-600">{tour.description}</p>}
                    <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
                      <span className="text-lg font-black text-slate-950">{tour.fromPrice || "Check price"}</span>
                      <Link
                        href={`/tours/${tour.company}/${tour.pk}`}
                        className="rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-bold text-white hover:bg-slate-800"
                      >
                        View tour
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="mt-6 rounded-3xl border border-slate-200 bg-white p-8 text-center">
              <p className="text-sm text-slate-600">No matching products are currently in the curated catalog.</p>
              <Link href="/tours" className="mt-4 inline-flex rounded-xl bg-slate-900 px-5 py-3 text-xs font-bold text-white">Browse all excursions</Link>
            </div>
          )}
        </section>

        <section className="mt-10 grid gap-4 sm:grid-cols-3">
          <Link href="/ports/juneau" className="rounded-2xl border border-slate-200 bg-white p-5 text-center font-bold text-slate-900">Juneau tours</Link>
          <Link href="/ports/skagway" className="rounded-2xl border border-slate-200 bg-white p-5 text-center font-bold text-slate-900">Skagway tours</Link>
          <Link href="/ports/ketchikan" className="rounded-2xl border border-slate-200 bg-white p-5 text-center font-bold text-slate-900">Ketchikan tours</Link>
        </section>
      </div>
    </main>
  );
}
