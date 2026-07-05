import Link from "next/link";
import { notFound } from "next/navigation";

const APPROVED_SLUGS = [
  "celebrity-edge",
  "royal-princess",
  "discovery-princess",
  "norwegian-bliss",
  "koningsdam",
];

type ShipConfig = {
  slug: string;
  name: string;
  line: string;
  timingRisk: string;
  disembarkNote: string;
  bookingStatus: string;
  ctaUrl: string;
  ports: {
    name: string;
    slug: string;
    note: string;
    hasGuide: boolean;
  }[];
  faqs: { question: string; answer: string }[];
};

const SHIP_CONFIGS: Record<string, ShipConfig> = {
  "celebrity-edge": {
    slug: "celebrity-edge",
    name: "Celebrity Edge",
    line: "Celebrity Cruises",
    timingRisk: "Standard risk. Wind and low ceilings can shift glacier landing times.",
    disembarkNote: "Docks downtown. 15-20 min walk-off. Sitka visits tender.",
    bookingStatus: "Active for Juneau helicopter flightseeing and dog sledding.",
    ctaUrl: "/ports/juneau?cruiseShip=Celebrity+Edge",
    ports: [
      { name: "Juneau", slug: "juneau", note: "Franklin Street docks. 15-min walk-off.", hasGuide: true },
      { name: "Skagway", slug: "skagway", note: "Railroad Dock. Long walk to town gate.", hasGuide: true },
      { name: "Ketchikan", slug: "ketchikan", note: "Downtown berths. Instant walk-off.", hasGuide: true },
      { name: "Sitka", slug: "sitka", note: "Tendering or Halibut Point shuttle.", hasGuide: true },
      { name: "Icy Strait Point", slug: "icy-strait-point", note: "Wilderness Landing gondola transit.", hasGuide: true },
      { name: "Haines", slug: "haines", note: "PC Dock. Very short walk to Fort Seward.", hasGuide: true },
    ],
    faqs: [
      {
        question: "Can I book independently from Celebrity?",
        answer: "Yes. Independent excursions are protected by our return buffers, smaller groups, and lower prices.",
      },
      {
        question: "How much return buffer should I leave for Celebrity Edge?",
        answer: "Leave at least 45 minutes between excursion return and the scheduled all-aboard time.",
      },
    ],
  },
  "royal-princess": {
    slug: "royal-princess",
    name: "Royal Princess",
    line: "Princess Cruises",
    timingRisk: "Standard risk. Morning weather delays are common for glacier flights.",
    disembarkNote: "Often docks at the AJ Dock in Juneau, requiring shuttle transit.",
    bookingStatus: "Active for Juneau helicopter landings and dog sledding camps.",
    ctaUrl: "/tours",
    ports: [
      { name: "Juneau", slug: "juneau", note: "AJ Dock. 5-min shuttle bus downtown.", hasGuide: true },
      { name: "Skagway", slug: "skagway", note: "Broadway or Ore docks. 5-10 min walk.", hasGuide: true },
      { name: "Ketchikan", slug: "ketchikan", note: "Downtown berths. Quick walk-off.", hasGuide: true },
      { name: "Sitka", slug: "sitka", note: "Halibut Point Marine. 10-min shuttle downtown.", hasGuide: true },
      { name: "Icy Strait Point", slug: "icy-strait-point", note: "Adventure Landing. Short walk to cannery.", hasGuide: true },
      { name: "Haines", slug: "haines", note: "Port Chilkoot Dock. Scenic walking path.", hasGuide: true },
    ],
    faqs: [
      {
        question: "Can I book independently from Princess?",
        answer: "Yes. Operators coordinate with Princess timings. Excursions automatically check timing fit.",
      },
      {
        question: "How much return buffer should I leave for Royal Princess?",
        answer: "Allow a minimum of 45 minutes return buffer before all-aboard.",
      },
    ],
  },
  "discovery-princess": {
    slug: "discovery-princess",
    name: "Discovery Princess",
    line: "Princess Cruises",
    timingRisk: "Moderate risk. Large passenger volumes can back up gangway lines.",
    disembarkNote: "Docks downtown in Ketchikan. AJ Dock shuttle queue in Juneau.",
    bookingStatus: "Active for Juneau helicopter tours and active glacier treks.",
    ctaUrl: "/ports/ketchikan?cruiseShip=Discovery+Princess",
    ports: [
      { name: "Juneau", slug: "juneau", note: "AJ Dock. 5-min shuttle bus downtown.", hasGuide: true },
      { name: "Skagway", slug: "skagway", note: "Ore Dock slides may require shuttles.", hasGuide: true },
      { name: "Ketchikan", slug: "ketchikan", note: "Downtown berths. Quick walk-off.", hasGuide: true },
      { name: "Sitka", slug: "sitka", note: "Tendering or Halibut Point shuttle.", hasGuide: true },
      { name: "Icy Strait Point", slug: "icy-strait-point", note: "Wilderness Landing gondola transit.", hasGuide: true },
      { name: "Haines", slug: "haines", note: "PC Dock. Very short walk to Fort Seward.", hasGuide: true },
    ],
    faqs: [
      {
        question: "Can I book independently from Princess Cruises?",
        answer: "Yes. Excursions check port windows and guarantee a safe return to the ship.",
      },
      {
        question: "How much return buffer should I leave for Discovery Princess?",
        answer: "We recommend at least 45 minutes return buffer before ship all-aboard.",
      },
    ],
  },
  "norwegian-bliss": {
    slug: "norwegian-bliss",
    name: "Norwegian Bliss",
    line: "Norwegian Cruise Line",
    timingRisk: "Higher in Ketchikan. Ward Cove shuttle queues can add disembarkation delay.",
    disembarkNote: "Docks 7 miles north of Ketchikan at Ward Cove. Free shuttle.",
    bookingStatus: "Active for Juneau helicopter landings and dog mushing.",
    ctaUrl: "/ports/juneau?cruiseShip=Norwegian+Bliss",
    ports: [
      { name: "Juneau", slug: "juneau", note: "Downtown piers. 15-20 min walk-off.", hasGuide: true },
      { name: "Skagway", slug: "skagway", note: "Railroad Dock. Long walk to town gate.", hasGuide: true },
      { name: "Ketchikan", slug: "ketchikan", note: "Ward Cove. 20-min shuttle ride downtown.", hasGuide: true },
      { name: "Sitka", slug: "sitka", note: "Halibut Point Marine. 10-min shuttle.", hasGuide: true },
      { name: "Icy Strait Point", slug: "icy-strait-point", note: "Wilderness Landing gondola transit.", hasGuide: true },
      { name: "Haines", slug: "haines", note: "Port Chilkoot Dock. Scenic walking path.", hasGuide: true },
    ],
    faqs: [
      {
        question: "Can I book independently from NCL?",
        answer: "Yes. Our guides help you calculate Ward Cove shuttle times for independent tours.",
      },
      {
        question: "How much return buffer should I leave for Norwegian Bliss?",
        answer: "Leave at least 45 minutes in Juneau, and 60-70 minutes in Ketchikan.",
      },
    ],
  },
  "koningsdam": {
    slug: "koningsdam",
    name: "Koningsdam",
    line: "Holland America Line",
    timingRisk: "Standard risk. Helicopter flights are weather-dependent.",
    disembarkNote: "Prime downtown berths in Juneau and Ketchikan. Rapid walk-off.",
    bookingStatus: "Active for Juneau glacier walks, flights, and dog mushing.",
    ctaUrl: "/ports/juneau?cruiseShip=Koningsdam",
    ports: [
      { name: "Juneau", slug: "juneau", note: "Franklin Street. Rapid walk-off.", hasGuide: true },
      { name: "Skagway", slug: "skagway", note: "Broadway or Ore docks. 5-10 min walk.", hasGuide: true },
      { name: "Ketchikan", slug: "ketchikan", note: "Downtown berths. Quick walk-off.", hasGuide: true },
      { name: "Sitka", slug: "sitka", note: "Halibut Point Marine. 10-min shuttle.", hasGuide: true },
      { name: "Icy Strait Point", slug: "icy-strait-point", note: "Adventure Landing. Short walk to cannery.", hasGuide: true },
      { name: "Haines", slug: "haines", note: "Port Chilkoot Dock. Scenic walking path.", hasGuide: true },
    ],
    faqs: [
      {
        question: "Can I book independently from Holland America?",
        answer: "Yes. HAL's downtown berths make independent tour transits extremely reliable.",
      },
      {
        question: "How much return buffer should I leave for Koningsdam?",
        answer: "Keep at least a 45-minute return buffer before ship all-aboard.",
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
  const config = SHIP_CONFIGS[slug];
  if (!config) return {};

  return {
    title: `${config.name} Shore Excursions | Cruise Day Timing Planners`,
    description: `Match Alaska excursions to ${config.name}'s schedule. Check disembarkation times, port layouts, and timing buffers.`,
    alternates: {
      canonical: `https://welcometoalaskatours.com/ships/${slug}`,
    },
  };
}

export default async function ShipSlugPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  if (!APPROVED_SLUGS.includes(slug)) {
    notFound();
  }

  const config = SHIP_CONFIGS[slug];

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
          <div className="inline-flex rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.22em] text-cyan-100">
            {config.line}
          </div>
          <h1 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">
            {config.name} Alaska Excursion Planner
          </h1>
          <p className="mt-2 text-sm text-white/80 max-w-3xl">
            Start with your port window, then choose excursions that leave enough return buffer.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href={config.ctaUrl}
              className="rounded-xl bg-cyan-500 px-4 py-2.5 text-xs font-bold text-slate-950 hover:bg-cyan-400 transition"
            >
              Check Juneau Timing
            </Link>
            <Link
              href="/tours"
              className="rounded-xl bg-white/10 border border-white/20 px-4 py-2.5 text-xs font-bold text-white hover:bg-white/20 transition"
            >
              Browse Live Tours
            </Link>
            <Link
              href="/ports"
              className="rounded-xl bg-white/10 border border-white/20 px-4 py-2.5 text-xs font-bold text-white hover:bg-white/20 transition"
            >
              View Port Guides
            </Link>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-5xl px-6 sm:px-8">
        
        {/* Timing Dashboard Panel */}
        <section className="mt-8 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xs font-black uppercase tracking-[0.16em] text-slate-500">
            Timing Dashboard
          </h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-4">
            <div className="rounded-2xl bg-slate-50 p-4 border border-slate-100">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 block">Arrival Time</span>
              <span className="mt-1 text-sm font-black text-slate-900 block">Confirm with ship</span>
              <span className="mt-2 inline-block rounded bg-amber-100 px-1.5 py-0.5 text-[9px] font-bold text-amber-800">Variable</span>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4 border border-slate-100">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 block">Disembark Buffer</span>
              <span className="mt-1 text-sm font-black text-slate-900 block">30–45 mins</span>
              <span className="mt-2 inline-block rounded bg-sky-100 px-1.5 py-0.5 text-[9px] font-bold text-sky-800">Standard</span>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4 border border-slate-100">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 block">Return Buffer</span>
              <span className="mt-1 text-sm font-black text-slate-900 block">45+ mins</span>
              <span className="mt-2 inline-block rounded bg-rose-100 px-1.5 py-0.5 text-[9px] font-bold text-rose-800">Critical</span>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4 border border-slate-100">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 block">All-Aboard Time</span>
              <span className="mt-1 text-sm font-black text-slate-900 block">Confirm onboard</span>
              <span className="mt-2 inline-block rounded bg-amber-100 px-1.5 py-0.5 text-[9px] font-bold text-amber-800">Variable</span>
            </div>
          </div>
        </section>

        {/* Visual Info Cards Grid */}
        <section className="mt-6 grid gap-5 sm:grid-cols-3">
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="text-xs font-black text-slate-500 uppercase tracking-wider">Timing Risk</h3>
            <p className="mt-2 text-xs leading-5 text-slate-700">{config.timingRisk}</p>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="text-xs font-black text-slate-500 uppercase tracking-wider">Disembarkation Notes</h3>
            <p className="mt-2 text-xs leading-5 text-slate-700">{config.disembarkNote}</p>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="text-xs font-black text-slate-500 uppercase tracking-wider">Live Booking Status</h3>
            <p className="mt-2 text-xs leading-5 text-slate-700">{config.bookingStatus}</p>
          </div>
        </section>

        {/* Port Grid */}
        <section className="mt-8 space-y-4">
          <div className="border-b border-slate-200 pb-2">
            <h2 className="text-lg font-black tracking-tight text-slate-950">
              Common Alaska Ports & Excursion Guides
            </h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {config.ports.map((port) => (
              <div key={port.slug} className="rounded-2xl border border-slate-200 bg-white p-5 space-y-3 shadow-sm hover:shadow transition">
                <div className="flex justify-between items-center">
                  <h3 className="font-bold text-slate-900">{port.name}</h3>
                  <span className="rounded bg-sky-50 px-1.5 py-0.5 text-[9px] font-bold text-sky-800">Active Port</span>
                </div>
                <p className="text-xs text-slate-600">{port.note}</p>
                <div className="flex flex-col gap-1.5 pt-2 border-t border-slate-100">
                  <Link
                    href={`/ports/${port.slug}`}
                    className="text-[11px] font-black uppercase text-sky-850 hover:text-sky-900"
                  >
                    Explore Port Guide →
                  </Link>
                  {port.hasGuide && (
                    <Link
                      href={`/guides/how-long-does-it-take-to-get-off-the-ship-in-${port.slug}`}
                      className="text-[11px] font-black uppercase text-slate-500 hover:text-slate-650"
                    >
                      Read Timing Guide →
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Honest Inventory Disclaimer Banner */}
        <section className="mt-6 rounded-[2rem] border border-amber-200 bg-amber-50/40 p-5">
          <p className="text-xs text-slate-700 font-medium text-center">
            We do not have every sailing loaded yet. Confirm your exact all-aboard time before booking.
          </p>
        </section>

        {/* FAQ Section (lower on page) */}
        <section className="mt-8 rounded-[2rem] border border-slate-200 bg-white p-6 sm:p-8">
          <h2 className="text-lg font-black tracking-tight text-slate-950">
            Frequently Asked Questions
          </h2>
          <div className="mt-4 divide-y divide-slate-100">
            {config.faqs.map((faq, i) => (
              <div key={i} className="py-3 first:pt-0 last:pb-0">
                <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                  {faq.question}
                </h3>
                <p className="mt-1 text-xs leading-5 text-slate-600">
                  {faq.answer}
                </p>
              </div>
            ))}
            <div className="py-3 last:pb-0">
              <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                What if my ship uses a shuttle or tender?
              </h3>
              <p className="mt-1 text-xs leading-5 text-slate-600">
                Tenders or shuttles (like NCL Ward Cove) require an extra 30–60 min buffer. Factor this in early.
              </p>
            </div>
            <div className="py-3 last:pb-0">
              <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                Are all ports live bookable here yet?
              </h3>
              <p className="mt-1 text-xs leading-5 text-slate-600">
                Juneau glacier and flightseeing tours are live active. Other ports are currently in planning mode.
              </p>
            </div>
          </div>
        </section>

      </div>
    </main>
  );
}
