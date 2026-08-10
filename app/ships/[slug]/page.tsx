import Link from "next/link";
import { notFound } from "next/navigation";
import JsonLd from "@/components/seo/JsonLd";
import Breadcrumbs from "@/app/components/seo/Breadcrumbs";

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
    timingRisk: "Flight and glacier excursions can be affected by wind, visibility, and changing weather.",
    disembarkNote: "Dock assignment and walk-off timing can vary by sailing. Confirm the current port information onboard before your excursion day.",
    bookingStatus: "Connected Alaska excursion inventory is available across Juneau, Skagway, and Ketchikan.",
    ctaUrl: "/ports/juneau?cruiseShip=Celebrity+Edge",
    ports: [
      { name: "Juneau", slug: "juneau", note: "Confirm your assigned Juneau berth and walk-off timing for this sailing.", hasGuide: true },
      { name: "Skagway", slug: "skagway", note: "Confirm your assigned Skagway berth and any local shuttle instructions onboard.", hasGuide: true },
      { name: "Ketchikan", slug: "ketchikan", note: "Confirm your Ketchikan berth and local transportation details for this sailing.", hasGuide: true },
    ],
    faqs: [
      {
        question: "Can I book independently from Celebrity?",
        answer: "Yes. Independent excursions are available. Compare the operator's meeting instructions, duration, live departure time, and your ship's current all-aboard time before booking.",
      },
      {
        question: "How much return buffer should I leave for Celebrity Edge?",
        answer: "Build a conservative return buffer rather than relying on a fixed number. Your exact berth, all-aboard time, transportation, weather, and operator instructions all matter.",
      },
    ],
  },
  "royal-princess": {
    slug: "royal-princess",
    name: "Royal Princess",
    line: "Princess Cruises",
    timingRisk: "Flight and glacier excursions can be affected by weather, while walk-off timing can vary with passenger flow.",
    disembarkNote: "Berth assignments and shuttle needs can vary by sailing. Confirm the current port information onboard.",
    bookingStatus: "Connected Alaska excursion inventory is available across Juneau, Skagway, and Ketchikan.",
    ctaUrl: "/ports/juneau?cruiseShip=Royal+Princess",
    ports: [
      { name: "Juneau", slug: "juneau", note: "Confirm your assigned Juneau berth and any shuttle instructions for this sailing.", hasGuide: true },
      { name: "Skagway", slug: "skagway", note: "Confirm your Skagway berth and walking or shuttle instructions onboard.", hasGuide: true },
      { name: "Ketchikan", slug: "ketchikan", note: "Confirm your Ketchikan berth and local transportation details for this sailing.", hasGuide: true },
    ],
    faqs: [
      {
        question: "Can I book independently from Princess?",
        answer: "Yes. Use the live tour calendar together with your ship's current port schedule, meeting details, and all-aboard time to decide whether a departure fits.",
      },
      {
        question: "How much return buffer should I leave for Royal Princess?",
        answer: "Leave a conservative buffer based on your actual all-aboard time, berth, transportation needs, excursion duration, and operator instructions.",
      },
    ],
  },
  "discovery-princess": {
    slug: "discovery-princess",
    name: "Discovery Princess",
    line: "Princess Cruises",
    timingRisk: "Large passenger volumes, local transportation, and weather can all affect the usable excursion window.",
    disembarkNote: "Dock assignment, shuttle needs, and walk-off timing can vary by sailing. Confirm the current details onboard.",
    bookingStatus: "Connected Alaska excursion inventory is available across Juneau, Skagway, and Ketchikan.",
    ctaUrl: "/ports/ketchikan?cruiseShip=Discovery+Princess",
    ports: [
      { name: "Juneau", slug: "juneau", note: "Confirm your assigned Juneau berth and any shuttle instructions for this sailing.", hasGuide: true },
      { name: "Skagway", slug: "skagway", note: "Confirm your Skagway berth and any local access instructions onboard.", hasGuide: true },
      { name: "Ketchikan", slug: "ketchikan", note: "Confirm your Ketchikan berth and local transportation details for this sailing.", hasGuide: true },
    ],
    faqs: [
      {
        question: "Can I book independently from Princess Cruises?",
        answer: "Yes. Compare the live departure time and operator instructions with your ship's current arrival and all-aboard information before booking.",
      },
      {
        question: "How much return buffer should I leave for Discovery Princess?",
        answer: "Use a conservative return buffer based on the actual sailing, berth, transportation time, excursion duration, and operator instructions.",
      },
    ],
  },
  "norwegian-bliss": {
    slug: "norwegian-bliss",
    name: "Norwegian Bliss",
    line: "Norwegian Cruise Line",
    timingRisk: "Local shuttle or transportation requirements can reduce the usable port-day window, especially when a ship is not berthed in the downtown core.",
    disembarkNote: "Confirm the current berth, shuttle arrangement, and all-aboard instructions onboard for each port call.",
    bookingStatus: "Connected Alaska excursion inventory is available across Juneau, Skagway, and Ketchikan.",
    ctaUrl: "/ports/juneau?cruiseShip=Norwegian+Bliss",
    ports: [
      { name: "Juneau", slug: "juneau", note: "Confirm your assigned Juneau berth and walk-off timing for this sailing.", hasGuide: true },
      { name: "Skagway", slug: "skagway", note: "Confirm your Skagway berth and any local access instructions onboard.", hasGuide: true },
      { name: "Ketchikan", slug: "ketchikan", note: "Confirm your berth and any required shuttle or transportation time before choosing an excursion.", hasGuide: true },
    ],
    faqs: [
      {
        question: "Can I book independently from NCL?",
        answer: "Yes. Check your current berth and shuttle information, then compare that travel time with the excursion meeting point, departure, duration, and all-aboard time.",
      },
      {
        question: "How much return buffer should I leave for Norwegian Bliss?",
        answer: "Build extra margin when a shuttle or transfer is required. Use the current sailing's berth and all-aboard information rather than a fixed universal buffer.",
      },
    ],
  },
  "koningsdam": {
    slug: "koningsdam",
    name: "Koningsdam",
    line: "Holland America Line",
    timingRisk: "Weather can affect flight and glacier products, while berth and passenger-flow conditions can affect the usable excursion window.",
    disembarkNote: "Berth assignments and walk-off timing can vary by sailing. Confirm the current details onboard before your port day.",
    bookingStatus: "Connected Alaska excursion inventory is available across Juneau, Skagway, and Ketchikan.",
    ctaUrl: "/ports/juneau?cruiseShip=Koningsdam",
    ports: [
      { name: "Juneau", slug: "juneau", note: "Confirm your assigned Juneau berth and walk-off timing for this sailing.", hasGuide: true },
      { name: "Skagway", slug: "skagway", note: "Confirm your Skagway berth and any local access instructions onboard.", hasGuide: true },
      { name: "Ketchikan", slug: "ketchikan", note: "Confirm your Ketchikan berth and local transportation details for this sailing.", hasGuide: true },
    ],
    faqs: [
      {
        question: "Can I book independently from Holland America?",
        answer: "Yes. Compare the live tour departure and meeting information with the ship's current port schedule and all-aboard time before booking.",
      },
      {
        question: "How much return buffer should I leave for Koningsdam?",
        answer: "Use a conservative return buffer based on your actual sailing details, excursion duration, transportation needs, weather, and operator instructions.",
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
    title: `${config.name} Alaska Shore Excursions | Welcome To Alaska Tours`,
    description: `Plan independent Alaska shore excursions for ${config.name}. Compare Juneau, Skagway, and Ketchikan tours and check live operator calendars against your current ship schedule.`,
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
  const pageUrl = `https://welcometoalaskatours.com/ships/${slug}`;

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: config.faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://welcometoalaskatours.com/" },
      { "@type": "ListItem", position: 2, name: "Ships", item: "https://welcometoalaskatours.com/ships" },
      { "@type": "ListItem", position: 3, name: config.name, item: pageUrl },
    ],
  };

  const webPageSchema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: `${config.name} Alaska Shore Excursion Planner`,
    url: pageUrl,
    description: `Independent Alaska shore excursion planning for ${config.name}, with links to connected Juneau, Skagway, and Ketchikan tour inventory.`,
    isPartOf: { "@type": "WebSite", name: "Welcome To Alaska Tours", url: "https://welcometoalaskatours.com" },
  };

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 pb-20">
      <JsonLd data={faqSchema} />
      <JsonLd data={breadcrumbSchema} />
      <JsonLd data={webPageSchema} />

      <section className="relative bg-slate-900 text-white py-12 px-6 sm:px-8">
        <div className="mx-auto max-w-5xl">
          <div className="mb-5 text-white/80">
            <Breadcrumbs items={[{ href: "/", label: "Home" }, { href: "/ships", label: "Ships" }, { label: config.name }]} />
          </div>
          <div className="inline-flex rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.22em] text-cyan-200">
            {config.line}
          </div>
          <h1 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">
            {config.name} Alaska Excursion Planner
          </h1>
          <p className="mt-2 text-sm text-white/80 max-w-2xl">
            Compare connected Alaska excursions by port, then check the live operator calendar against your ship's current arrival, berth, meeting instructions, and all-aboard time.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href={config.ctaUrl} className="rounded-xl bg-cyan-500 px-4 py-2.5 text-xs font-bold text-slate-950 hover:bg-cyan-400 transition">
              Start with a Port
            </Link>
            <Link href="/tours" className="rounded-xl bg-white/10 border border-white/20 px-4 py-2.5 text-xs font-bold text-white hover:bg-white/20 transition">
              Browse Live Tours
            </Link>
            <Link href="/ports" className="rounded-xl bg-white/10 border border-white/20 px-4 py-2.5 text-xs font-bold text-white hover:bg-white/20 transition">
              View Port Guides
            </Link>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-5xl px-6 sm:px-8">
        <section className="mt-8 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xs font-black uppercase tracking-[0.16em] text-slate-500">Timing Checklist</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-4">
            <div className="rounded-2xl bg-slate-50 p-4 border border-slate-100"><span className="text-[10px] font-black uppercase tracking-wider text-slate-500 block">Arrival</span><span className="mt-1 text-sm font-black text-slate-900 block">Confirm onboard</span><span className="mt-2 inline-block rounded bg-amber-100 px-1.5 py-0.5 text-[9px] font-bold text-amber-800">Sailing-specific</span></div>
            <div className="rounded-2xl bg-slate-50 p-4 border border-slate-100"><span className="text-[10px] font-black uppercase tracking-wider text-slate-500 block">Berth / Shuttle</span><span className="mt-1 text-sm font-black text-slate-900 block">Confirm locally</span><span className="mt-2 inline-block rounded bg-sky-100 px-1.5 py-0.5 text-[9px] font-bold text-sky-800">Allow transit</span></div>
            <div className="rounded-2xl bg-slate-50 p-4 border border-slate-100"><span className="text-[10px] font-black uppercase tracking-wider text-slate-500 block">Tour Return</span><span className="mt-1 text-sm font-black text-slate-900 block">Leave margin</span><span className="mt-2 inline-block rounded bg-rose-100 px-1.5 py-0.5 text-[9px] font-bold text-rose-800">Do not cut close</span></div>
            <div className="rounded-2xl bg-slate-50 p-4 border border-slate-100"><span className="text-[10px] font-black uppercase tracking-wider text-slate-500 block">All-Aboard</span><span className="mt-1 text-sm font-black text-slate-900 block">Confirm onboard</span><span className="mt-2 inline-block rounded bg-amber-100 px-1.5 py-0.5 text-[9px] font-bold text-amber-800">Authoritative</span></div>
          </div>
        </section>

        <section className="mt-6 grid gap-5 sm:grid-cols-3">
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><h3 className="text-xs font-black text-slate-500 uppercase tracking-wider">Timing Considerations</h3><p className="mt-2 text-xs leading-5 text-slate-700">{config.timingRisk}</p></div>
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><h3 className="text-xs font-black text-slate-500 uppercase tracking-wider">Disembarkation</h3><p className="mt-2 text-xs leading-5 text-slate-700">{config.disembarkNote}</p></div>
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><h3 className="text-xs font-black text-slate-500 uppercase tracking-wider">Booking Coverage</h3><p className="mt-2 text-xs leading-5 text-slate-700">{config.bookingStatus}</p></div>
        </section>

        <section className="mt-8 space-y-4">
          <div className="border-b border-slate-200 pb-2"><h2 className="text-lg font-black tracking-tight text-slate-950">Shop Excursions by Alaska Port</h2><p className="mt-1 text-xs text-slate-500">Use your ship page as the starting point, then compare the live inventory available in each port.</p></div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {config.ports.map((port) => (
              <div key={port.slug} className="rounded-2xl border border-slate-200 bg-white p-5 space-y-3 shadow-sm hover:shadow transition">
                <div className="flex justify-between items-center"><h3 className="font-bold text-slate-900">{port.name}</h3><span className="rounded bg-emerald-50 px-1.5 py-0.5 text-[9px] font-bold text-emerald-800">Connected tours</span></div>
                <p className="text-xs text-slate-600">{port.note}</p>
                <div className="flex flex-col gap-1.5 pt-2 border-t border-slate-100">
                  <Link href={`/ports/${port.slug}?cruiseShip=${encodeURIComponent(config.name)}`} className="text-[11px] font-black uppercase text-sky-800 hover:text-sky-900">Shop {port.name} excursions →</Link>
                  {port.hasGuide && <Link href={`/guides/how-long-does-it-take-to-get-off-the-ship-in-${port.slug}`} className="text-[11px] font-black uppercase text-slate-500 hover:text-slate-700">Read timing guide →</Link>}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-6 rounded-[2rem] border border-amber-200 bg-amber-50/40 p-5">
          <p className="text-xs text-slate-700 font-medium text-center">Ship schedules, berth assignments, weather, transportation and operator times can change. Always confirm your current all-aboard time and meeting instructions before booking and again on the day of the excursion.</p>
        </section>

        <section className="mt-8 rounded-[2rem] border border-slate-200 bg-white p-6 sm:p-8">
          <h2 className="text-lg font-black tracking-tight text-slate-950">Frequently Asked Questions</h2>
          <div className="mt-4 divide-y divide-slate-100">
            {config.faqs.map((faq, i) => <div key={i} className="py-3 first:pt-0 last:pb-0"><h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">{faq.question}</h3><p className="mt-1 text-xs leading-5 text-slate-600">{faq.answer}</p></div>)}
            <div className="py-3"><h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">What if my ship uses a shuttle or tender?</h3><p className="mt-1 text-xs leading-5 text-slate-600">Treat shuttle, tender, walking and local transfer time as part of the excursion window. Confirm the current arrangement for your sailing and leave additional margin rather than assuming a fixed transfer time.</p></div>
            <div className="py-3 last:pb-0"><h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">Are Juneau, Skagway, and Ketchikan bookable here?</h3><p className="mt-1 text-xs leading-5 text-slate-600">Yes. The site connects to excursion inventory across all three ports. Open a tour's calendar to confirm whether the operator has live departures for your specific date.</p></div>
          </div>
        </section>
      </div>
    </main>
  );
}
