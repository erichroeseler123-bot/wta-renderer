import Link from "next/link";
import { notFound } from "next/navigation";
import { getHelicopterTours } from "@/lib/helicopterTours";
import { sanitizeTours } from "@/lib/tourSeo";

const APPROVED_SLUGS = [
  "how-long-does-it-take-to-get-off-the-ship-in-juneau",
  "how-long-does-it-take-to-get-off-the-ship-in-skagway",
  "how-long-does-it-take-to-get-off-the-ship-in-ketchikan",
  "how-long-does-it-take-to-get-off-the-ship-in-sitka",
  "how-long-does-it-take-to-get-off-the-ship-in-icy-strait-point",
  "how-long-does-it-take-to-get-off-the-ship-in-haines",
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
  "how-long-does-it-take-to-get-off-the-ship-in-sitka": {
    slug: "how-long-does-it-take-to-get-off-the-ship-in-sitka",
    portSlug: "sitka",
    portName: "Sitka",
    title: "How Long to Get Off Cruise Ship in Sitka",
    metaTitle: "How Long Does It Take to Get Off the Cruise Ship in Sitka? | WTA",
    metaDescription: "Sitka cruise ship disembarkation timing, Halibut Point Marine shuttle guide, tendering details, and tour safety margins.",
    headline: "How Long Does It Take to Get Off the Cruise Ship in Sitka?",
    intro: "Sitka offers a unique, wild cruise stop, but its disembarkation logistics involve a 5-mile shuttle transit or occasional tendering that passengers must plan around.",
    quickAnswer: "Expect 30 to 45 minutes. The cruise dock is 5 miles outside town, requiring a 10-15 minute shuttle ride. If your ship tenders, allow 45 to 60 minutes.",
    dockingDetails: "Most ships dock at the Halibut Point Marine Terminal. A free shuttle bus transports guests to Harrigan Centennial Hall downtown. If the dock is full, ships anchor in the bay and tender guests to Centennial Hall via boat.",
    gangwayTime: "Gangways open 20 minutes after arrival. For docking, shuttle bus loading starts immediately. For tendering, elite loyalty members and ship-booked tours get tender priority, causing delays for independent guests.",
    transitToTours: "Almost all independent whale-watching and marine wildlife tours depart from the Crescent Harbor or downtown docks near Centennial Hall, where the shuttle drops you off.",
    timingRule: "Allow at least a 60-minute buffer from ship arrival before your tour departs. If your ship tenders, make it 75 minutes.",
    faqs: [
      {
        question: "Is Sitka a tender port?",
        answer: "Usually no, as most ships dock at Halibut Point. However, if more than two ships are in port, additional ships will anchor and tender.",
      },
      {
        question: "How much does the Sitka shuttle cost?",
        answer: "The shuttle bus from Halibut Point Marine Terminal to Centennial Hall downtown is completely free and runs continuously.",
      },
    ],
  },
  "how-long-does-it-take-to-get-off-the-ship-in-icy-strait-point": {
    slug: "how-long-does-it-take-to-get-off-the-ship-in-icy-strait-point",
    portSlug: "icy-strait-point",
    portName: "Icy Strait Point",
    title: "How Long to Get Off Cruise Ship in Icy Strait Point",
    metaTitle: "How Long Does It Take to Get Off the Cruise Ship in Icy Strait Point? | WTA",
    metaDescription: "Icy Strait Point disembarkation timings, Wilderness Landing vs Adventure Landing, gondola transfers, and timing guides.",
    headline: "How Long Does It Take to Get Off the Cruise Ship in Icy Strait Point?",
    intro: "Icy Strait Point is a private, native-owned cruise destination in Hoonah. It is highly streamlined for cruise traffic, but its double-dock layout requires a quick transit check.",
    quickAnswer: "Generally 15 to 25 minutes. Walking off either pier is quick, but transferring between the two terminals requires a ride on the Trans-Porter gondola.",
    dockingDetails: "The port has two piers: Adventure Landing (near the old cannery) and Wilderness Landing. Wilderness Landing requires riding a free, high-speed gondola (the Trans-Porter) to reach the main cannery area where most tours check in.",
    gangwayTime: "Piers are purpose-built for modern ships, enabling fast gangway clearance within 15 minutes of port authority approval.",
    transitToTours: "Excursions depart from either the Wilderness Departure Center or the Adventure Center. Check your tour ticket to see which terminal zone your operator uses.",
    timingRule: "A 30-minute buffer is usually sufficient to exit the ship and walk to the tour centers. Add 15 minutes if you need to ride the Trans-Porter gondola.",
    faqs: [
      {
        question: "Is Icy Strait Point a tender port?",
        answer: "No, all ships dock at one of the two modern deep-water piers.",
      },
      {
        question: "How long is the gondola ride between terminals?",
        answer: "The Trans-Porter gondola ride takes only 3 minutes, but queue lines can form if multiple large ships are in port.",
      },
    ],
  },
  "how-long-does-it-take-to-get-off-the-ship-in-haines": {
    slug: "how-long-does-it-take-to-get-off-the-ship-in-haines",
    portSlug: "haines",
    portName: "Haines",
    title: "How Long to Get Off Cruise Ship in Haines",
    metaTitle: "How Long Does It Take to Get Off the Cruise Ship in Haines? | WTA",
    metaDescription: "Haines disembarkation guide, PC dock walking paths, tendering details, and tour check-in timing.",
    headline: "How Long Does It Take to Get Off the Cruise Ship in Haines?",
    intro: "Haines is a quiet, authentic Alaska town. Docks are located close to downtown, making Haines one of the easiest ports for disembarkation.",
    quickAnswer: "15 to 20 minutes. Walking from the ship to the town center takes less than 10 minutes along a flat, scenic path.",
    dockingDetails: "Ships dock at the Port Chilkoot Dock (PC Dock), situated right at Fort William H. Seward. Occasional large ships anchor and tender to the same pier.",
    gangwayTime: "Very rapid gangway setup. The lack of port congestion means you can walk off with almost no queues.",
    transitToTours: "Most local rafting and wildlife tours meet directly at the end of the PC Dock or pick up from the Port Chilkoot Parade Grounds.",
    timingRule: "A 30-minute buffer is highly safe for Haines independent tours, as walk times are negligible.",
    faqs: [
      {
        question: "Is Haines a tender port?",
        answer: "Typically no, ships dock at the PC Dock. Tendering is only used as a backup when the pier is occupied by another vessel.",
      },
      {
        question: "Can I walk to Fort Seward from the ship?",
        answer: "Yes, Fort Seward is directly adjacent to the PC Dock. You will walk right through it on your way into Haines.",
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
      <section className="relative bg-slate-900 text-white py-16 px-6 sm:px-8">
        <div className="mx-auto max-w-5xl">
          <div className="inline-flex rounded-full border border-white/15 bg-white/10 px-4 py-2 text-[11px] font-black uppercase tracking-[0.22em] text-cyan-100">
            Port Timing Guide
          </div>
          <h1 className="mt-4 text-4xl font-black tracking-tight sm:text-5xl">
            {config.headline}
          </h1>
          <p className="mt-4 text-sm leading-7 text-white/80 sm:text-[15px] max-w-3xl">
            {config.intro}
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

        {/* Safety rule card */}
        <section className="mt-8 rounded-[2rem] border border-rose-200 bg-rose-50/50 p-6 sm:p-8">
          <h2 className="text-sm font-black uppercase tracking-wider text-rose-800">
            Critical Safety Rule
          </h2>
          <p className="mt-3 text-base font-bold text-slate-950">
            {config.timingRule}
          </p>
          <p className="mt-2 text-xs text-slate-600">
            Always schedule a buffer to account for gangway line backups, customs clearance holds, or shuttle transit delays. WTA's timing engine enforces a mandatory 45-minute return buffer on all checkouts.
          </p>
        </section>

        {/* Live Tour Offerings or Honest Fallback */}
        <section className="mt-8 space-y-6">
          <div className="border-b border-slate-200 pb-3 flex justify-between items-center">
            <h2 className="text-xl font-black tracking-tight text-slate-950 sm:text-2xl">
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
                Live inventory for this port is still being expanded. Use this guide to understand timing, disembarkation, and to configure your port-day fit.
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
