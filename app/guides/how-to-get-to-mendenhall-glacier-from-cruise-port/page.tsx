import type { Metadata } from "next";
import Link from "next/link";
import { getAlaskaGeoFact } from "@/lib/alaskaGeoFacts";
import GeoDirectAnswerCard from "@/components/seo/GeoDirectAnswerCard";

const canonical = "https://www.welcometoalaskatours.com/guides/how-to-get-to-mendenhall-glacier-from-cruise-port";

export const metadata: Metadata = {
  title: "How to Get to Mendenhall Glacier from Juneau Cruise Port: Shuttles, Taxis & Tours (2026)",
  description:
    "Compare Mendenhall Glacier transportation from Juneau cruise docks: 13-mile shuttles, whale combos, rideshare risks, city bus limits, USFS permits, and verified 2026 excursions.",
  alternates: { canonical },
  openGraph: {
    title: "How to Get to Mendenhall Glacier from Juneau Cruise Port: Shuttles, Taxis & Tours (2026)",
    description:
      "Complete guide on getting to Mendenhall Glacier from Juneau cruise docks: commercial shuttles, whale combos, taxi shortages, city bus walking distance, permit limits, and back-to-ship timing.",
    url: canonical,
    type: "article",
  },
};

const faqs = [
  {
    question: "How far is Mendenhall Glacier from the Juneau cruise port?",
    answer:
      "Mendenhall Glacier Recreation Area is located 13 miles northwest of the downtown Juneau cruise berths. Transit time is approximately 20 to 25 minutes along Egan Drive (AK-2) and Glacier Spur Road under normal traffic conditions.",
  },
  {
    question: "How much time do you realistically need at Mendenhall Glacier?",
    answer:
      "Plan for 2 to 2.5 hours on site. This allows 45 to 50 minutes for the flat 2-mile round-trip walk to Nugget Falls, 30 to 45 minutes to explore the USFS Visitor Center exhibits and short films, and 20 minutes for restrooms, photography, and shuttle boarding.",
  },
  {
    question: "Can I take an Uber, Lyft, or local taxi to Mendenhall Glacier and get back?",
    answer:
      "While rideshares and taxis can drop you off at Mendenhall, relying on them for your return ride is high-risk. Cellular data reception at the glacier is spotty, and Juneau's small driver pool is overwhelmed on multi-ship cruise days with 12,000 to 18,000 passengers in port. Waiting for an unavailable Uber has caused many travelers to cut their return dangerously close to ship all-aboard.",
  },
  {
    question: "Can I take the Juneau municipal city bus to Mendenhall Glacier?",
    answer:
      "We do not recommend the city bus for cruise passengers. The Juneau Capital Transit bus stops at Glacier Highway and Mendenhall Loop Road, leaving you 1.5 miles away from the visitor center. This forces a 3-mile round-trip walk along a road shoulder with no sidewalks, consuming 60 to 75 minutes of your port call.",
  },
  {
    question: "Are walk-up shuttle tickets available at the cruise docks?",
    answer:
      "Due to US Forest Service commercial permit caps, walk-up shuttle booths at the Mt. Roberts Tramway lot frequently sell out early on busy mornings. Booking an authorized tour shuttle, guided excursion, or whale-watching combo in advance secures your entry permit and return seat.",
  },
  {
    question: "Is the trail to Nugget Falls difficult or steep?",
    answer:
      "No. The Nugget Falls trail is a wide, well-maintained gravel path with minimal elevation gain (virtually flat). It is 2 miles round-trip (1 mile each way) and takes about 45 minutes of easy walking. It brings you directly to the beach bordering Mendenhall Lake right next to the thundering 377-foot waterfall.",
  },
  {
    question: "What is the best way to combine Mendenhall Glacier with whale watching?",
    answer:
      "Book a combined Whale Watching & Mendenhall Glacier excursion (5 to 5.5 hours total). The operator coordinates all ground transfers between the cruise dock, Auke Bay harbor, and the glacier, includes your USFS pass, and is scheduled so you can plan a comfortable return buffer before all-aboard.",
  },
  {
    question: "How does the cruise safety return buffer work?",
    answer:
      "Plan a buffer of at least 45 to 60 minutes before your ship's published all-aboard time (or 60 minutes if docked at the remote AJ Dock). Operators schedule excursion returns around port calls, and booking with a 45–60 minute buffer ensures ample margin for dock transfers and gangway security.",
  },
];

const transportOptions = [
  {
    title: "Authorized Excursion Shuttle",
    cost: "$45 – $95 / person",
    travelTime: "20–25 min each way",
    permitIncluded: "Yes (USFS Pass Included)",
    returnReliability: "Plan a 45–60 min buffer",
    pros: "Direct dockside pickup, fixed departure and return schedules, guaranteed USFS recreation permit.",
    cons: "Requires advance reservation; walk-up tickets often sell out on multi-ship days.",
    bestFor: "Passengers wanting self-paced time for Nugget Falls and the Visitor Center.",
    badge: "Most Popular",
    badgeColor: "bg-sky-100 text-sky-800 border-sky-200",
  },
  {
    title: "Whale Watching & Mendenhall Combo",
    cost: "$199 – $295 / person",
    travelTime: "5 – 5.5 hours total",
    permitIncluded: "Yes (All Passes Included)",
    returnReliability: "Plan a 45–60 min buffer",
    pros: "Covers both signature Juneau highlights in one booking; zero transfer friction between Auke Bay and glacier.",
    cons: "Requires at least 6.5 hours of port time between disembarkation and all-aboard.",
    bestFor: "First-time visitors wanting humpbacks and glacier views in a single day.",
    badge: "Best Overall Value",
    badgeColor: "bg-emerald-100 text-emerald-800 border-emerald-200",
  },
  {
    title: "Mendenhall Lake Canoe or Kayak",
    cost: "$165 – $349 / person",
    travelTime: "3.5 – 4.5 hours total",
    permitIncluded: "Yes (Special Forest Permit)",
    returnReliability: "Plan a 45–60 min buffer",
    pros: "Paddle right up to the 377-foot Nugget Falls and iceberg fields; small group, active wilderness immersion.",
    cons: "Requires moderate physical stamina; operates rain or shine in Southeast Alaska conditions.",
    bestFor: "Active travelers seeking an unforgettable up-close water perspective.",
    badge: "Adventure Pick",
    badgeColor: "bg-cyan-100 text-cyan-800 border-cyan-200",
  },
  {
    title: "Taxi or Rideshare (Uber / Lyft)",
    cost: "$35 – $55 each way",
    travelTime: "20–25 min (if available)",
    permitIncluded: "No ($5/person extra at gate)",
    returnReliability: "High Risk for Return Trip",
    pros: "Flexible departure if a driver is immediately waiting downtown.",
    cons: "Spotty cell reception at the glacier makes summoning a return ride unreliable; Juneau driver shortage causes long delays.",
    bestFor: "Not recommended for cruise passengers with tight afternoon all-aboard deadlines.",
    badge: "Proceed with Caution",
    badgeColor: "bg-amber-100 text-amber-800 border-amber-200",
  },
  {
    title: "Capital Transit Municipal City Bus",
    cost: "$2 cash / person",
    travelTime: "45–60 min + 1.5 mi walk",
    permitIncluded: "No (Pay $5 at visitor center)",
    returnReliability: "Not Suitable for Cruisers",
    pros: "Lowest cost option.",
    cons: "Drops off 1.5 miles from the visitor center along Glacier Spur Rd; adds a 3-mile round-trip walk on highway shoulder; no luggage or gear allowed.",
    bestFor: "Budget backpackers with full-day port calls; not suitable for most cruise visitors.",
    badge: "Not Recommended",
    badgeColor: "bg-rose-100 text-rose-800 border-rose-200",
  },
];

const featuredTours = [
  {
    title: "Whale Watching and Mendenhall Glacier Tour",
    operator: "Alaska Tales",
    price: "From $199",
    duration: "5.5 Hours",
    highlights: "100% whale sighting guarantee (Alaska Tales), heated catamaran cabin, 1.5–2h at Mendenhall Glacier with USFS permit.",
    href: "/tours/alaskatales/47296",
    calendarHref: "/tours/alaskatales/47296/calendar",
    tag: "Whale + Glacier Combo",
  },
  {
    title: "Mendenhall Lake Canoe Adventure",
    operator: "Alaska Travel Adventures",
    price: "From $165",
    duration: "3.5 Hours",
    highlights: "Stable 12-passenger voyageur canoes, paddle right up to Nugget Falls, gear & rain gear provided.",
    href: "/tours/aktraveladventures/311607",
    calendarHref: "/tours/aktraveladventures/311607/calendar",
    tag: "Lake Paddle",
  },
  {
    title: "Mendenhall Glacier Float Trip",
    operator: "Alaska Travel Adventures",
    price: "From $124",
    duration: "3.5 Hours",
    highlights: "Scenic raft float on Mendenhall River starting beneath the glacier, gentle Class II-III rapids.",
    href: "/tours/aktraveladventures/311600",
    calendarHref: "/tours/aktraveladventures/311600/calendar",
    tag: "Scenic Float",
  },
  {
    title: "Mendenhall Glacier Guided Hike",
    operator: "Beyond Alaska",
    price: "From $209",
    duration: "4.5 Hours",
    highlights: "Small-group guided rainforest trek to elevated glacier overlooks, interpretive naturalist guidance.",
    href: "/tours/beyondak/195602",
    calendarHref: "/tours/beyondak/195602/calendar",
    tag: "Guided Hike",
  },
];

export default function GuidePage() {
  const geoFact = getAlaskaGeoFact("juneau", "how-to-get-to-mendenhall-glacier-from-cruise-port");

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: { "@type": "Answer", text: faq.answer },
    })),
  };

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: "How to Get to Mendenhall Glacier from Juneau Cruise Port: Shuttles, Taxis & Tours",
    description: metadata.description,
    datePublished: "2026-08-24",
    dateModified: "2026-09-23",
    mainEntityOfPage: canonical,
    publisher: { "@type": "Organization", name: "Welcome To Alaska Tours" },
  };

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#e0f2fe_0%,#f8fafc_38%,#ffffff_100%)] text-slate-950 pb-20">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />

      {/* Hero Section */}
      <section className="bg-[linear-gradient(135deg,#082f49_0%,#0f172a_58%,#164e63_100%)] px-6 py-14 text-white sm:py-20">
        <div className="mx-auto max-w-5xl">
          <Link href="/ports/juneau" className="text-sm font-bold text-cyan-200 hover:text-white">
            {"← Juneau excursions"}
          </Link>
          <div className="mt-5 text-[11px] font-black uppercase tracking-[0.22em] text-cyan-200">
            Alaska Cruise Planning Guide · 2026
          </div>
          <h1 className="mt-3 max-w-4xl text-3xl font-black tracking-tight sm:text-5xl lg:text-6xl">
            How to Get to Mendenhall Glacier from Juneau Cruise Port
          </h1>
          <p className="mt-5 max-w-3xl text-base leading-7 text-slate-200 sm:text-lg">
            Mendenhall Glacier sits 13 miles northwest of the downtown Juneau cruise docks. Getting there and back
            without stress requires understanding your transit options, US Forest Service commercial permit caps,
            and Juneau's strict return-to-ship timing constraints.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link
              href="/juneau/mendenhall-glacier-tours"
              className="inline-flex min-h-12 items-center justify-center rounded-2xl bg-cyan-300 px-6 py-3 text-sm font-black uppercase tracking-wider text-slate-950 hover:bg-cyan-200 shadow-md transition"
            >
              Compare All Mendenhall Tours →
            </Link>
            <Link
              href="/juneau/whale-watching"
              className="inline-flex min-h-12 items-center justify-center rounded-2xl border border-white/20 bg-white/10 px-6 py-3 text-sm font-black uppercase tracking-wider text-white hover:bg-white/20 transition"
            >
              Whale + Glacier Combos
            </Link>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-5xl px-6 sm:px-8">
        {/* Direct GEO Answer Card */}
        {geoFact && (
          <div className="mt-8">
            <GeoDirectAnswerCard fact={geoFact} />
          </div>
        )}

        {/* Quick Executive Decision Summary */}
        <section className="mt-8 rounded-[2rem] border border-sky-100 bg-white p-6 shadow-sm sm:p-8">
          <div className="text-[10px] font-black uppercase tracking-[0.2em] text-sky-700">Quick Decision Summary</div>
          <p className="mt-3 text-lg font-bold leading-8 text-slate-900">
            Book an authorized commercial tour shuttle or combination tour ($45–$95 for transport; $199+ for whale combos)
            in advance. Do not rely on Uber, Lyft, or city taxis for your return trip: driver shortages and spotty cell service
            at the glacier leave cruisers stranded every summer. The municipal bus drops 1.5 miles away from the visitor center,
            requiring an exhausting 3-mile highway walk.
          </p>
          <div className="mt-5 rounded-2xl bg-amber-50 border border-amber-200 p-4 text-xs font-semibold text-amber-950">
            <strong>Cruise Safety Buffer:</strong> Plan a buffer of at least 45 to 60 minutes before all-aboard:{" "}
            <code className="rounded bg-amber-100 px-1 py-0.5 font-mono text-amber-950">
              tour end time + 45 minutes &le; ship all-aboard time
            </code>{" "}
            (or 60 minutes for ships at the AJ Dock). Never book an independent departure that cuts into this cushion.
          </div>
        </section>

        {/* Comprehensive Transit Comparison Table */}
        <section className="mt-12">
          <div className="text-[10px] font-black uppercase tracking-[0.2em] text-sky-700">Transit Comparison</div>
          <h2 className="mt-2 text-2xl font-black text-slate-950 sm:text-3xl">
            5 Ways to Reach Mendenhall Glacier Compared
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            Compare prices, travel times, permit inclusions, and return reliability across every transportation method available in Juneau.
          </p>

          <div className="mt-6 space-y-4">
            {transportOptions.map((opt) => (
              <div
                key={opt.title}
                className="overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md"
              >
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-3">
                    <h3 className="text-lg font-black text-slate-900">{opt.title}</h3>
                    <span className={`rounded-full border px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider ${opt.badgeColor}`}>
                      {opt.badge}
                    </span>
                  </div>
                  <div className="text-base font-black text-slate-950 sm:text-right">{opt.cost}</div>
                </div>

                <div className="mt-4 grid gap-3 sm:grid-cols-3 text-xs text-slate-600 border-y border-slate-100 py-3">
                  <div>
                    <span className="font-bold text-slate-900">Travel Time:</span> {opt.travelTime}
                  </div>
                  <div>
                    <span className="font-bold text-slate-900">USFS Permit:</span> {opt.permitIncluded}
                  </div>
                  <div>
                    <span className="font-bold text-slate-900">Return Safety:</span> {opt.returnReliability}
                  </div>
                </div>

                <div className="mt-4 grid gap-2 sm:grid-cols-2 text-xs leading-5">
                  <p className="text-slate-700">
                    <strong className="text-emerald-700">Advantages:</strong> {opt.pros}
                  </p>
                  <p className="text-slate-700">
                    <strong className="text-amber-700">Drawbacks:</strong> {opt.cons}
                  </p>
                </div>

                <div className="mt-3 text-xs font-semibold text-slate-500">
                  <strong className="text-slate-800">Best for:</strong> {opt.bestFor}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Cruise Port Timing & Berth Guide */}
        <section className="mt-14 rounded-[2rem] border border-slate-200 bg-slate-50 p-6 sm:p-8">
          <div className="text-[10px] font-black uppercase tracking-[0.2em] text-sky-700">Port Logistics</div>
          <h2 className="mt-2 text-2xl font-black text-slate-950">
            Cruiser Timing Guide: Berths, Drive Times & All-Aboard
          </h2>
          <div className="mt-4 space-y-4 text-sm leading-6 text-slate-700">
            <p>
              Juneau has four main cruise berths: <strong>Franklin Dock</strong>, <strong>Intermediate Vessel Float (IVF)</strong>,{" "}
              <strong>Steamship Wharf</strong>, and the <strong>AJ Dock (South Franklin)</strong>. The majority of independent tour
              shuttles pick up at the <strong>Mt. Roberts Tramway parking lot</strong>, located directly adjacent to Franklin Dock.
            </p>
            <div className="grid gap-4 sm:grid-cols-2 mt-4">
              <div className="rounded-2xl border border-slate-200 bg-white p-5">
                <h4 className="font-black text-slate-900">Downtown Berths (Franklin, Steamship, IVF)</h4>
                <p className="mt-2 text-xs leading-5 text-slate-600">
                  Walking distance to the tour loading bays is only 3 to 8 minutes along the flat waterfront seawalk. Allow 15 minutes
                  from stepping off the gangway to reaching your shuttle check-in.
                </p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white p-5">
                <h4 className="font-black text-slate-900">AJ Dock (South Franklin)</h4>
                <p className="mt-2 text-xs leading-5 text-slate-600">
                  Located 1 mile south of town. You must take the dedicated $5 AJ Dock shuttle (10 min ride) or walk 20 minutes along
                  South Franklin Street. Add an extra 20–30 minutes to both departure and return plans.
                </p>
              </div>
            </div>
            <div className="rounded-2xl bg-white p-5 border border-sky-100 mt-4">
              <h4 className="font-black text-slate-900 text-sm">Recommended Time Allocation on Site (2 to 2.5 Hours):</h4>
              <ul className="mt-2 space-y-1.5 text-xs text-slate-600 list-disc list-inside">
                <li><strong>Nugget Falls Walk:</strong> 45–50 min round-trip (2 miles flat gravel path to the waterfall base).</li>
                <li><strong>Photo Point Trail:</strong> 15 min round-trip (paved, accessible viewpoint of the glacier face).</li>
                <li><strong>Visitor Center & Exhibits:</strong> 30–40 min (elevated viewing gallery, theater film, and USFS rangers).</li>
                <li><strong>Steep Creek Trail:</strong> 15 min (raised boardwalk over salmon spawning streams, prime July–Sept bear spot).</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Verified Connected Tour Cards */}
        <section className="mt-14">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="text-[10px] font-black uppercase tracking-[0.2em] text-sky-700">Verified Excursions</div>
              <h2 className="mt-2 text-2xl font-black text-slate-950 sm:text-3xl">
                Featured Mendenhall Glacier Tours for 2026
              </h2>
            </div>
            <Link
              href="/juneau/mendenhall-glacier-tours"
              className="text-xs font-black uppercase tracking-wider text-sky-700 hover:text-sky-900"
            >
              Browse all 10 Mendenhall tours →
            </Link>
          </div>

          <div className="mt-6 grid gap-5 md:grid-cols-2">
            {featuredTours.map((t) => (
              <div
                key={t.title}
                className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="rounded-full bg-sky-50 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-sky-800">
                      {t.tag}
                    </span>
                    <span className="text-sm font-black text-slate-900">{t.price}</span>
                  </div>
                  <h3 className="mt-3 text-lg font-black text-slate-950">{t.title}</h3>
                  <div className="mt-1 text-xs font-semibold text-slate-500">
                    Operator: {t.operator} • Duration: {t.duration}
                  </div>
                  <p className="mt-3 text-xs leading-5 text-slate-600">{t.highlights}</p>
                </div>
                <div className="mt-6 grid grid-cols-2 gap-2">
                  <Link
                    href={t.href}
                    className="rounded-xl border border-slate-200 px-3 py-2 text-center text-xs font-black hover:bg-slate-50 transition"
                  >
                    View Details
                  </Link>
                  <Link
                    href={t.calendarHref}
                    className="rounded-xl bg-sky-700 px-3 py-2 text-center text-xs font-black text-white hover:bg-sky-800 transition"
                  >
                    Live Calendar →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* FAQs */}
        <section className="mt-14 rounded-[2rem] border border-slate-200 bg-slate-50 p-6 sm:p-8">
          <h2 className="text-2xl font-black text-slate-950">Frequently Asked Questions</h2>
          <div className="mt-6 divide-y divide-slate-200">
            {faqs.map((faq, idx) => (
              <div key={idx} className="py-4">
                <h3 className="text-base font-black text-slate-900">{faq.question}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">{faq.answer}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Port Navigation Footer */}
        <section className="mt-14 rounded-3xl bg-slate-900 p-8 text-white text-center">
          <h2 className="text-2xl font-black sm:text-3xl">Planning Your Juneau Port Day?</h2>
          <p className="mt-3 text-sm text-slate-300 max-w-xl mx-auto">
            Book directly with verified local operators in Juneau with live calendar availability, no hidden booking fees, and planned buffers before ship all-aboard.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-4">
            <Link
              href="/juneau/mendenhall-glacier-tours"
              className="rounded-xl bg-cyan-400 px-5 py-2.5 text-xs font-black uppercase tracking-wider text-slate-950 hover:bg-cyan-300 transition"
            >
              Mendenhall Glacier Tours →
            </Link>
            <Link
              href="/juneau/whale-watching"
              className="rounded-xl bg-cyan-400 px-5 py-2.5 text-xs font-black uppercase tracking-wider text-slate-950 hover:bg-cyan-300 transition"
            >
              Juneau Whale Watching →
            </Link>
            <Link
              href="/ports/juneau"
              className="rounded-xl border border-white/20 bg-white/10 px-5 py-2.5 text-xs font-black uppercase tracking-wider text-white hover:bg-white/20 transition"
            >
              All Juneau Excursions →
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
