import type { Metadata } from "next";
import Link from "next/link";
import { getAlaskaGeoFact } from "@/lib/alaskaGeoFacts";
import GeoDirectAnswerCard from "@/components/seo/GeoDirectAnswerCard";

const canonical = "https://www.welcometoalaskatours.com/guides/juneau-private-whale-watching-charters";

export const metadata: Metadata = {
  title: "Private Charters for Whale Watching in Juneau AK: 2026 Guide & Boat Comparison",
  description: "Compare private whale watching charters in Juneau, AK for cruise passengers. Verified vessel sizes (6 to 14+), pricing ($1,150–$3,500), Auke Bay marina logistics, and back-to-ship timing.",
  alternates: { canonical },
  openGraph: {
    title: "Private Charters for Whale Watching in Juneau AK: 2026 Guide & Boat Comparison",
    description: "Compare private whale watching charters in Juneau, AK for cruise passengers. Verified vessel sizes (6 to 14+), pricing ($1,150–$3,500), Auke Bay marina logistics, and back-to-ship timing.",
    url: canonical,
    type: "article",
  },
};

const charterTours = [
  {
    title: "Private Whale Watch",
    operator: "Alaska Galore Juneau Whale Watching",
    price: "From $1,150",
    capacity: "Groups up to 49 guests",
    duration: "Approx. 3.5 Hours (2+ hours on water)",
    description: "Only your group and the captain and crew on board! Ideal for extended family groups, reunions, or private cruise parties wanting dedicated vessel charter pricing.",
    href: "/tours/alaska-galore-juneau-whale-watching/585456",
    calendarHref: "/tours/alaska-galore-juneau-whale-watching/585456/calendar",
    tag: "Lowest Private Charter Base Rate",
    badgeColor: "bg-emerald-100 text-emerald-800 border-emerald-200",
  },
  {
    title: "Private Charter Whale Watching Tour",
    operator: "Alaska Tales",
    price: "From $2,700",
    capacity: "Up to 14 guests (1 flat rate)",
    duration: "3.5 Hours Total (2 Full Hours on Water)",
    description: "A dedicated high-speed heated jetboat with 2 outdoor viewing decks, heated cabin, marine restroom onboard, and private round-trip transportation from the cruise docks. 100% guaranteed whale sightings.",
    href: "/tours/alaskatales/273539",
    calendarHref: "/tours/alaskatales/273539/calendar",
    tag: "Most Popular Jetboat Charter",
    badgeColor: "bg-sky-100 text-sky-800 border-sky-200",
  },
  {
    title: "Private Charter Whale Watching & Mendenhall Glacier Tour",
    operator: "Alaska Tales",
    price: "From $3,500",
    capacity: "Up to 14 guests (1 flat rate)",
    duration: "4.5 Hours Total (Glacier + Water Time)",
    description: "Combines private guided transfer to Mendenhall Glacier (45 minutes on site to view Nugget Falls and the visitor center) followed by a 2-hour private whale watching cruise on Auke Bay. Guaranteed whale sightings.",
    href: "/tours/alaskatales/273545",
    calendarHref: "/tours/alaskatales/273545/calendar",
    tag: "Whale + Glacier Combo",
    badgeColor: "bg-indigo-100 text-indigo-800 border-indigo-200",
  },
  {
    title: "Private Charter • Salmon / Halibut / Whale Watching Combo",
    operator: "Moore Charters",
    price: "From $2,125",
    capacity: "Small private group",
    duration: "Half-Day Marine Charter (May 1 – Sept 30)",
    description: "Experience both active sportfishing (salmon or halibut) and world-class whale watching on a dedicated private boat with experienced local Juneau skippers.",
    href: "/tours/moorecharters/446031",
    calendarHref: "/tours/moorecharters/446031/calendar",
    tag: "Fishing + Whales Combo",
    badgeColor: "bg-amber-100 text-amber-800 border-amber-200",
  },
];

const pricingBreakdown = [
  { groupSize: "4 Passengers", totalCost: "$2,700", perPerson: "$675", notes: "VIP luxury experience; maximum space and 360° photo rail access" },
  { groupSize: "6 Passengers", totalCost: "$2,700", perPerson: "$450", notes: "Comparable to boutique 6-pack tours with an entire private jetboat" },
  { groupSize: "8 Passengers", totalCost: "$2,700", perPerson: "$338", notes: "Great value for two families or multi-generational groups" },
  { groupSize: "10 Passengers", totalCost: "$2,700", perPerson: "$270", notes: "Approaching standard large-boat cruise excursion rates" },
  { groupSize: "12 Passengers", totalCost: "$2,700", perPerson: "$225", notes: "Matches commercial cattle-boat pricing with 100% private exclusivity" },
  { groupSize: "14 Passengers (Full Boat)", totalCost: "$2,700", perPerson: "$193", notes: "Below typical cruise-ship whale watch ticket prices ($199–$249)" },
];

const faqs = [
  {
    question: "How many people fit on a private whale watching charter in Juneau, AK?",
    answer: "Most private whale watching charters in Juneau accommodate between 6 and 14 passengers. For instance, Alaska Tales operates custom heated jetboats certified for up to 14 guests at one flat charter rate. For larger gatherings or wedding parties, Alaska Galore offers private vessels that can host groups up to 49 passengers.",
  },
  {
    question: "How much does a private whale watching boat charter cost per person in Juneau?",
    answer: "Private boat charters are priced per vessel, not per seat. Dedicated private jetboat charters cost from $2,700 (or $3,500 including Mendenhall Glacier). When split among a party of 10 to 14 guests, this equals $193 to $270 per person—virtually identical to the $185 to $245 charged per ticket on 100-to-150-passenger cruise ship excursions.",
  },
  {
    question: "Are whale sightings guaranteed on private boat charters?",
    answer: "Operators like Alaska Tales offer a 100% whale sighting guarantee on their scheduled private charters from May through September. Humpback whales migrate to the nutrient-dense waters of Auke Bay, Favorite Channel, and Lynn Canal each summer, making daily sightings virtually certain across Juneau marine waters.",
  },
  {
    question: "Can we combine a private whale charter with Mendenhall Glacier?",
    answer: "Yes. Alaska Tales offers a dedicated 4.5-hour private charter ($3,500 for up to 14 guests) that includes private curbside dock pickup, a private transfer to Mendenhall Glacier Recreation Area for 45 minutes of exploration, and 2 full hours on the water in Auke Bay.",
  },
  {
    question: "Where do we meet our private charter at the Juneau cruise docks?",
    answer: "Private charters provide dedicated curbside pickup at the downtown Juneau cruise berths (Franklin Dock, Steamship Wharf, Intermediate Vessel Float, or the AJ Dock). Meeting instructions typically direct you to the Mt. Roberts Tramway plaza or berth gate, where a private driver transfers your group 20 minutes north to Don D. Statter Harbor in Auke Bay.",
  },
  {
    question: "What amenities are on board the private charter boats?",
    answer: "Private jetboats feature an enclosed, heated cabin with large wraparound viewing windows, a clean marine head (restroom), walk-around bow and stern viewing decks, comfortable table seating, and complimentary light snacks and beverages. Because it is your private charter, you can ask the captain to linger at breach sites or listen on the underwater hydrophone whenever you wish.",
  },
  {
    question: "What happens if our cruise ship arrives late or misses Juneau entirely?",
    answer: "Independent private charter operators track marine AIS traffic and cruise schedules closely. If your ship is delayed, your private captain adjusts departure timing to match your window. In the rare event your ship cancels its Juneau port call due to mechanical or weather issues, you receive a 100% full refund.",
  },
];

export default function JuneauPrivateWhaleWatchingPage() {
  const geoFact = getAlaskaGeoFact("juneau", "juneau-private-whale-watching-charters");

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
    headline: "Private Charters for Whale Watching in Juneau, AK: 2026 Guide & Boat Comparison",
    description: metadata.description,
    datePublished: "2026-09-23",
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
            Private Charters &amp; Custom Excursions · Juneau, AK
          </div>
          <h1 className="mt-3 max-w-4xl text-3xl font-black tracking-tight sm:text-5xl lg:text-6xl">
            Private Charters for Whale Watching in Juneau, AK
          </h1>
          <p className="mt-5 max-w-3xl text-base leading-7 text-slate-200 sm:text-lg">
            Escape the 150-passenger cruise ship catamarans. Discover how a private boat charter provides unobstructed viewing rails, custom wildlife tracking in Favorite Channel, dedicated captain and naturalist attention, and equal or lower per-person pricing for groups of 6 to 14.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link
              href="/ports/juneau"
              className="inline-flex min-h-12 items-center justify-center rounded-2xl bg-cyan-300 px-6 py-3 text-sm font-black uppercase tracking-wider text-slate-950 hover:bg-cyan-200 shadow-md transition"
            >
              All Juneau Excursions →
            </Link>
            <Link
              href="#verified-charters"
              className="inline-flex min-h-12 items-center justify-center rounded-2xl border border-white/20 bg-white/10 px-6 py-3 text-sm font-black uppercase tracking-wider text-white hover:bg-white/20 transition"
            >
              Compare Boats &amp; Rates ↓
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
            A private whale watching charter in Juneau guarantees that your party has the boat entirely to yourselves. Available options range from flat-rate 14-passenger custom heated jetboats ($2,700 standalone / $3,500 with Mendenhall Glacier) to scalable group vessels starting at $1,150. For groups of 8 to 14, private charters cost $193 to $338 per person—rivaling crowded commercial tours while offering custom departure times and dedicated dockside pickups.
          </p>
          <div className="mt-4 rounded-xl bg-amber-50 border border-amber-200 p-4 text-xs font-semibold text-amber-900">
            <strong>Cruise Safety Buffer:</strong> Plan a buffer of at least 60 minutes before all-aboard:{" "}
            <code className="rounded bg-amber-100 px-1 py-0.5 font-mono text-amber-950">tour end time + 60 minutes &le; ship all-aboard time</code>. Private vans return your group directly to your cruise berth area.
          </div>
        </section>

        {/* Per-Person Pricing Math Breakdown */}
        <section className="mt-12 space-y-6">
          <div className="space-y-2">
            <span className="text-xs font-black uppercase tracking-wider text-sky-700">Cost Transparency</span>
            <h2 className="text-2xl font-black text-slate-950 sm:text-3xl">Private Charter vs. Shared Tour Math</h2>
            <p className="text-sm leading-6 text-slate-600 max-w-3xl">
              Many cruisers assume private charters are only for ultra-luxury budgets. Because Juneau private charters charge a single flat rate for the vessel (e.g., $2,700 for up to 14 passengers on a heated jetboat), the per-person cost drops rapidly as your party size grows:
            </p>
          </div>

          <div className="overflow-x-auto rounded-3xl border border-slate-200 bg-white shadow-sm">
            <table className="w-full text-left text-sm text-slate-700">
              <thead className="border-b border-slate-200 bg-slate-50 text-xs font-black uppercase tracking-wider text-slate-900">
                <tr>
                  <th className="px-5 py-4">Group Size</th>
                  <th className="px-5 py-4">Total Vessel Cost</th>
                  <th className="px-5 py-4">Cost Per Person</th>
                  <th className="px-5 py-4">Comparison &amp; Experience</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {pricingBreakdown.map((row, idx) => (
                  <tr key={idx} className={idx % 2 === 1 ? "bg-slate-50/50" : ""}>
                    <td className="px-5 py-4 font-bold text-slate-900">{row.groupSize}</td>
                    <td className="px-5 py-4 font-semibold text-slate-900">{row.totalCost}</td>
                    <td className="px-5 py-4 font-black text-sky-700">{row.perPerson}</td>
                    <td className="px-5 py-4 text-xs text-slate-600">{row.notes}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-slate-500 italic">
            *Based on Alaska Tales 14-passenger private charter ($2,700). Includes 2 full hours on the water, private transfers, naturalist, and 100% sighting guarantee.
          </p>
        </section>

        {/* Verified Private Charters Directory */}
        <section id="verified-charters" className="mt-14 space-y-6">
          <div className="space-y-2">
            <span className="text-xs font-black uppercase tracking-wider text-sky-700">Verified Operators</span>
            <h2 className="text-2xl font-black text-slate-950 sm:text-3xl">Available Juneau Private Boat Charters</h2>
            <p className="text-sm leading-6 text-slate-600 max-w-3xl">
              All listed charters are verified Juneau-based operators departing from Don D. Statter Harbor (Auke Bay) with coordinated cruise ship timing and real-time availability:
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {charterTours.map((tour, idx) => (
              <div
                key={idx}
                className="flex flex-col justify-between rounded-3xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition hover:-translate-y-0.5"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className={`inline-flex rounded-full border px-2.5 py-1 text-[10px] font-black uppercase tracking-wider ${tour.badgeColor}`}>
                      {tour.tag}
                    </span>
                    <span className="text-lg font-black text-slate-950">{tour.price}</span>
                  </div>
                  <h3 className="text-xl font-black text-slate-900 leading-tight">
                    {tour.title}
                  </h3>
                  <div className="space-y-1 text-xs text-slate-500">
                    <p><strong>Operator:</strong> {tour.operator}</p>
                    <p><strong>Capacity:</strong> {tour.capacity}</p>
                    <p><strong>Duration:</strong> {tour.duration}</p>
                  </div>
                  <p className="text-sm leading-6 text-slate-600">
                    {tour.description}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 flex flex-wrap gap-2">
                  <Link
                    href={tour.href}
                    className="flex-1 min-h-11 inline-flex items-center justify-center rounded-xl bg-slate-900 px-4 py-2 text-xs font-black uppercase tracking-wider text-white hover:bg-slate-800 transition"
                  >
                    View Tour Details →
                  </Link>
                  <Link
                    href={tour.calendarHref}
                    className="min-h-11 inline-flex items-center justify-center rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-xs font-black uppercase tracking-wider text-slate-700 hover:bg-slate-100 transition"
                  >
                    Live Calendar
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Private vs Shared: Key Differences */}
        <section className="mt-14 space-y-6">
          <div className="space-y-2">
            <span className="text-xs font-black uppercase tracking-wider text-sky-700">Excursion Comparison</span>
            <h2 className="text-2xl font-black text-slate-950 sm:text-3xl">Private Charter vs. 150-Passenger Ship Boat</h2>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="text-lg font-black text-slate-900">Unobstructed 360° Viewing</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                On large commercial catamarans, 100+ passengers rush to one side of the boat whenever a whale surfaces, creating 3-deep crowds at the rail. On a private charter, every guest has instant rail access and clear photo lines.
              </p>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="text-lg font-black text-slate-900">Tailored Route &amp; Wildlife Pacing</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Commercial boats follow rigid time checkpoints. Private captains can alter direction to investigate bubble-net feeding alerts, spend extra time with active orcas, or pull up close to Steller sea lion haulouts at Benjamin Island.
              </p>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="text-lg font-black text-slate-900">Dedicated Naturalist Attention</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Rather than listening to a public-address speaker over boat engine noise, your group converses directly with the captain and naturalist. Kids can ask questions, inspect baleen samples, and listen to the underwater hydrophone at leisure.
              </p>
            </div>
          </div>
        </section>

        {/* Port Logistics & Cruise Dock Timing */}
        <section className="mt-14 rounded-[2.5rem] border border-slate-200 bg-slate-900 p-8 text-white sm:p-10 space-y-6">
          <div className="space-y-2">
            <span className="text-xs font-black uppercase tracking-wider text-cyan-300">Dock Logistics</span>
            <h2 className="text-2xl font-black sm:text-3xl">How Private Charter Pickups Work in Juneau</h2>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 text-sm text-slate-300 leading-relaxed">
            <div className="space-y-3">
              <h3 className="text-base font-bold text-white">Direct Dock Curbside Meetup</h3>
              <p>
                Whether your ship berths at the Mt. Roberts Tramway (Franklin Dock / Cruise Terminal Dock / Steamship Wharf) or south at AJ Dock, private charters provide dedicated ground transport. Your driver meets your group directly at the designated excursion zone right past ship security.
              </p>
              <p>
                You avoid queuing with hundreds of cruise passengers for shared coach buses. Your private passenger van departs immediately once your party is assembled.
              </p>
            </div>
            <div className="space-y-3">
              <h3 className="text-base font-bold text-white">Auke Bay Marina &amp; Return Safety</h3>
              <p>
                Tours depart from Don D. Statter Harbor in Auke Bay, approximately 13 miles (20 to 25 minutes) north along Egan Drive. This protected harbor provides immediate, sheltered access to Favorite Channel, Saginaw Channel, and Lynn Canal.
              </p>
              <p>
                Private charters coordinate your departure based on your ship’s confirmed arrival and ensure return to the dock area with a planned 60-to-90-minute buffer before all-aboard time.
              </p>
            </div>
          </div>
        </section>

        {/* FAQs Section */}
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

        {/* Bottom Booking CTA */}
        <section className="mt-14 rounded-3xl bg-[linear-gradient(135deg,#082f49_0%,#0f172a_58%,#164e63_100%)] p-8 text-white text-center">
          <h2 className="text-2xl font-black sm:text-3xl">Reserve Your Juneau Private Whale Charter</h2>
          <p className="mt-3 text-sm text-slate-300 max-w-xl mx-auto">
            Private vessels sell out months in advance for peak Alaska cruise months (June through August). Check real-time calendar availability or browse all Juneau excursions.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-4">
            <Link
              href="/tours/alaskatales/273539/calendar"
              className="rounded-xl bg-cyan-400 px-6 py-3 text-xs font-black uppercase tracking-wider text-slate-950 hover:bg-cyan-300 transition shadow-md"
            >
              14-Guest Private Jetboat Calendar →
            </Link>
            <Link
              href="/ports/juneau"
              className="rounded-xl border border-white/20 bg-white/10 px-6 py-3 text-xs font-black uppercase tracking-wider text-white hover:bg-white/20 transition"
            >
              All Juneau Port Tours
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
