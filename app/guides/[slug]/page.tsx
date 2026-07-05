import Link from "next/link";
import { notFound } from "next/navigation";
import { getHelicopterTours } from "@/lib/helicopterTours";
import { sanitizeTours } from "@/lib/tourSeo";

const APPROVED_SLUGS = [
  "how-long-does-it-take-to-get-off-the-ship-in-juneau",
  "how-long-does-it-take-to-get-off-the-ship-in-skagway",
  "how-long-does-it-take-to-get-off-the-ship-in-ketchikan",
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

type GuideConfig = {
  slug: string;
  portSlug: string;
  portName: string;
  title: string;
  metaTitle: string;
  metaDescription: string;
  headline: string;
  intro: string;
  quickAnswer: string;
  dockingDetails: string;
  gangwayTime: string;
  transitToTours: string;
  timingRule: string;
  faqs: { question: string; answer: string }[];
};

const GUIDE_CONFIGS: Record<string, GuideConfig> = {
  "how-long-does-it-take-to-get-off-the-ship-in-juneau": {
    slug: "how-long-does-it-take-to-get-off-the-ship-in-juneau",
    portSlug: "juneau",
    portName: "Juneau",
    title: "How Long to Get Off Cruise Ship in Juneau",
    metaTitle: "How Long Does It Take to Get Off the Cruise Ship in Juneau? | WTA",
    metaDescription: "Juneau cruise ship disembarkation times, AJ dock vs Franklin Street transit guide, gangway procedures, and excursion safety buffers.",
    headline: "How Long Does It Take to Get Off the Cruise Ship in Juneau?",
    intro: "Juneau is the busiest cruise port in Alaska, often hosting up to five massive ships simultaneously. Knowing how long it takes to clear the gangway is the difference between making your helicopter departure and standing on the dock alone.",
    quickAnswer: "Expect 15 to 30 minutes to get off the ship if docked downtown (Franklin Street/Steamship Dock), and 35 to 45 minutes if docked at the AJ Dock due to shuttle transfer queues.",
    dockingDetails: "Most ships dock at Franklin Street, Steamship Dock, or Cruise Ship Terminal (all walk-to-town). However, ships at the AJ Dock (South Franklin) require a mandatory 5-minute shuttle bus downtown. Shuttle lines can back up during morning arrival rushes.",
    gangwayTime: "Gangways open approximately 15-20 minutes after the ship is cleared by local port authorities. Suitcases and organized tours are not a factor for port-of-call days, but passengers on independent excursions must queue early.",
    transitToTours: "Most independent tour operators (including all major glacier helicopter and dog sledding companies) pick up at the Mt. Roberts Tramway parking lot, which is a 5-15 minute walk from the downtown docks, or a shuttle ride from the AJ Dock.",
    timingRule: "Do not schedule any excursion that departs less than 45 minutes after your ship's scheduled arrival time. If you dock at 8:00 AM, select a departure no earlier than 8:45 AM.",
    faqs: [
      {
        question: "Is Juneau a tender port?",
        answer: "No, Juneau is a docked port. All cruise ships dock directly at the piers, meaning you will walk off via a gangway instead of boarding tender boats.",
      },
      {
        question: "How long is the AJ Dock shuttle?",
        answer: "The shuttle ride takes about 5 minutes to reach the Mt. Roberts Tramway parking lot. However, queue lines at the AJ Dock can add 15-20 minutes of wait time during peak hours.",
      },
    ],
  },
  "how-long-does-it-take-to-get-off-the-ship-in-skagway": {
    slug: "how-long-does-it-take-to-get-off-the-ship-in-skagway",
    portSlug: "skagway",
    portName: "Skagway",
    title: "How Long to Get Off Cruise Ship in Skagway",
    metaTitle: "How Long Does It Take to Get Off the Cruise Ship in Skagway? | WTA",
    metaDescription: "Skagway disembarkation timing, Ore and Railroad dock walking distances, train transfers, and timing buffers.",
    headline: "How Long Does It Take to Get Off the Cruise Ship in Skagway?",
    intro: "Skagway's historical downtown is a short distance from the docks, but the town's linear harbor layout and sheer length of the piers mean disembarkation transit times can vary.",
    quickAnswer: "Generally 15 to 25 minutes. If your ship is docked at the far end of the Railroad Dock or requires shuttle transfers due to slides near the Ore Dock, allocate 35 minutes.",
    dockingDetails: "Skagway features three primary docks: Broadway Dock (nearest to town), Ore Dock, and the long Railroad Dock. Railroad Dock is extremely long; walking from the aft of a large ship to the dock gate can take 10-15 minutes of walking alone.",
    gangwayTime: "Gangways open quickly, but line congestion peaks in the first 45 minutes after arrival, particularly for morning train departures.",
    transitToTours: "The White Pass & Yukon Route railway picks up passengers directly on the Railroad and Ore docks for select bookings. Other tours meet at the dock gate or require walking into the historic town center (a 10-minute walk).",
    timingRule: "We recommend a 45-minute buffer after arrival before booking independent excursions. For the White Pass railway, check if your tour boards directly on your pier.",
    faqs: [
      {
        question: "Can I walk into town from the Skagway cruise docks?",
        answer: "Yes. Broadway Dock is directly in town. Ore Dock and Railroad Dock are walk-to-town, but a local shuttle is available for a small fee if you prefer not to walk the length of the docks.",
      },
      {
        question: "What is the rockslide shuttle in Skagway?",
        answer: "Due to localized mountain slide activity near the Ore Dock, the port occasionally enforces a mandatory shuttle bus for safety along certain pier segments. This can add 10-15 minutes of queuing.",
      },
    ],
  },
  "how-long-does-it-take-to-get-off-the-ship-in-ketchikan": {
    slug: "how-long-does-it-take-to-get-off-the-ship-in-ketchikan",
    portSlug: "ketchikan",
    portName: "Ketchikan",
    title: "How Long to Get Off Cruise Ship in Ketchikan",
    metaTitle: "How Long Does It Take to Get Off the Cruise Ship in Ketchikan? | WTA",
    metaDescription: "Ketchikan port timings, downtown docks 1-4 vs Ward Cove disembarkation guides, shuttle lines, and tour buffers.",
    headline: "How Long Does It Take to Get Off the Cruise Ship in Ketchikan?",
    intro: "Ketchikan's disembarkation experience depends entirely on whether your ship docks at the historic downtown piers or the remote Ward Cove terminal.",
    quickAnswer: "15 to 20 minutes if docked at downtown berths (Berths 1-4). Allocate 45 to 60 minutes if docked at Ward Cove due to the required 7-mile shuttle ride downtown.",
    dockingDetails: "Berths 1, 2, 3, and 4 are right on the downtown promenade. Ward Cove (primarily used by Norwegian Cruise Line and Regent) is 7 miles north. Passengers docking at Ward Cove must board a complimentary shuttle bus to reach downtown Ketchikan.",
    gangwayTime: "Downtown gangways open immediately. Ward Cove gangways open fast, but boarding the shuttle bus fleet can involve substantial queuing during peak hours.",
    transitToTours: "Downtown tours depart directly from the berths or the Liquid Sunshine Gauge indicator. Ward Cove tours either depart from the Ward Cove terminal itself or require riding the shuttle downtown.",
    timingRule: "For downtown berths, a 30-minute buffer is safe. For Ward Cove, allow a minimum of 60-70 minutes of transit margin before any downtown tour departure.",
    faqs: [
      {
        question: "How far is Ward Cove from downtown Ketchikan?",
        answer: "Ward Cove is approximately 7 miles north of downtown. The shuttle ride takes 20 minutes each way, but you must factor in shuttle wait times.",
      },
      {
        question: "Is there anything to do at the Ward Cove dock?",
        answer: "Ward Cove features a large indoor terminal with retail, history displays, and restrooms, but the primary sights and tour connections are in downtown Ketchikan.",
      },
    ],
  },
};

export async function generateStaticParams() {
  return APPROVED_SLUGS.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const config = GUIDE_CONFIGS[slug];
  if (!config) return {};

  return {
    title: config.metaTitle,
    description: config.metaDescription,
    alternates: {
      canonical: `https://welcometoalaskatours.com/guides/${slug}`,
    },
  };
}

export default async function GuideSlugPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  if (!APPROVED_SLUGS.includes(slug)) {
    notFound();
  }

  const config = GUIDE_CONFIGS[slug];

  // Load tours for timing suggestions
  let portTours: TourType[] = [];
  let hasLiveTours = false;
  try {
    const rawTours = await getHelicopterTours();
    const sanitized = sanitizeTours(rawTours) as TourType[];
    portTours = sanitized.filter((t) => t.port === config.portSlug);
    hasLiveTours = portTours.length > 0;
  } catch (e) {
    console.error("Failed to load guide port tours", e);
  }

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
            Disembarkation Guide
          </div>
          <h1 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">
            {config.headline}
          </h1>
          <p className="mt-2 text-sm text-white/80 max-w-2xl">
            Direct gangway disembarkation guidelines. Scored transit steps for independent excursion bookings. Enforcing return safety windows.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-5xl px-6 sm:px-8">
        {/* Quick Answer Panel */}
        <section className="mt-8 rounded-[2rem] border border-sky-100 bg-sky-50/50 p-6 sm:p-8">
          <h2 className="text-xs font-black uppercase tracking-[0.16em] text-sky-800">
            Quick Answer
          </h2>
          <p className="mt-3 text-lg font-bold text-slate-955">
            {config.quickAnswer}
          </p>
          {config.portSlug === "juneau" && (
            <p className="mt-3 text-xs text-slate-600">
              Common ships visiting Juneau include the <Link href="/ships/celebrity-edge" className="font-bold underline">Celebrity Edge</Link>, <Link href="/ships/norwegian-bliss" className="font-bold underline">Norwegian Bliss</Link>, and <Link href="/ships/koningsdam" className="font-bold underline">Koningsdam</Link>.
            </p>
          )}
          {config.portSlug === "skagway" && (
            <p className="mt-3 text-xs text-slate-600">
              Common ships visiting Skagway include the <Link href="/ships/celebrity-edge" className="font-bold underline">Celebrity Edge</Link>, <Link href="/ships/norwegian-bliss" className="font-bold underline">Norwegian Bliss</Link>, and <Link href="/ships/koningsdam" className="font-bold underline">Koningsdam</Link>.
            </p>
          )}
          {config.portSlug === "ketchikan" && (
            <p className="mt-3 text-xs text-slate-600">
              Common ships visiting Ketchikan include the <Link href="/ships/norwegian-bliss" className="font-bold underline">Norwegian Bliss</Link> (docked at Ward Cove) and <Link href="/ships/discovery-princess" className="font-bold underline">Discovery Princess</Link>.
            </p>
          )}
        </section>

        {/* Detailed Timings */}
        <section className="mt-8 grid gap-6 md:grid-cols-3">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">
              1. Docking & Tendering
            </h3>
            <p className="mt-3 text-xs leading-5 text-slate-600">
              {config.dockingDetails}
            </p>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">
              2. Gangway Procedure
            </h3>
            <p className="mt-3 text-xs leading-5 text-slate-600">
              {config.gangwayTime}
            </p>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">
              3. Transit to Operators
            </h3>
            <p className="mt-3 text-xs leading-5 text-slate-600">
              {config.transitToTours}
            </p>
          </div>
        </section>

        {/* Live Tour Offerings or Honest Fallback */}
        <section className="mt-8 space-y-6">
          <div className="border-b border-slate-200 pb-3 flex justify-between items-center">
            <h2 className="text-xl font-black tracking-tight text-slate-955 sm:text-2xl">
              Excursions in {config.portName}
            </h2>
            {hasLiveTours && (
              <span className="rounded bg-sky-100 px-2 py-1 text-[10px] font-black uppercase tracking-wider text-sky-800">
                Live Availability
              </span>
            )}
          </div>

          {hasLiveTours ? (
            <div className="grid gap-6 md:grid-cols-2">
              {portTours.map((tour) => (
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
                        {tour.category || "Juneau Excursion"}
                      </span>
                      <h3 className="text-lg font-black tracking-tight text-slate-900">
                        {tour.title}
                      </h3>
                      <p className="text-xs text-slate-600 line-clamp-3">
                        {tour.description}
                      </p>
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
                Live excursions list for this port is currently being verified. Configure your ship timing below to calculate compatible safety buffers.
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

        {/* Safety rule card */}
        <section className="mt-8 rounded-[2rem] border border-rose-200 bg-rose-50/50 p-6 sm:p-8">
          <h2 className="text-sm font-black uppercase tracking-wider text-rose-800">
            Critical Safety Rule
          </h2>
          <p className="mt-3 text-base font-bold text-slate-955">
            {config.timingRule}
          </p>
          <p className="mt-2 text-xs text-slate-600">
            Always schedule a buffer to account for gangway line backups, customs clearance holds, or shuttle transit delays. WTA's timing engine enforces a mandatory 45-minute return buffer on all checkouts.
          </p>
        </section>

        {/* FAQs */}
        <section className="mt-8 rounded-[2rem] border border-slate-200 bg-white p-6 sm:p-8">
          <h2 className="text-xl font-black tracking-tight text-slate-950 sm:text-2xl">
            Frequently Asked Questions
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
            href={`/ports/${config.portSlug}`}
            className="rounded-2xl border border-slate-200 bg-white p-5 text-center shadow-sm hover:shadow transition block"
          >
            <span className="text-[10px] font-black uppercase tracking-wider text-sky-700 block">
              Destination Guide
            </span>
            <span className="mt-2 text-sm font-bold text-slate-900 block">
              {config.portName} Port Guide
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
