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
    metaDescription: "Planning guidance for Juneau cruise-ship disembarkation, downtown docks, AJ Dock transfers, and independent excursion timing.",
    headline: "How Long Does It Take to Get Off the Cruise Ship in Juneau?",
    quickAnswer: "A practical planning range is roughly 15–30 minutes at a downtown berth and longer when a shuttle or heavy gangway queue is involved. Treat that as planning guidance, not a guaranteed disembarkation time.",
    dockingDetails: "Juneau uses several cruise berths, and your walk or transfer time depends on the berth assigned to your ship. Check the cruise line's current port information and your tour operator's meeting instructions before the port day.",
    gangwayTime: "The ship must be cleared before passengers can disembark, and the first wave of passengers can create a queue. Actual timing varies by ship, berth, arrival conditions, and cruise-line procedures.",
    transitToTours: "Independent operators use different meeting points. Some are near the downtown docks; others require a walk or transfer. Use the meeting location shown for the specific excursion rather than assuming every operator uses the same pickup point.",
    timingRule: "Build extra time between your scheduled arrival and an independent excursion departure, and confirm the operator's recommended check-in time. Also leave enough time at the end of the tour to meet your cruise line's published all-aboard deadline.",
    faqs: [
      {
        question: "How much time should I allow to get off in Juneau?",
        answer: "Allow more than the bare walking time. Gangway queues, berth location, and transfers can add time. Confirm the day's berth and operator meeting instructions before relying on a specific estimate.",
      },
      {
        question: "Do all Juneau tours meet in the same place?",
        answer: "No. Meeting points vary by operator and excursion. Use the location and check-in instructions shown on the specific booking.",
      },
    ],
  },
  "how-long-does-it-take-to-get-off-the-ship-in-skagway": {
    slug: "how-long-does-it-take-to-get-off-the-ship-in-skagway",
    portSlug: "skagway",
    portName: "Skagway",
    title: "How Long to Get Off Cruise Ship in Skagway",
    metaTitle: "How Long Does It Take to Get Off the Cruise Ship in Skagway? | WTA",
    metaDescription: "Planning guidance for Skagway disembarkation, cruise docks, walking time, transfers, and independent excursion timing.",
    headline: "How Long Does It Take to Get Off the Cruise Ship in Skagway?",
    quickAnswer: "Many Skagway passengers can reach the dock area or town fairly quickly, but the exact time depends on your berth, gangway queue, and any local transfer arrangements. Build in more time than the walk itself.",
    dockingDetails: "Skagway has multiple cruise berths with different walking distances. Your berth and current port procedures determine whether the trip to a meeting point is a short walk or requires additional time.",
    gangwayTime: "Morning excursion periods can be busy. Do not assume you can step off the ship at the scheduled arrival minute; ship clearance and passenger queues can affect when you actually reach the dock.",
    transitToTours: "Meeting arrangements vary. Some experiences may meet close to the pier while others use town or operator-specific pickup points. Follow the instructions for the exact tour you book.",
    timingRule: "Leave a practical cushion after scheduled arrival before an independent departure and verify the operator's check-in requirement. For the return, use the cruise line's current all-aboard time as the controlling deadline.",
    faqs: [
      {
        question: "Can I walk from the Skagway cruise docks?",
        answer: "Often yes, but the distance depends on the berth. Check your ship's berth assignment and the excursion's meeting point before deciding how much time to allow.",
      },
      {
        question: "Can local port procedures change the timing?",
        answer: "Yes. Shuttle use, access restrictions, weather, berth operations, or other port conditions can change how quickly passengers move between the ship and town.",
      },
    ],
  },
  "how-long-does-it-take-to-get-off-the-ship-in-ketchikan": {
    slug: "how-long-does-it-take-to-get-off-the-ship-in-ketchikan",
    portSlug: "ketchikan",
    portName: "Ketchikan",
    title: "How Long to Get Off Cruise Ship in Ketchikan",
    metaTitle: "How Long Does It Take to Get Off the Cruise Ship in Ketchikan? | WTA",
    metaDescription: "Planning guidance for Ketchikan disembarkation, downtown berths, Ward Cove transfers, and independent excursion timing.",
    headline: "How Long Does It Take to Get Off the Cruise Ship in Ketchikan?",
    quickAnswer: "Downtown berths can make the transition into Ketchikan quick, while Ward Cove requires additional ground transfer time. Your exact timing depends on berth assignment, queues, and the current shuttle or operator plan.",
    dockingDetails: "Ketchikan cruise calls may use downtown berths or Ward Cove. Those locations create very different travel times, so confirm where your ship is scheduled to berth before choosing a meeting time.",
    gangwayTime: "Even at a convenient berth, ship clearance and passenger queues can affect the first part of the port day. At Ward Cove, include the transfer process in your planning rather than counting only driving time.",
    transitToTours: "Some excursions meet downtown, some use operator transportation, and some may accommodate Ward Cove differently. The specific booking's meeting instructions are more reliable than a generic port-wide assumption.",
    timingRule: "If your ship uses Ward Cove, allow substantially more transfer time than you would at a downtown berth. In every case, confirm the operator's meeting instructions and your cruise line's current all-aboard time.",
    faqs: [
      {
        question: "How far is Ward Cove from downtown Ketchikan?",
        answer: "Ward Cove is outside downtown, so passengers should plan for a ground transfer rather than treating it like a downtown berth. Check current cruise-line shuttle information for your sailing.",
      },
      {
        question: "Do Ketchikan tours all start downtown?",
        answer: "No. Meeting locations vary by operator and excursion, so check the specific tour instructions before planning your transfer from the ship.",
      },
    ],
  },
};

export async function generateStaticParams() {
  return APPROVED_SLUGS.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const config = GUIDE_CONFIGS[slug];
  if (!config) return {};

  return {
    title: config.metaTitle,
    description: config.metaDescription,
    alternates: { canonical: `https://welcometoalaskatours.com/guides/${slug}` },
  };
}

export default async function GuideSlugPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (!APPROVED_SLUGS.includes(slug)) notFound();

  const config = GUIDE_CONFIGS[slug];
  let portTours: TourType[] = [];

  try {
    const rawTours = await getHelicopterTours();
    const sanitized = sanitizeTours(rawTours) as TourType[];
    portTours = sanitized.filter((t) => t.port === config.portSlug);
  } catch (e) {
    console.error("Failed to load guide port tours", e);
  }

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": config.faqs.map((faq) => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": { "@type": "Answer", "text": faq.answer },
    })),
  };

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 pb-20">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />

      <section className="relative bg-slate-900 text-white py-12 px-6 sm:px-8">
        <div className="mx-auto max-w-5xl">
          <div className="inline-flex rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.22em] text-cyan-200">
            Cruise-day planning guide
          </div>
          <h1 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">{config.headline}</h1>
          <p className="mt-2 text-sm text-white/80 max-w-2xl">
            Practical planning guidance for independent excursions. Port operations can change, so confirm your berth, operator meeting instructions, and cruise-line all-aboard time for the actual sailing.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-5xl px-6 sm:px-8">
        <section className="mt-8 rounded-[2rem] border border-sky-100 bg-sky-50/50 p-6 sm:p-8">
          <h2 className="text-xs font-black uppercase tracking-[0.16em] text-sky-800">Quick planning answer</h2>
          <p className="mt-3 text-lg font-bold text-slate-955">{config.quickAnswer}</p>
        </section>

        <section className="mt-8 grid gap-6 md:grid-cols-3">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">1. Know your berth</h3>
            <p className="mt-3 text-xs leading-5 text-slate-600">{config.dockingDetails}</p>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">2. Allow for the gangway</h3>
            <p className="mt-3 text-xs leading-5 text-slate-600">{config.gangwayTime}</p>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">3. Check the meeting point</h3>
            <p className="mt-3 text-xs leading-5 text-slate-600">{config.transitToTours}</p>
          </div>
        </section>

        <section className="mt-8 space-y-6">
          <div className="border-b border-slate-200 pb-3 flex justify-between items-center gap-4">
            <h2 className="text-xl font-black tracking-tight text-slate-955 sm:text-2xl">Excursions in {config.portName}</h2>
            {portTours.length > 0 && (
              <span className="rounded bg-sky-100 px-2 py-1 text-[10px] font-black uppercase tracking-wider text-sky-800">
                {portTours.length} connected tours
              </span>
            )}
          </div>

          {portTours.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2">
              {portTours.map((tour) => (
                <div key={tour.pk} className="rounded-[2rem] border border-slate-200 bg-white overflow-hidden shadow-[0_18px_60px_rgba(15,23,42,0.08)] flex flex-col justify-between">
                  <div className="relative aspect-[16/9] w-full overflow-hidden border-b border-slate-100">
                    <img src={tour.image || `/hero/${config.portSlug}.${config.portSlug === "ketchikan" ? "png" : "jpg"}`} alt={tour.title} className="h-full w-full object-cover" />
                  </div>
                  <div className="p-6 space-y-4 flex-grow flex flex-col justify-between">
                    <div className="space-y-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">{tour.category || `${config.portName} excursion`}</span>
                      <h3 className="text-lg font-black tracking-tight text-slate-900">{tour.title}</h3>
                      <p className="text-xs text-slate-600 line-clamp-3">{tour.description}</p>
                    </div>
                    <div className="pt-4 flex items-center justify-between border-t border-slate-100">
                      <span className="text-base font-black text-slate-900">{tour.fromPrice || "Check Price"}</span>
                      <Link href={`/tours/${tour.company}/${tour.pk}`} className="rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white hover:bg-slate-800 transition">
                        View excursion
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-[2rem] border border-slate-200 bg-white p-6 sm:p-8 text-center">
              <p className="text-sm text-slate-600">No connected excursions are currently showing for this port. Browse the full catalog or check again later.</p>
            </div>
          )}
        </section>

        <section className="mt-8 rounded-[2rem] border border-amber-200 bg-amber-50/60 p-6 sm:p-8">
          <h2 className="text-sm font-black uppercase tracking-wider text-amber-900">Use timing as guidance, not a guarantee</h2>
          <p className="mt-3 text-base font-bold text-slate-955">{config.timingRule}</p>
          <p className="mt-2 text-xs text-slate-600">
            WTA can help compare a tour against the ship window you provide, but the cruise line's current all-aboard instruction and the operator's actual meeting and return details control your port day.
          </p>
        </section>

        <section className="mt-8 rounded-[2rem] border border-slate-200 bg-white p-6 sm:p-8">
          <h2 className="text-xl font-black tracking-tight text-slate-950 sm:text-2xl">Frequently Asked Questions</h2>
          <div className="mt-6 divide-y divide-slate-100">
            {config.faqs.map((faq, i) => (
              <div key={i} className="py-4 first:pt-0 last:pb-0">
                <h3 className="text-sm font-black text-slate-900 sm:text-base">{faq.question}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">{faq.answer}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-8 grid gap-4 sm:grid-cols-3">
          <Link href={`/ports/${config.portSlug}`} className="rounded-2xl border border-slate-200 bg-white p-5 text-center shadow-sm hover:shadow transition block">
            <span className="text-[10px] font-black uppercase tracking-wider text-sky-700 block">Port storefront</span>
            <span className="mt-2 text-sm font-bold text-slate-900 block">Browse {config.portName}</span>
          </Link>
          <Link href="/tours" className="rounded-2xl border border-slate-200 bg-white p-5 text-center shadow-sm hover:shadow transition block">
            <span className="text-[10px] font-black uppercase tracking-wider text-sky-700 block">Full catalog</span>
            <span className="mt-2 text-sm font-bold text-slate-900 block">Browse all excursions</span>
          </Link>
          <Link href="/plan" className="rounded-2xl border border-slate-200 bg-white p-5 text-center shadow-sm hover:shadow transition block">
            <span className="text-[10px] font-black uppercase tracking-wider text-sky-700 block">Timing tool</span>
            <span className="mt-2 text-sm font-bold text-slate-900 block">Match tours to ship window</span>
          </Link>
        </section>
      </div>
    </main>
  );
}
