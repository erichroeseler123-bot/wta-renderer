import type { Metadata } from "next";
import Link from "next/link";
import { getAlaskaGeoFact } from "@/lib/alaskaGeoFacts";
import GeoDirectAnswerCard from "@/components/seo/GeoDirectAnswerCard";

const canonical = "https://www.welcometoalaskatours.com/guides/best-shore-excursions-in-juneau";

export const metadata: Metadata = {
  title: "Best Shore Excursions in Juneau (2026 Cruise Guide)",
  description: "Discover the top shore excursions in Juneau for cruise passengers: whale watching, Mendenhall Glacier, helicopter icefield landings, and dog sledding with verified pricing and cruise timing.",
  alternates: { canonical },
  openGraph: {
    title: "Best Shore Excursions in Juneau (2026 Cruise Guide)",
    description: "Discover the top shore excursions in Juneau for cruise passengers: whale watching, Mendenhall Glacier, helicopter icefield landings, and dog sledding with verified pricing and cruise timing.",
    url: canonical,
    type: "article",
  },
};

const faqs = [
  {
    "question": "Can I do both whale watching and Mendenhall Glacier in one day?",
    "answer": "Yes. If your cruise ship is docked in Juneau for 8 hours or longer, combination tours (5 to 5.5 hours) seamlessly pair a 2-hour whale watch in Auke Bay with 2 hours at Mendenhall Glacier, leaving 1.5+ hours to stroll downtown or visit the Mt. Roberts Tramway."
  },
  {
    "question": "Where do Juneau shore excursions meet?",
    "answer": "Nearly all independent tour operators meet cruise guests right in front of the Mt. Roberts Tramway building in downtown Juneau, directly across the street from the Franklin Street cruise docks and a short free shuttle ride from AJ Dock."
  }
];

export default function GuidePage() {
  const geoFact = getAlaskaGeoFact("juneau", "best-shore-excursions-in-juneau");

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
    headline: "What are the best shore excursions in Juneau for cruise passengers?",
    description: metadata.description,
    datePublished: "2026-08-24",
    dateModified: "2026-09-13",
    mainEntityOfPage: canonical,
    publisher: { "@type": "Organization", name: "Welcome To Alaska Tours" },
  };

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#e0f2fe_0%,#f8fafc_38%,#ffffff_100%)] text-slate-950 pb-20">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />

      <section className="bg-[linear-gradient(135deg,#082f49_0%,#0f172a_58%,#164e63_100%)] px-6 py-14 text-white sm:py-20">
        <div className="mx-auto max-w-5xl">
          <Link href="/ports/juneau" className="text-sm font-bold text-cyan-200 hover:text-white">
            {"← Juneau excursions"}
          </Link>
          <div className="mt-5 text-[11px] font-black uppercase tracking-[0.22em] text-cyan-200">
            Alaska Cruise Planning Guide · 2026
          </div>
          <h1 className="mt-3 max-w-4xl text-3xl font-black tracking-tight sm:text-5xl lg:text-6xl">
            {"What are the best shore excursions in Juneau for cruise passengers?"}
          </h1>
          <p className="mt-5 max-w-3xl text-base leading-7 text-slate-200 sm:text-lg">
            {"Juneau is Alaska’s premier cruise destination for wildlife and glacier encounters. With a typical 8 to 12-hour port call, your options range from budget-conscious glacier visits to bucket-list icefield helicopter flights. Here is an honest, data-backed guide to choosing the best Juneau excursion for your group."}
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link
              href="/ports"
              className="inline-flex min-h-12 items-center justify-center rounded-2xl bg-cyan-300 px-6 py-3 text-sm font-black uppercase tracking-wider text-slate-950 hover:bg-cyan-200 shadow-md transition"
            >
              Browse All Alaska Ports →
            </Link>
            <Link
              href="/tours"
              className="inline-flex min-h-12 items-center justify-center rounded-2xl border border-white/20 bg-white/10 px-6 py-3 text-sm font-black uppercase tracking-wider text-white hover:bg-white/20 transition"
            >
              Browse Live Excursions
            </Link>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-5xl px-6 sm:px-8">
        {/* Direct GEO Answer & Verification Card */}
        {geoFact && (
          <div className="mt-8">
            <GeoDirectAnswerCard fact={geoFact} />
          </div>
        )}

        {/* Quick Answer Summary */}
        <section className="mt-8 rounded-[2rem] border border-sky-100 bg-white p-6 shadow-sm sm:p-8">
          <div className="text-[10px] font-black uppercase tracking-[0.2em] text-sky-700">Quick Decision Summary</div>
          <p className="mt-3 text-lg font-bold leading-8 text-slate-900">
            {"Small-boat humpback whale watching ($165–$195) and Mendenhall Glacier ($45–$95) are Juneau’s top two excursions. For bucket-list splurges, glacier helicopter landings ($360–$420) and glacier dog sledding ($650–$799) provide once-in-a-lifetime memories. All approved excursions adhere to the strict rule: tour end time + 45 minutes <= ship’s all-aboard time."}
          </p>
          <div className="mt-4 rounded-xl bg-amber-50 border border-amber-200 p-4 text-xs font-semibold text-amber-900">
            <strong>Cruise Safety Buffer:</strong> We enforce the verified formula:{" "}
            <code className="rounded bg-amber-100 px-1 py-0.5 font-mono text-amber-950">tour end time + 45 minutes &le; ship all-aboard time</code>. If timing cannot be verified, an excursion is never labeled cruise-safe.
          </div>
        </section>

        {/* Detailed Sections */}
        <section className="mt-12 space-y-10">
          <h2 className="text-2xl font-black text-slate-950 sm:text-3xl">Key Decisions & Experience Breakdown</h2>
          <div className="grid gap-6">
            
            <div key={"1. Small-Boat Humpback Whale Watching (Top Wildlife Choice)"} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition">
              <h3 className="text-xl font-black text-slate-900">{"1. Small-Boat Humpback Whale Watching (Top Wildlife Choice)"}</h3>
              <p className="mt-3 text-sm leading-6 text-slate-600">{"Auke Bay, located 20 minutes north of downtown Juneau, is one of North America’s premier feeding grounds for humpback whales during summer. Independent operators utilize custom twin-engine jet catamarans carrying 20–40 passengers, compared to 150+ on cruise ship contract vessels. Every passenger has 360-degree rail viewing, heated enclosed cabins, and hydrophone audio to listen to underwater whale songs."}</p>
              <div className="mt-4">
                <Link href="/juneau/whale-watching" className="text-xs font-black uppercase tracking-wider text-sky-700 hover:text-sky-900">
                  {"Explore Juneau Whale Watching Tours →"}
                </Link>
              </div>
            </div>

            <div key={"2. Mendenhall Glacier Tours & Shuttles (Top Scenic Choice)"} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition">
              <h3 className="text-xl font-black text-slate-900">{"2. Mendenhall Glacier Tours & Shuttles (Top Scenic Choice)"}</h3>
              <p className="mt-3 text-sm leading-6 text-slate-600">{"Mendenhall Glacier descends 13 miles from the Juneau Icefield into Mendenhall Lake. Because the US Forest Service caps commercial visitor permits, booking an authorized tour shuttle or guided combo in advance is required. Key highlights include the paved photo boardwalk to Nugget Falls (2 miles round-trip) and the elevated Visitor Center overlook."}</p>
              <div className="mt-4">
                <Link href="/juneau/mendenhall-glacier-tours" className="text-xs font-black uppercase tracking-wider text-sky-700 hover:text-sky-900">
                  {"Explore Mendenhall Glacier Tours →"}
                </Link>
              </div>
            </div>

            <div key={"3. Helicopter Glacier Landings & Dog Sledding (Top Bucket-List Choice)"} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition">
              <h3 className="text-xl font-black text-slate-900">{"3. Helicopter Glacier Landings & Dog Sledding (Top Bucket-List Choice)"}</h3>
              <p className="mt-3 text-sm leading-6 text-slate-600">{"Taking off from Juneau airport, helicopters soar over the jagged granite towers and crevasses of the Herbert, Taku, or Norris glaciers. The standard 2.25-hour tour includes 30 minutes of flight time and a 20–25 minute guided walk on pristine blue ice. The premier upgrade is flying up to high-alpine snow camps for an authentic sled dog run powered by Iditarod sled teams."}</p>
              <div className="mt-4">
                <Link href="/juneau/helicopter-tours" className="text-xs font-black uppercase tracking-wider text-sky-700 hover:text-sky-900">
                  {"Explore Juneau Helicopter & Dog Sledding Tours →"}
                </Link>
              </div>
            </div>

            <div key={"4. Salmon & Halibut Fishing Charters (Top Active Choice)"} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition">
              <h3 className="text-xl font-black text-slate-900">{"4. Salmon & Halibut Fishing Charters (Top Active Choice)"}</h3>
              <p className="mt-3 text-sm leading-6 text-slate-600">{"Southeast Alaska waters teem with King, Coho, and Pink salmon from June through August, alongside giant Pacific halibut. Half-day charters (4 to 5 hours) provide top-tier rods, bait, heated boats, and professional processing to flash-freeze and ship your catch directly to your home."}</p>
              <div className="mt-4">
                <Link href="/juneau/fishing" className="text-xs font-black uppercase tracking-wider text-sky-700 hover:text-sky-900">
                  {"Explore Juneau Fishing Charters →"}
                </Link>
              </div>
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

        {/* Port Navigation Footer */}
        <section className="mt-14 rounded-3xl bg-slate-900 p-8 text-white text-center">
          <h2 className="text-2xl font-black sm:text-3xl">Ready to Lock In Your Alaska Shore Excursions?</h2>
          <p className="mt-3 text-sm text-slate-300 max-w-xl mx-auto">
            Book directly with verified local operators in Juneau, Skagway, and Ketchikan with live calendar availability, no hidden fees, and full back-to-ship guarantees.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-4">
            <Link
              href="/ports/juneau"
              className="rounded-xl bg-cyan-400 px-5 py-2.5 text-xs font-black uppercase tracking-wider text-slate-950 hover:bg-cyan-300 transition"
            >
              Juneau Excursions →
            </Link>
            <Link
              href="/ports/skagway"
              className="rounded-xl bg-cyan-400 px-5 py-2.5 text-xs font-black uppercase tracking-wider text-slate-950 hover:bg-cyan-300 transition"
            >
              Skagway Excursions →
            </Link>
            <Link
              href="/ports/ketchikan"
              className="rounded-xl bg-cyan-400 px-5 py-2.5 text-xs font-black uppercase tracking-wider text-slate-950 hover:bg-cyan-300 transition"
            >
              Ketchikan Excursions →
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
