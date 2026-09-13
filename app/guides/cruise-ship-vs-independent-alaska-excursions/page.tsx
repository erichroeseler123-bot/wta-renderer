import type { Metadata } from "next";
import Link from "next/link";
import GeoDirectAnswerCard from "@/components/seo/GeoDirectAnswerCard";
import { ALASKA_GEO_FACTS } from "@/lib/alaskaGeoFacts";

const canonical = "https://www.welcometoalaskatours.com/guides/cruise-ship-vs-independent-alaska-excursions";

export const metadata: Metadata = {
  title: "Booking Alaska Shore Excursions: Independent vs Cruise Ship (2026 Guide)",
  description:
    "Honest comparison between booking independent Alaska excursions vs cruise ship tours. Compare pricing markups, group sizes, back-to-ship guarantees, and port docking realities.",
  alternates: { canonical },
  openGraph: {
    title: "Alaska Shore Excursions: Independent vs Cruise Ship Comparison",
    description:
      "A complete guide to pricing, boat crowd sizes, guaranteed ship returns, and port logistics for Alaska cruise passengers.",
    url: canonical,
    type: "article",
  },
};

const comparisonRows = [
  {
    feature: "Pricing & Value",
    independent: "$165–$195 (Whale watch) • Direct local pricing with no corporate retail markup",
    cruiseShip: "$240–$320 (Whale watch) • 30%–50% markup kept by the cruise line",
    diyWalkUp: "Variable pricing • Surge taxi fares and high risk of sold-out popular times",
  },
  {
    feature: "Group Size & Experience",
    independent: "Small-to-midsize boats (12–28 passengers) • Uncrowded 360° decks & personal captain interaction",
    cruiseShip: "Large double-decker passenger catamarans (60–150+ guests) • Crowded rails for photos",
    diyWalkUp: "Unpredictable • May be forced into whatever third-party seats remain on the pier",
  },
  {
    feature: "Weather & Flight Cancellations",
    independent: "100% Full Cash Refund immediately back to your original payment method",
    cruiseShip: "Often credited as non-refundable 'Onboard Cruise Credit' or slow shipboard refund",
    diyWalkUp: "Depends entirely on cash or individual booth operator willingness to refund",
  },
  {
    feature: "Missed Port Call Protection",
    independent: "100% Automatic Refund if your cruise ship skips port due to weather or mechanical delay",
    cruiseShip: "Refunded automatically to shipboard folio",
    diyWalkUp: "Not applicable (only booked once physically on land)",
  },
  {
    feature: "Back-to-Ship Safety Buffer",
    independent: "Strict 60–90 minute return cushion prior to all-aboard • Comprehensive return guarantees",
    cruiseShip: "Ship will hold the gangway or arrange transit if an official ship tour is delayed",
    diyWalkUp: "ZERO protection • You bear 100% financial and logistical liability if a taxi breaks down",
  },
  {
    feature: "Pier Pickup Logistics",
    independent: "Dedicated meeting points at or adjacent to cruise docks (e.g. Mt. Roberts Tram Plaza in Juneau)",
    cruiseShip: "Requires waiting in crowded shipboard theaters for 30–60 min before group disembarkation",
    diyWalkUp: "Requires wandering dock parking lots negotiating with street-side sales kiosks",
  },
];

const faqs = [
  {
    question: "Will the cruise ship leave without me if I book an independent excursion?",
    answer:
      "No. Professional independent operators schedule all excursions with a conservative 60 to 90-minute safety buffer prior to the ship's published all-aboard time. In the extremely rare event of a road or mechanical delay, reputable independent tour providers carry comprehensive contingency insurance to transport you to the ship's next port of call. In reality, local operators have perfect on-time track records because their livelihoods depend on never stranding a cruise guest.",
  },
  {
    question: "Are independent Alaska shore excursions cheaper than booking through the cruise line?",
    answer:
      "Yes. Booking independently saves passengers 20% to 40% on average. Cruise lines subcontract local Alaskan boat captains, helicopter bases, and dog mushers, then add significant corporate markups to the retail ticket price. Booking directly or through an independent specialist gives you the exact same or better small-group local tours at true local rates.",
  },
  {
    question: "What happens if our cruise ship is delayed or misses the port completely?",
    answer:
      "If your ship arrives late or bypasses the port entirely due to adverse maritime weather or mechanical issues, Welcome to Alaska Tours provides a 100% full refund automatically. You are never penalized for circumstances controlled by the cruise ship captain or harbor authorities.",
  },
  {
    question: "Do independent excursions pick up directly at the cruise ship dock?",
    answer:
      "Yes. Excursion providers stage pickups right at the cruise ship terminal or at designated central hubs within a 2 to 5-minute flat walk from the gangway (such as the Mt. Roberts Tramway plaza in Juneau, or Berth 1–4 kiosks in Ketchikan). Full walking directions and local dispatch phone numbers are provided with every booking.",
  },
  {
    question: "How far in advance should I book independent Alaska shore excursions?",
    answer:
      "High-demand excursions—specifically small-boat Juneau whale watching, helicopter glacier landings, dog sledding on snow, and Mendenhall Glacier permits—frequently sell out 3 to 6 months in advance of the summer sailing season (May–September). Booking early secures your preferred departure time that aligns perfectly with your ship's port call.",
  },
];

export default function CruiseShipVsIndependentGuide() {
  const geoFact = ALASKA_GEO_FACTS["cruise-ship-vs-independent"];

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: "Booking Alaska Shore Excursions: Independent vs Cruise Ship (2026 Guide)",
    description: metadata.description,
    datePublished: "2026-09-09",
    dateModified: "2026-09-09",
    mainEntityOfPage: canonical,
    publisher: {
      "@type": "Organization",
      name: "Welcome To Alaska Tours",
      url: "https://welcometoalaskatours.com",
    },
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: f.answer,
      },
    })),
  };

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#e0f2fe_0%,#f8fafc_35%,#ffffff_100%)] text-slate-950 pb-20">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />

      {/* HERO SECTION */}
      <section className="bg-[linear-gradient(135deg,#082f49_0%,#0f172a_58%,#164e63_100%)] px-6 py-14 text-white sm:py-20">
        <div className="mx-auto max-w-5xl">
          <Link href="/guides" className="text-sm font-bold text-cyan-200 hover:text-white inline-flex items-center gap-1.5 mb-4">
            ← All Alaska cruise guides
          </Link>
          <div className="text-[11px] font-black uppercase tracking-[0.22em] text-cyan-300">
            Alaska Cruise Planning Intelligence · 2026
          </div>
          <h1 className="mt-3 max-w-4xl text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.1]">
            Booking Alaska Shore Excursions: Independent vs. Cruise Ship
          </h1>
          <p className="mt-5 max-w-3xl text-base sm:text-lg leading-relaxed text-slate-200">
            Cruise lines want you to believe booking outside the ship is dangerous and complex. The reality? Independent excursions in Juneau, Skagway, and Ketchikan offer smaller groups, authentic local captains, 20% to 40% lower prices, and ironclad back-to-ship guarantees.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/juneau/whale-watching"
              className="inline-flex min-h-12 items-center justify-center rounded-2xl bg-cyan-300 px-6 py-3 text-sm font-black uppercase tracking-wider text-slate-950 hover:bg-cyan-200 transition-colors"
            >
              Juneau Whale Watching →
            </Link>
            <Link
              href="/ports/juneau"
              className="inline-flex min-h-12 items-center justify-center rounded-2xl border border-white/20 bg-white/10 px-6 py-3 text-sm font-black uppercase tracking-wider text-white hover:bg-white/20 transition-colors"
            >
              Juneau Port Guide
            </Link>
            <Link
              href="/ports/ketchikan"
              className="inline-flex min-h-12 items-center justify-center rounded-2xl border border-white/20 bg-white/10 px-6 py-3 text-sm font-black uppercase tracking-wider text-white hover:bg-white/20 transition-colors"
            >
              Ketchikan Port Guide
            </Link>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-5xl px-6 sm:px-8">
        {/* DIRECT ANSWER CARD TARGETED FOR AI OVERVIEWS */}
        <GeoDirectAnswerCard fact={geoFact} />

        {/* COMPARISON MATRIX TABLE */}
        <section className="mt-12 rounded-[2rem] border border-slate-200 bg-white p-6 sm:p-8 shadow-sm">
          <div className="text-[11px] font-black uppercase tracking-[0.2em] text-sky-700 mb-2">
            The Side-by-Side Tradeoff Matrix
          </div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-950 mb-6">
            Independent Excursion vs. Cruise Ship Tour vs. Port Walk-Up
          </h2>
          <p className="text-slate-600 mb-8 leading-relaxed">
            Before spending thousands of dollars on shore activities, compare how the three booking methods stack up across cost, crowd sizes, refund security, and dock logistics.
          </p>

          <div className="overflow-x-auto -mx-6 sm:mx-0">
            <table className="w-full text-left border-collapse min-w-[650px]">
              <thead>
                <tr className="border-b-2 border-slate-100 bg-slate-50/80">
                  <th className="p-4 text-xs font-black uppercase tracking-wider text-slate-500 w-1/4">Feature</th>
                  <th className="p-4 text-xs font-black uppercase tracking-wider text-sky-800 bg-sky-50/60 w-1/3">
                    Welcome To Alaska (Independent)
                  </th>
                  <th className="p-4 text-xs font-black uppercase tracking-wider text-slate-700 w-1/4">Cruise Ship Tour</th>
                  <th className="p-4 text-xs font-black uppercase tracking-wider text-slate-500 w-1/6">DIY Port Walk-Up</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {comparisonRows.map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-4 font-bold text-slate-900">{row.feature}</td>
                    <td className="p-4 bg-sky-50/30 text-sky-950 font-medium">{row.independent}</td>
                    <td className="p-4 text-slate-600">{row.cruiseShip}</td>
                    <td className="p-4 text-slate-500">{row.diyWalkUp}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* E-E-A-T ALASKA OPERATIONAL DEEP DIVES */}
        <section className="mt-12 space-y-10">
          <div className="rounded-[2rem] border border-sky-100 bg-white p-6 sm:p-8 shadow-sm">
            <h2 className="text-2xl font-black tracking-tight text-slate-950 mb-4">
              Debunking the Myth: "The Ship Will Leave Without You"
            </h2>
            <div className="space-y-4 text-slate-700 leading-relaxed">
              <p>
                Every cruise passenger has heard the warning at the onboard port talks: <em>"If you book independent excursions and are late, the ship will leave you behind!"</em> Cruise lines use this fear tactic for one primary reason: <strong>shore excursions represent one of the highest-margin ancillary revenue sources on the ship.</strong>
              </p>
              <p>
                In reality, independent excursion providers in Southeast Alaska—including Juneau, Skagway, and Ketchikan—live and breathe the maritime cruise schedules. Every morning, independent dispatchers verify port arrival logs, gangway clearance times, and published all-aboard deadlines directly with local harbor masters.
              </p>
              <p>
                Independent tour itineraries are deliberately built with <strong>60 to 90-minute return safety buffers</strong> before all-aboard. If your all-aboard is 4:30 PM, your tour will return you to the dock by 3:00 PM or 3:30 PM at the latest. Furthermore, reputable operators provide a formal <strong>Back-to-Ship Guarantee</strong>, backing every passenger with travel liability coverage to transport you to the next port at the operator's expense if an unforeseen delay were ever to occur.
              </p>
            </div>
          </div>

          <div className="rounded-[2rem] border border-sky-100 bg-white p-6 sm:p-8 shadow-sm">
            <h2 className="text-2xl font-black tracking-tight text-slate-950 mb-4">
              Where Your Money Actually Goes: The 30%–50% Cruise Line Markup
            </h2>
            <div className="space-y-4 text-slate-700 leading-relaxed">
              <p>
                A surprising fact for first-time Alaska cruisers: <strong>cruise lines do not own the whale watching boats, helicopters, or dog sled camps.</strong>
              </p>
              <p>
                Major cruise lines (such as Princess, Holland America, Royal Caribbean, and Norwegian) contract the exact same licensed local operators that you can book independently. The difference? The cruise line packages the tour on massive buses, loads 100+ passengers onto double-decker boats, and marks up the retail price by $50 to $120+ per passenger.
              </p>
              <p>
                By booking independently through Welcome to Alaska Tours, your travel dollars go directly to local Alaskan boat captains, veteran bush pilots, and naturalist guides, while you enjoy smaller, personalized groups and significantly lower out-of-pocket costs.
              </p>
            </div>
          </div>

          <div className="rounded-[2rem] border border-sky-100 bg-white p-6 sm:p-8 shadow-sm">
            <h2 className="text-2xl font-black tracking-tight text-slate-950 mb-4">
              Port-Specific Dock Logistics: Juneau, Ketchikan & Skagway
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
              <div className="rounded-xl border border-slate-100 bg-slate-50 p-5">
                <h3 className="font-black text-slate-900 text-lg mb-2">Juneau Berths</h3>
                <p className="text-xs text-slate-600 leading-relaxed mb-3">
                  Most ships dock right downtown (Franklin, CT, IVF) along the seawalk. If your ship berths at the AJ Dock (1 mile south), a dedicated $5 shuttle drops you right at the Mt. Roberts Tram plaza, which is the primary independent excursion pickup hub.
                </p>
                <Link href="/ports/juneau" className="text-xs font-bold text-sky-700 hover:underline">
                  Juneau Cruise Port Guide →
                </Link>
              </div>

              <div className="rounded-xl border border-slate-100 bg-slate-50 p-5">
                <h3 className="font-black text-slate-900 text-lg mb-2">Ketchikan & Ward Cove</h3>
                <p className="text-xs text-slate-600 leading-relaxed mb-3">
                  Downtown berths 1–4 are right in front of historic Creek Street. Ships berthing at Ward Cove (NCL/Oceania, 9 miles north) take a free 20-minute shuttle into town. Independent tours coordinate pick-ups at both locations.
                </p>
                <Link href="/ports/ketchikan" className="text-xs font-bold text-sky-700 hover:underline">
                  Ketchikan Cruise Port Guide →
                </Link>
              </div>

              <div className="rounded-xl border border-slate-100 bg-slate-50 p-5">
                <h3 className="font-black text-slate-900 text-lg mb-2">Skagway Docks</h3>
                <p className="text-xs text-slate-600 leading-relaxed mb-3">
                  Ore and Broadway Docks are a 5-minute walk to town. For ships at the Railroad Dock, a free municipal shuttle or scenic transfer train transports passengers past hillside mitigation zones directly to Broadway.
                </p>
                <Link href="/ports/skagway" className="text-xs font-bold text-sky-700 hover:underline">
                  Skagway Cruise Port Guide →
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* FREQUENTLY ASKED QUESTIONS */}
        <section className="mt-12 rounded-[2rem] border border-slate-200 bg-white p-6 sm:p-8 shadow-sm">
          <div className="text-[11px] font-black uppercase tracking-[0.2em] text-sky-700 mb-2">Got Questions?</div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-950 mb-6">
            Frequently Asked Questions
          </h2>
          <div className="divide-y divide-slate-100">
            {faqs.map((faq, idx) => (
              <div key={idx} className="py-5">
                <h3 className="text-lg font-bold text-slate-900 mb-2">{faq.question}</h3>
                <p className="text-slate-600 leading-relaxed text-sm sm:text-base">{faq.answer}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CALL TO ACTION */}
        <section className="mt-12 rounded-[2rem] bg-[linear-gradient(135deg,#0284c7_0%,#0369a1_100%)] p-8 text-white text-center sm:p-12 shadow-md">
          <h2 className="text-2xl sm:text-4xl font-black tracking-tight mb-4">
            Ready to Plan Your Perfect Alaska Cruise Day?
          </h2>
          <p className="max-w-2xl mx-auto text-sky-100 mb-8 text-base sm:text-lg">
            Compare connected small-group shore excursions across Juneau, Skagway, and Ketchikan with live calendars and guaranteed on-time ship return.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/"
              className="inline-flex min-h-12 items-center justify-center rounded-2xl bg-white px-8 py-3 text-sm font-black uppercase tracking-wider text-sky-900 hover:bg-sky-50 transition-colors shadow-sm"
            >
              Start 4-Tour Shortlist Finder
            </Link>
            <Link
              href="/ports/juneau"
              className="inline-flex min-h-12 items-center justify-center rounded-2xl border border-white/30 bg-sky-950/20 px-8 py-3 text-sm font-black uppercase tracking-wider text-white hover:bg-sky-950/40 transition-colors"
            >
              Explore Juneau Excursions
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
