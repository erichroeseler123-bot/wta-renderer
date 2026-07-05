import Link from "next/link";
import { notFound } from "next/navigation";
import { getHelicopterTours } from "@/lib/helicopterTours";
import { sanitizeTours } from "@/lib/tourSeo";

// Supported categories
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
  slug: string;
  title: string;
  metaTitle: string;
  metaDescription: string;
  headline: string;
  intro: string;
  problem: string;
  guidance: string;
  faqs: { question: string; answer: string }[];
  matchFilter: (tour: TourType) => boolean;
};

const isGenericDescription = (desc: string) => {
  const d = desc.toLowerCase();
  return d.includes("cruise-friendly") || d.includes("memorable day in port") || d.includes("without wasting time");
};

const CATEGORY_CONFIGS: Record<string, CategoryConfig> = {
  "juneau-helicopter-tours": {
    slug: "juneau-helicopter-tours",
    title: "Juneau Helicopter Tours",
    metaTitle: "Juneau Helicopter Shore Excursions | Cruise Passenger Timing Guide",
    metaDescription: "Compare Juneau helicopter tours and glacier landings. Check timing guidelines, return buffers, and live availability to match your cruise schedule.",
    headline: "Juneau Helicopter Tours & Glacier Landings",
    intro: "Soar over the Juneau Icefield and walk on ancient glacial ice. Helicopter tours offer unmatched views of Alaska's wilderness, but their departures must align precisely with your cruise window.",
    problem: "Helicopter tours are highly sensitive to weather and weight balance constraints. Cancellations or scheduling shifts can happen, making a tight return window extremely risky for cruise passengers.",
    guidance: "Always maintain a minimum 45-minute return buffer (time between the tour's return and your ship's all-aboard time). Morning flights are recommended as weather conditions are typically most stable early in the day.",
    matchFilter: (t) => t.category === "Air Tours" || t.title.toLowerCase().includes("helicopter"),
    faqs: [
      {
        question: "How long are Juneau helicopter tours?",
        answer: "Most helicopter flightseeing tours last between 1.5 to 3 hours total, including check-in, safety briefings, and 15 to 30 minutes on the glacier itself.",
      },
      {
        question: "What happens if my helicopter tour is cancelled due to weather?",
        answer: "Safety is the priority. If your tour is cancelled by the operator, you will receive a full refund. We recommend booking helicopter tours earlier in your cruise day to allow rescheduling options.",
      },
    ],
  },
  "glacier-tours": {
    slug: "glacier-tours",
    title: "Glacier Tours",
    metaTitle: "Juneau Glacier Hiking & Walking Tours | Cruise Day Fit Check",
    metaDescription: "Examine glacier treks and ice hikes in Juneau. Verify timing buffers, safety guidelines, and live availability for your port day.",
    headline: "Juneau Glacier Hiking & Guided Treks",
    intro: "Step onto the ice and explore crevasses, moulin holes, and glacier ridges. Glacier trekking is an active, immersive experience that requires careful port-day coordination.",
    problem: "Glacier walking and trekking excursions require outfitting, safety training, and transit to the ice. A 3-hour walk can easily consume 4.5 to 5 hours of your port day, leaving little room for error.",
    guidance: "Select glacier trek times that leave at least a 60-minute return buffer before your cruise ship's all-aboard time. This ensures you do not miss your ship due to gear drop-off or transport delays.",
    matchFilter: (t) =>
      t.category === "Hiking & Glaciers" ||
      t.title.toLowerCase().includes("glacier") ||
      t.title.toLowerCase().includes("walk"),
    faqs: [
      {
        question: "Do I need special gear for an Alaska glacier hike?",
        answer: "Yes. Operators provide crampons, harnesses, helmets, and mountaineering boots. Plan on arriving at least 30 minutes prior to departure for gear outfitting.",
      },
      {
        question: "Can children participate in glacier treks?",
        answer: "Most active glacier trekking tours have age minimums (usually 8 or 12 years old) due to physical demands and gear size constraints.",
      },
    ],
  },
  "dog-sledding": {
    slug: "dog-sledding",
    title: "Glacier Dog Sledding",
    metaTitle: "Juneau Glacier Dog Sledding Tours | Cruise Timing & Availability",
    metaDescription: "Experience glacier dog sledding in Juneau. Find live availability, operator details, and safety return buffers tailored for cruise guests.",
    headline: "Juneau Glacier Dog Sledding Shore Excursions",
    intro: "MUSH! Fly by helicopter to a high-altitude glacier camp and drive a team of Alaskan Huskies. This bucket-list excursion is the perfect blend of flightseeing and dog mushing.",
    problem: "Glacier dog sledding camps are located on high-altitude snowfields. Weather conditions can change rapidly, leading to flight holds or cancellations that can affect your return timeline.",
    guidance: "Because of the extra flight component and remote camp location, a 45-minute return buffer is the absolute minimum safety margin. Booking morning slots is highly advised to avoid afternoon clouds.",
    matchFilter: (t) =>
      t.category === "Dog Sledding" ||
      t.title.toLowerCase().includes("dog") ||
      t.title.toLowerCase().includes("sled"),
    faqs: [
      {
        question: "How long is the actual dog sledding ride?",
        answer: "You will spend approximately 1 hour at the glacier dog sled camp, including about 20-30 minutes of active mushing and sled riding time.",
      },
      {
        question: "What should I wear for glacier dog sledding?",
        answer: "Glaciers are significantly colder than the cruise docks. Wear warm layers, sunglasses (glacier glare is intense), and water-resistant jackets.",
      },
    ],
  },
  "whale-watching": {
    slug: "whale-watching",
    title: "Whale Watching Tours",
    metaTitle: "Juneau Whale Watching Tours | Cruise Shore Day Guidelines",
    metaDescription: "Plan your Juneau whale watching excursion. Review timing, transit logistics, and port-day fit details.",
    headline: "Juneau Whale Watching Excursions",
    intro: "Witness Humpback whales feeding in the cold waters of Auke Bay. Whale watching is a must-do in Juneau, offering a near-100% sighting guarantee during the summer season.",
    problem: "Whale watching boats depart from Auke Bay Harbor, located a 25-minute drive from the cruise ship docks. Shuttle transit times must be accounted for to prevent missing your ship.",
    guidance: "Always confirm if your tour price includes round-trip shuttle transportation from the cruise docks. Ensure your tour return leaves a 45-minute buffer before your ship's scheduled all-aboard time.",
    matchFilter: () => false,
    faqs: [
      {
        question: "Where do whale watching tours depart in Juneau?",
        answer: "Most tours depart from Auke Bay Harbor. Operators provide shuttle buses that pick you up directly from the cruise ship docks in downtown Juneau.",
      },
      {
        question: "Are whale sightings guaranteed in Juneau?",
        answer: "Yes, most operators offer a whale sighting guarantee from May through September due to the high density of feeding humpbacks in the area.",
      },
    ],
  },
  "mendenhall-glacier": {
    slug: "mendenhall-glacier",
    title: "Mendenhall Glacier Tours",
    metaTitle: "Mendenhall Glacier Excursions | Cruise Port Guide & Timing",
    metaDescription: "Browse Mendenhall Glacier excursions in Juneau. Compare helicopter landings, hikes, and planning guidelines for a safe cruise return.",
    headline: "Mendenhall Glacier Excursions & Guide",
    intro: "Explore Juneau's most accessible and famous glacier. From the visitor center and Nugget Falls to helicopter ice walks, Mendenhall Glacier offers adventures for every activity level.",
    problem: "As Juneau's most popular attraction, Mendenhall Glacier experiences heavy visitor congestion. Traffic delays along the park road can occur, compressing your transit windows.",
    guidance: "Select structured tours that bundle roundtrip transit from the cruise docks. Plan your day so you arrive back at the cruise terminal at least 45 minutes before the all-aboard call.",
    matchFilter: (t) =>
      t.title.toLowerCase().includes("mendenhall") ||
      t.description?.toLowerCase().includes("mendenhall") ||
      false,
    faqs: [
      {
        question: "Can I walk on the Mendenhall Glacier from the visitor center?",
        answer: "No. Walking on the glacier requires a helicopter landing or a strenuous 8-mile guided round-trip hike along the West Glacier Trail.",
      },
      {
        question: "How far is the Mendenhall Glacier from the cruise ship docks?",
        answer: "It is about 12 miles (a 20-to-30 minute drive) from the downtown Juneau cruise docks to the Mendenhall Glacier Recreation Area.",
      },
    ],
  },
  "flightseeing": {
    slug: "flightseeing",
    title: "Flightseeing Tours",
    metaTitle: "Juneau Flightseeing Tours | Icefield Excursion Guide",
    metaDescription: "Review flightseeing excursions in Juneau. Check timing safety guidelines, local icefield flight paths, and live product availability.",
    headline: "Juneau Flightseeing Shore Excursions",
    intro: "Take to the skies by helicopter or floatplane for a bird's-eye view of the massive Juneau Icefield, deep fjords, and towering snow-capped mountains.",
    problem: "Aviation flightseeing paths are dictated by localized mountain weather and visibility limits. Delays or alternate flight paths are common, meaning your schedule must be flexible.",
    guidance: "We advise setting a conservative 60-minute return buffer for all flightseeing bookings to account for weather checks or minor scheduling delays.",
    matchFilter: (t) =>
      t.category === "Air Tours" ||
      t.title.toLowerCase().includes("flight") ||
      t.title.toLowerCase().includes("excursion") ||
      false,
    faqs: [
      {
        question: "What is the difference between helicopter and floatplane flightseeing?",
        answer: "Helicopters offer the ability to hover and land directly on glacier ice fields, while floatplanes provide classic Alaska bush flying thrills and land on remote lakes.",
      },
      {
        question: "Are flights bumpy?",
        answer: "Weather conditions vary. Pilots will not fly if turbulence or visibility is unsafe. Dress in layers as cabin temperatures can fluctuate.",
      },
    ],
  },
};

export async function generateStaticParams() {
  return APPROVED_CATEGORIES.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const config = CATEGORY_CONFIGS[slug];
  if (!config) return {};

  return {
    title: config.metaTitle,
    description: config.metaDescription,
    alternates: {
      canonical: `https://welcometoalaskatours.com/categories/${slug}`,
    },
  };
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  if (!APPROVED_CATEGORIES.includes(slug)) {
    notFound();
  }

  const config = CATEGORY_CONFIGS[slug];

  // Fetch live tours and filter
  let categoryTours: TourType[] = [];
  let hasLiveTours = false;
  try {
    const rawTours = await getHelicopterTours();
    const sanitized = sanitizeTours(rawTours) as TourType[];
    categoryTours = sanitized.filter(config.matchFilter);
    hasLiveTours = categoryTours.length > 0;
  } catch (e) {
    console.error("Failed to load category tours", e);
  }

  // Schema generation
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": config.faqs.map((faq) => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer,
      },
    })),
  };

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 pb-20">
      {/* Schema injection */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      {/* Hero section */}
      <section className="relative bg-slate-900 text-white py-12 px-6 sm:px-8">
        <div className="mx-auto max-w-5xl">
          <div className="inline-flex rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.22em] text-cyan-200">
            {config.title}
          </div>
          <h1 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">
            {config.headline}
          </h1>
          <p className="mt-2 text-sm text-white/80 max-w-2xl">
            Match {config.title.toLowerCase()} slots to your port day. Real-time availability verified. Strict return buffer rules enforced.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-5xl px-6 sm:px-8">
        {/* Live Tour Offerings or Fallback */}
        <section className="mt-8 space-y-6">
          <div className="border-b border-slate-200 pb-3 flex justify-between items-center">
            <h2 className="text-xl font-black tracking-tight text-slate-955 sm:text-2xl">
              Category Shore Excursions
            </h2>
            {hasLiveTours && (
              <span className="rounded bg-sky-100 px-2 py-1 text-[10px] font-black uppercase tracking-wider text-sky-800">
                Live Availability
              </span>
            )}
          </div>

          {hasLiveTours ? (
            <div className="grid gap-6 md:grid-cols-2">
              {categoryTours.map((tour) => (
                <div
                  key={tour.pk}
                  className="rounded-[2rem] border border-slate-200 bg-white overflow-hidden shadow-[0_18px_60px_rgba(15,23,42,0.08)] flex flex-col justify-between"
                >
                  <div className="relative aspect-[16/9] w-full overflow-hidden border-b border-slate-100">
                    <img
                      src={tour.image || "/hero/juneau.jpg"}
                      alt={tour.title}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="p-6 space-y-4 flex-grow flex flex-col justify-between">
                    <div className="space-y-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                        {tour.category || config.title}
                      </span>
                      <h3 className="text-lg font-black tracking-tight text-slate-900 leading-tight">
                        {tour.title}
                      </h3>
                      {!isGenericDescription(tour.description || "") && tour.description && (
                        <p className="text-xs text-slate-650 line-clamp-1">
                          {tour.description}
                        </p>
                      )}
                    </div>

                    <div className="pt-4 flex items-center justify-between border-t border-slate-100">
                      <span className="text-base font-black text-slate-900">
                        {tour.fromPrice || "Check Price"}
                      </span>
                      <Link
                        href={`/tours/${tour.company}/${tour.pk}`}
                        className="rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white hover:bg-slate-800 transition"
                      >
                        View Excursion
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-[2rem] border border-slate-200 bg-white p-6 sm:p-8 text-center space-y-4">
              <p className="text-sm leading-relaxed text-slate-600 max-w-2xl mx-auto">
                Live excursions for this category are currently being verified. Configure your ship timing below to calculate compatible safety buffers.
              </p>
              <div className="pt-2 flex flex-wrap gap-3 justify-center">
                <Link
                  href="/plan"
                  className="rounded-xl bg-slate-900 px-5 py-3 text-xs font-bold text-white hover:bg-slate-800 transition"
                >
                  Configure Timing Guidance
                </Link>
                <Link
                  href="/tours"
                  className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
                >
                  Browse Live Alaska Tours
                </Link>
              </div>
            </div>
          )}
        </section>

        {/* Timing Problem Card */}
        <section className="mt-8 grid gap-6 md:grid-cols-2">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">
              Good For
            </h3>
            <p className="mt-2 text-xs leading-relaxed text-slate-600">
              Ideal for cruisers seeking premium glacier views, flightseeing thrills, and direct schedule checks.
            </p>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">
              Watch Out
            </h3>
            <p className="mt-2 text-xs leading-relaxed text-slate-600">
              Weather cancellations can occur. Always check operator refund rules and schedule early departures.
            </p>
          </div>
        </section>

        <section className="mt-8 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-[0_18px_60px_rgba(15,23,42,0.08)] sm:p-8">
          <h2 className="text-xl font-black tracking-tight text-slate-955 sm:text-2xl">
            All-Aboard Sync Mappings
          </h2>
          <p className="mt-4 text-sm leading-7 text-slate-655">
            {config.problem}
          </p>
          <div className="mt-6 rounded-2xl border border-sky-100 bg-sky-50 px-5 py-4">
            <h3 className="text-xs font-black uppercase tracking-[0.16em] text-sky-700">
              Dispatcher Buffer Rule
            </h3>
            <p className="mt-2 text-sm leading-6 text-slate-700">
              {config.guidance}
            </p>
          </div>
        </section>

        {/* FAQs */}
        <section className="mt-8 rounded-[2rem] border border-slate-200 bg-white p-6 sm:p-8">
          <h2 className="text-xl font-black tracking-tight text-slate-950 sm:text-2xl">
            Excursion Frequently Asked Questions
          </h2>
          <div className="mt-6 divide-y divide-slate-100">
            {config.faqs.map((faq, i) => (
              <div key={i} className="py-4 first:pt-0 last:pb-0">
                <h3 className="text-sm font-black text-slate-900 sm:text-base">
                  {faq.question}
                </h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  {faq.answer}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Navigation Action Links */}
        <section className="mt-8 grid gap-4 sm:grid-cols-3">
          <Link
            href="/ports/juneau"
            className="rounded-2xl border border-slate-200 bg-white p-5 text-center shadow-sm hover:shadow transition block"
          >
            <span className="text-[10px] font-black uppercase tracking-wider text-sky-700 block">
              Destination Guide
            </span>
            <span className="mt-2 text-sm font-bold text-slate-900 block">
              Juneau Cruise Port Day Guide
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
