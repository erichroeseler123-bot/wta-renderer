import type { Metadata } from "next";
import Link from "next/link";
import { getAlaskaGeoFact } from "@/lib/alaskaGeoFacts";
import GeoDirectAnswerCard from "@/components/seo/GeoDirectAnswerCard";

const canonical = "https://www.welcometoalaskatours.com/guides/easy-alaska-shore-excursions";

export const metadata: Metadata = {
  title: "Best Alaska Shore Excursions for Seniors: 2026 Port-by-Port Guide",
  description: "Compare senior-friendly, low-walking, and wheelchair-accessible Alaska cruise excursions in Juneau, Skagway, and Ketchikan. Mobility tiers, pier walking distances, and restroom access.",
  alternates: { canonical },
  openGraph: {
    title: "Best Alaska Shore Excursions for Seniors: 2026 Port-by-Port Guide",
    description: "Compare senior-friendly, low-walking, and wheelchair-accessible Alaska cruise excursions in Juneau, Skagway, and Ketchikan. Mobility tiers, pier walking distances, and restroom access.",
    url: canonical,
    type: "article",
  },
};

const mobilityTiers = [
  {
    tier: "Tier 1: Zero-Walking / Purely Seated Scenic",
    badge: "100% Seated",
    badgeColor: "bg-emerald-100 text-emerald-800 border-emerald-200",
    description: "Guests board directly from the dock area and remain seated in heated, enclosed comfort for the entire excursion. Ideal for travelers who use wheelchairs, canes, or who fatigue quickly.",
    examples: [
      "White Pass & Yukon Route Railroad (Skagway): Step straight from the pier onto vintage coaches with panoramic windows and onboard restrooms.",
      "Misty Fjords Floatplane Flightseeing (Ketchikan): Board directly at the seaplane dock, sit in comfortable window seats, and view 3,000-ft granite fiords from the air.",
      "Covered Heated Catamaran Whale Watching (Juneau): Wide stable catamarans with interior heated salon seating, large viewing windows, and ADA-compliant boarding ramps."
    ],
  },
  {
    tier: "Tier 2: Low-Walking & Flat Boardwalks",
    badge: "Under 500 Steps",
    badgeColor: "bg-sky-100 text-sky-800 border-sky-200",
    description: "Involves gentle strolling on flat wooden boardwalks, paved paths, or packed gravel with benches and rest areas available throughout.",
    examples: [
      "Liarsville Gold Rush Camp & Salmon Bake (Skagway): Flat grounds, covered heated pavilion seating, entertaining melodrama show, and seated gold panning at waist-high troughs.",
      "Gold Creek Salmon Bake (Juneau): Gentle 100-yard paved stroll from the drop-off coach to an open-air heated rainforest dining pavilion with live folk music.",
      "Rainforest Sanctuary & Totem Park (Ketchikan): A flat half-mile elevated wooden boardwalk through towering hemlock and cedar with frequent naturalist stopping points."
    ],
  },
  {
    tier: "Tier 3: Wheelchair & Collapsible Walker Accessible",
    badge: "Accessible Ramps",
    badgeColor: "bg-indigo-100 text-indigo-800 border-indigo-200",
    description: "Operators can stow collapsible wheelchairs or walkers in vehicle luggage bays. Facilities feature ADA ramps, paved viewing decks, and elevator access.",
    examples: [
      "Mendenhall Glacier Visitor Center (Juneau): Paved paths from coach drop-off, elevator access to the second-floor observatory, and paved Photo Point trail (0.3 miles flat).",
      "Ketchikan Duck Tour (Ketchikan): Board the amphibious vehicle via low steps with sturdy handrails; travels downtown streets before splashing into Tongass Narrows for smooth harbor cruising.",
      "Private Sprinter Van / Hummer Charters: Dedicated driver provides step-stools, luggage stowage, and tailors photo stops right at street level."
    ],
  },
  {
    tier: "Tier 4: Excursions to Avoid for Limited Mobility",
    badge: "High Exertion",
    badgeColor: "bg-rose-100 text-rose-800 border-rose-200",
    description: "These excursions require active physical agility, balance, and stamina. Seniors with mobility limitations or joint pain should bypass these activities.",
    examples: [
      "Glacier Moraine Treks: 4 to 6 miles over uneven, slippery glacial scree and boulders with crampons.",
      "Sea Kayak Beach Launches: Requires balancing and stepping into low kayaks across wet, slippery ocean cobblestones.",
      "Steep Alpine Hikes: Trails like Mount Roberts Summit or Upper Dewey Lake have 1,500+ ft elevation gains with exposed tree roots and mud."
    ],
  },
];

const featuredSeniorTours = [
  {
    port: "Juneau",
    title: "Whale Watching Tour (Heated Jetboat)",
    operator: "Alaska Tales",
    price: "From $149",
    mobility: "Tier 1 · Low Step / Ramp Boarding",
    highlights: "Enclosed heated cabin, 360° picture windows, marine restroom onboard, 100% whale sighting guarantee, and direct dock transfers.",
    href: "/tours/alaskatales/47295",
    calendarHref: "/tours/alaskatales/47295/calendar",
  },
  {
    port: "Juneau",
    title: "Gold Creek Salmon Bake",
    operator: "Alaska Travel Adventures",
    price: "From $44",
    mobility: "Tier 2 · Flat Paved Stroll & Seated Dining",
    highlights: "All-you-can-eat wild salmon grilled over alder wood, covered heated rainforest pavilion, live music, marshmallow fire, and low-step motorcoach transit.",
    href: "/tours/aktraveladventures/311581",
    calendarHref: "/tours/aktraveladventures/311581/calendar",
  },
  {
    port: "Skagway",
    title: "Liarsville Gold Rush Trail Camp & Salmon Bake",
    operator: "Alaska Travel Adventures",
    price: "From $71",
    mobility: "Tier 2 · Flat Ground & Seated Panning",
    highlights: "Hilarious live melodrama, seated gold panning at waist-height warm water troughs, all-you-can-eat wild salmon, and covered pavilions.",
    href: "/tours/aktraveladventures/340207",
    calendarHref: "/tours/aktraveladventures/340207/calendar",
  },
  {
    port: "Ketchikan",
    title: "Ketchikan Duck Tour",
    operator: "Ketchikan Duck Tour",
    price: "From $15",
    mobility: "Tier 3 · 90-Min Seated Amphibious Tour",
    highlights: "Sturdy handrails and low steps to board; drives through historic downtown Ketchikan and Creek Street before splashing into the harbor for a calm harbor cruise.",
    href: "/tours/akduck/4161",
    calendarHref: "/tours/akduck/4161/calendar",
  },
  {
    port: "Ketchikan",
    title: "Misty Fjords Flightseeing",
    operator: "Taquan Air",
    price: "From $349",
    mobility: "Tier 1 · Seated DeHavilland Floatplane",
    highlights: "Gentle step onto floatplane pontoon with crew assistance; smooth aerial flight over sheer 3,000-ft granite fiords and alpine lake landing.",
    href: "/tours/taquanair/392949",
    calendarHref: "/tours/taquanair/392949/calendar",
  },
  {
    port: "Ketchikan",
    title: "Rainforest Sanctuary & Totem Park",
    operator: "Alaska Rainforest Sanctuary",
    price: "From $55",
    mobility: "Tier 2 · 0.5-Mile Flat Boardwalk",
    highlights: "Accessible elevated wooden walkways through old-growth forest, master totem carvers, raptor rehabilitation center, and frequent seated rest areas.",
    href: "/tours/alaskarainforest/64273",
    calendarHref: "/tours/alaskarainforest/64273/calendar",
  },
];

const faqs = [
  {
    question: "Can folding wheelchairs and walkers be brought on Alaska shore excursions?",
    answer: "Yes. Most excursion tour vans, minibuses, and motorcoaches can stow collapsible wheelchairs and folding walkers in their lower luggage bays or rear compartments. When booking, note in the reservation that you will have mobility equipment so the operator can reserve storage space and have drivers ready to assist with boarding.",
  },
  {
    question: "Are floatplane flightseeing tours suitable for seniors with limited mobility?",
    answer: "Yes. Boarding a DeHavilland Beaver or Otter floatplane involves stepping down 2 to 3 low steps onto the pontoon and stepping into the cabin. Ground crew and pilots offer hands-on boarding assistance. Once inside, passengers relax in padded forward-facing window seats with noise-canceling headsets for a smooth flight that requires zero walking.",
  },
  {
    question: "Which Alaska cruise port is the easiest for walking and accessibility?",
    answer: "Skagway is widely considered the easiest port for walking because the historic district is completely flat with no hills, laid out in an orderly grid with level wooden boardwalks directly off the cruise docks. Downtown Ketchikan (Berths 1–3) is also very flat and walkable, though Ward Cove (used by NCL) requires a 7-mile transit shuttle bus.",
  },
  {
    question: "Is Mendenhall Glacier accessible for seniors who cannot walk long trails?",
    answer: "Yes. The Mendenhall Glacier Visitor Center is fully ADA compliant with elevator access to the second-floor indoor observation room. From the coach parking lot, a flat paved trail leads to Photo Point (0.3 miles round trip), offering unobstructed views of the glacier face without hiking over rock moraines.",
  },
  {
    question: "Are there restrooms available on senior-friendly excursions?",
    answer: "All major marine whale-watching catamarans, White Pass train coaches, and the Mendenhall Glacier Visitor Center feature clean, accessible restrooms onboard or on site. For smaller aircraft or amphibious duck tours that lack bathrooms, operators ensure clean public facilities are accessible right before boarding and immediately upon return.",
  },
  {
    question: "What is the recommended cruise-safety buffer for senior travelers?",
    answer: "We advise booking excursions that return to the cruise dock at least 60 minutes prior to your ship's scheduled all-aboard time. This additional buffer accommodates slower walking speeds along lengthy piers (such as Skagway's Railroad Dock or Juneau's AJ Dock) and security scanning lines at the gangway.",
  },
];

export default function EasyAlaskaShoreExcursionsPage() {
  const geoFact = getAlaskaGeoFact("all", "easy-alaska-shore-excursions");

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
    headline: "Best Alaska Shore Excursions for Seniors & Low-Walking Port Days",
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

      {/* Hero Header */}
      <section className="bg-[linear-gradient(135deg,#082f49_0%,#0f172a_58%,#164e63_100%)] px-6 py-14 text-white sm:py-20">
        <div className="mx-auto max-w-5xl">
          <Link href="/guides" className="text-sm font-bold text-cyan-200 hover:text-white">
            {"← Alaska Guides Directory"}
          </Link>
          <div className="mt-5 text-[11px] font-black uppercase tracking-[0.22em] text-cyan-200">
            Alaska Cruise Planning Guide · 2026 Edition
          </div>
          <h1 className="mt-3 max-w-4xl text-3xl font-black tracking-tight sm:text-5xl lg:text-6xl">
            Best Alaska Shore Excursions for Seniors &amp; Low-Walking Port Days
          </h1>
          <p className="mt-5 max-w-3xl text-base leading-7 text-slate-200 sm:text-lg">
            An Alaska cruise is the premier multi-generational vacation. You do not need to hike 5 miles across glacier moraines or paddle a sea kayak to witness breathtaking scenery. Compare low-impact excursions across Juneau, Skagway, and Ketchikan categorized by actual mobility demands.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link
              href="#mobility-tiers"
              className="inline-flex min-h-12 items-center justify-center rounded-2xl bg-cyan-300 px-6 py-3 text-sm font-black uppercase tracking-wider text-slate-950 hover:bg-cyan-200 shadow-md transition"
            >
              Explore 4 Mobility Tiers ↓
            </Link>
            <Link
              href="#featured-tours"
              className="inline-flex min-h-12 items-center justify-center rounded-2xl border border-white/20 bg-white/10 px-6 py-3 text-sm font-black uppercase tracking-wider text-white hover:bg-white/20 transition"
            >
              Browse Verified Excursions
            </Link>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-5xl px-6 sm:px-8">
        {/* GEO Fact Direct Answer Card */}
        {geoFact && (
          <div className="mt-8">
            <GeoDirectAnswerCard fact={geoFact} />
          </div>
        )}

        {/* Quick Decision Summary */}
        <section className="mt-8 rounded-[2rem] border border-sky-100 bg-white p-6 shadow-sm sm:p-8">
          <div className="text-[10px] font-black uppercase tracking-[0.2em] text-sky-700">Quick Decision Summary</div>
          <p className="mt-3 text-lg font-bold leading-8 text-slate-900">
            Top low-walking excursions include covered catamaran whale watching ($149–$185) with heated interior salons, scenic Misty Fjords floatplane flights ($349–$395), seated Liarsville salmon bakes with gold panning ($71–$95), and the amphibious Ketchikan Duck Tour ($15–$85). All offer low-step or ramp boarding, luggage stowage for folding mobility aids, and dockside pick-ups.
          </p>
          <div className="mt-4 rounded-xl bg-amber-50 border border-amber-200 p-4 text-xs font-semibold text-amber-900">
            <strong>Senior Cruise Safety Buffer:</strong> For senior cruisers, plan a buffer of at least 60 minutes before all-aboard:{" "}
            <code className="rounded bg-amber-100 px-1 py-0.5 font-mono text-amber-950">tour end time + 60 minutes &le; ship all-aboard time</code>. This provides ample cushion for unhurried walking from vehicle drop-off along the pier to the ship gangway.
          </div>
        </section>

        {/* 4 Mobility Tiers */}
        <section id="mobility-tiers" className="mt-14 space-y-6">
          <div className="space-y-2">
            <span className="text-xs font-black uppercase tracking-wider text-sky-700">Activity Classification</span>
            <h2 className="text-2xl font-black text-slate-950 sm:text-3xl">The 4 Alaska Excursion Mobility Tiers</h2>
            <p className="text-sm leading-6 text-slate-600 max-w-3xl">
              Excursion descriptions often label tours as &ldquo;mild&rdquo; or &ldquo;moderate&rdquo; without clarifying how many steps you will walk or what the terrain looks like. Use these four tiers to match your excursion to your specific physical comfort level:
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {mobilityTiers.map((tier, idx) => (
              <div
                key={idx}
                className="flex flex-col justify-between rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className={`inline-flex rounded-full border px-2.5 py-1 text-[10px] font-black uppercase tracking-wider ${tier.badgeColor}`}>
                      {tier.badge}
                    </span>
                  </div>
                  <h3 className="text-xl font-black text-slate-900 leading-tight">
                    {tier.tier}
                  </h3>
                  <p className="text-sm leading-6 text-slate-600">
                    {tier.description}
                  </p>
                  <ul className="mt-3 space-y-2 text-xs text-slate-700">
                    {tier.examples.map((ex, exIdx) => (
                      <li key={exIdx} className="flex gap-2">
                        <span className="font-bold text-sky-600">✓</span>
                        <span>{ex}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Port-by-Port Senior Mobility Guide */}
        <section className="mt-14 space-y-6">
          <div className="space-y-2">
            <span className="text-xs font-black uppercase tracking-wider text-sky-700">Port-by-Port Realities</span>
            <h2 className="text-2xl font-black text-slate-950 sm:text-3xl">Walking Distances &amp; Dock Logistics by Port</h2>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-3">
              <div className="text-[10px] font-black uppercase tracking-wider text-sky-700">Port of Juneau</div>
              <h3 className="text-lg font-black text-slate-900">Juneau Logistics</h3>
              <p className="text-sm leading-6 text-slate-600">
                Ships dock along Franklin Street or south at AJ Dock. If docked at AJ Dock, a port shuttle bus brings passengers downtown. Excursion meeting spots are right at the Mt. Roberts Tram plaza.
              </p>
              <div className="rounded-xl bg-slate-50 p-3 text-xs text-slate-700 space-y-1">
                <p><strong>Terrain:</strong> Flat downtown waterfront; steep hills begin 3 blocks inland.</p>
                <p><strong>Top Senior Pick:</strong> Heated catamaran whale watching or Gold Creek Salmon Bake.</p>
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-3">
              <div className="text-[10px] font-black uppercase tracking-wider text-sky-700">Port of Skagway</div>
              <h3 className="text-lg font-black text-slate-900">Skagway Logistics</h3>
              <p className="text-sm leading-6 text-slate-600">
                Skagway is completely flat with zero hills. Downtown Broadway features level historic wooden boardwalks. The White Pass train tracks run directly along the cruise piers for easy step-on boarding.
              </p>
              <div className="rounded-xl bg-slate-50 p-3 text-xs text-slate-700 space-y-1">
                <p><strong>Terrain:</strong> 100% flat; Railroad Dock requires a 10-min flat stroll to town.</p>
                <p><strong>Top Senior Pick:</strong> White Pass Railway or Liarsville Gold Rush Camp.</p>
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-3">
              <div className="text-[10px] font-black uppercase tracking-wider text-sky-700">Port of Ketchikan</div>
              <h3 className="text-lg font-black text-slate-900">Ketchikan Logistics</h3>
              <p className="text-sm leading-6 text-slate-600">
                Downtown Berths 1–4 are right at Front Street and Creek Street boardwalks. If sailing NCL or Oceania, ships berth 7 miles north at Ward Cove, requiring a 20-minute motorcoach shuttle into town.
              </p>
              <div className="rounded-xl bg-slate-50 p-3 text-xs text-slate-700 space-y-1">
                <p><strong>Terrain:</strong> Level waterfront; wooden ramps lead to Creek Street.</p>
                <p><strong>Top Senior Pick:</strong> Ketchikan Duck Tour or Misty Fjords Floatplane.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Featured Senior-Friendly Excursions */}
        <section id="featured-tours" className="mt-14 space-y-6">
          <div className="space-y-2">
            <span className="text-xs font-black uppercase tracking-wider text-sky-700">Verified Excursions</span>
            <h2 className="text-2xl font-black text-slate-950 sm:text-3xl">Top Rated Senior-Friendly Tours</h2>
            <p className="text-sm leading-6 text-slate-600 max-w-3xl">
              Each of these excursions features low walking demands, comfortable seating, reliable restroom access, and planned return buffers before ship all-aboard:
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {featuredSeniorTours.map((tour, idx) => (
              <div
                key={idx}
                className="flex flex-col justify-between rounded-3xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition hover:-translate-y-0.5"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-sky-700">{tour.port}</span>
                    <span className="font-black text-slate-900">{tour.price}</span>
                  </div>
                  <h3 className="text-lg font-black text-slate-900 leading-tight">
                    {tour.title}
                  </h3>
                  <div className="space-y-1 text-xs text-slate-500">
                    <p><strong>Operator:</strong> {tour.operator}</p>
                    <p><strong>Mobility:</strong> {tour.mobility}</p>
                  </div>
                  <p className="text-xs leading-5 text-slate-600">
                    {tour.highlights}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 flex flex-wrap gap-2">
                  <Link
                    href={tour.href}
                    className="flex-1 min-h-10 inline-flex items-center justify-center rounded-xl bg-slate-900 px-3 py-2 text-xs font-black uppercase tracking-wider text-white hover:bg-slate-800 transition"
                  >
                    View Tour →
                  </Link>
                  <Link
                    href={tour.calendarHref}
                    className="min-h-10 inline-flex items-center justify-center rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-black uppercase tracking-wider text-slate-700 hover:bg-slate-100 transition"
                  >
                    Calendar
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Practical Equipment & Comfort Advice */}
        <section className="mt-14 rounded-[2.5rem] border border-slate-200 bg-slate-900 p-8 text-white sm:p-10 space-y-6">
          <div className="space-y-2">
            <span className="text-xs font-black uppercase tracking-wider text-cyan-300">Accessibility Advice</span>
            <h2 className="text-2xl font-black sm:text-3xl">Mobility Equipment &amp; Planning Tips</h2>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 text-sm text-slate-300 leading-relaxed">
            <div className="space-y-3">
              <h3 className="text-base font-bold text-white">Collapsible Wheelchairs &amp; Walkers</h3>
              <p>
                Standard motorcoaches and excursion vans can accommodate lightweight collapsible manual wheelchairs and folding rolling walkers in their luggage compartments. Notify operators during checkout so drivers reserve cargo space.
              </p>
              <p>
                Heavy motorized mobility scooters (150+ lbs) generally cannot be stowed on standard tour vans. If you use a motorized scooter, prioritize walking-free shore days in flat port towns or private ADA-adapted accessible van charters.
              </p>
            </div>
            <div className="space-y-3">
              <h3 className="text-base font-bold text-white">Weather &amp; Warmth Consideration</h3>
              <p>
                Because seated excursions involve less physical activity to generate body heat, seniors frequently feel cooler in Southeast Alaska&rsquo;s brisk coastal climate (50°F to 65°F with intermittent rain).
              </p>
              <p>
                Dress in three warm layers: a moisture-wicking base layer, a warm fleece or wool sweater, and a waterproof windbreaker. Catamarans and tour vans are heated, but viewing decks can be chilly.
              </p>
            </div>
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

        {/* Bottom Booking Links */}
        <section className="mt-14 rounded-3xl bg-[linear-gradient(135deg,#082f49_0%,#0f172a_58%,#164e63_100%)] p-8 text-white text-center">
          <h2 className="text-2xl font-black sm:text-3xl">Explore Easy Excursions by Port</h2>
          <p className="mt-3 text-sm text-slate-300 max-w-xl mx-auto">
            Find verified, low-impact shore excursions with planned return buffers and direct pier pick-ups in Juneau, Skagway, and Ketchikan.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-4">
            <Link
              href="/juneau/easy-shore-excursions"
              className="rounded-xl bg-cyan-400 px-5 py-2.5 text-xs font-black uppercase tracking-wider text-slate-950 hover:bg-cyan-300 transition"
            >
              Easy Juneau Excursions →
            </Link>
            <Link
              href="/skagway/easy-shore-excursions"
              className="rounded-xl bg-cyan-400 px-5 py-2.5 text-xs font-black uppercase tracking-wider text-slate-950 hover:bg-cyan-300 transition"
            >
              Easy Skagway Excursions →
            </Link>
            <Link
              href="/ketchikan/easy-shore-excursions"
              className="rounded-xl bg-cyan-400 px-5 py-2.5 text-xs font-black uppercase tracking-wider text-slate-950 hover:bg-cyan-300 transition"
            >
              Easy Ketchikan Excursions →
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
