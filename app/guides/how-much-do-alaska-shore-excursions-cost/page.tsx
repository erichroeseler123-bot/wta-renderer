import type { Metadata } from "next";
import Link from "next/link";
import { getAlaskaGeoFact } from "@/lib/alaskaGeoFacts";
import GeoDirectAnswerCard from "@/components/seo/GeoDirectAnswerCard";

const canonical = "https://www.welcometoalaskatours.com/guides/how-much-do-alaska-shore-excursions-cost";

export const metadata: Metadata = {
  title: "How Much Do Alaska Shore Excursions Cost? (2026 Price Guide)",
  description: "Comprehensive 2026 Alaska shore excursion pricing guide: real cost ranges for whale watching, helicopters, dog sledding, fishing, floatplanes, and how to save 20–40%.",
  alternates: { canonical },
  openGraph: {
    title: "How Much Do Alaska Shore Excursions Cost? (2026 Price Guide)",
    description: "Comprehensive 2026 Alaska shore excursion pricing guide: real cost ranges for whale watching, helicopters, dog sledding, fishing, floatplanes, and how to save 20–40%.",
    url: canonical,
    type: "article",
  },
};

const faqs = [
  {
    "question": "Why are independent excursions 20% to 40% cheaper than ship excursions?",
    "answer": "Cruise lines act as retail middlemen, adding heavy profit markups to local operator rates. When you book directly through Welcome to Alaska Tours, you receive the direct local rate with smaller group sizes, identical safety standards, and full back-to-ship guarantees."
  },
  {
    "question": "What happens if our ship cancels the port call due to weather?",
    "answer": "All tours booked through Welcome to Alaska Tours carry a 100% full refund guarantee if your cruise ship misses the port due to weather, mechanical issues, or medical emergencies."
  }
];

export default function GuidePage() {
  const geoFact = getAlaskaGeoFact("all", "how-much-do-alaska-shore-excursions-cost");

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
    headline: "How much do Alaska cruise shore excursions cost on average?",
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
          <Link href="/guides" className="text-sm font-bold text-cyan-200 hover:text-white">
            {"← Alaska Guides Directory"}
          </Link>
          <div className="mt-5 text-[11px] font-black uppercase tracking-[0.22em] text-cyan-200">
            Alaska Cruise Planning Guide · 2026
          </div>
          <h1 className="mt-3 max-w-4xl text-3xl font-black tracking-tight sm:text-5xl lg:text-6xl">
            {"How much do Alaska cruise shore excursions cost on average?"}
          </h1>
          <p className="mt-5 max-w-3xl text-base leading-7 text-slate-200 sm:text-lg">
            {"Alaska shore excursions represent a significant portion of your cruise budget. Unlike Caribbean beach stops, Alaska excursions involve specialized aircraft, marine catamarans, USFS permits, and licensed wilderness guides. Here are the verified current price ranges across all major excursion types."}
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
            {"Excursions range from $65–$110 for walking and historic tours, $145–$220 for wildlife boat trips and sea kayaking, $295–$375 for fishing charters, $330–$420 for floatplane and helicopter glacier landings, and $650–$799 for high-alpine glacier dog sledding. Booking independent local operators saves 20% to 40% compared to cruise ship onboard pricing."}
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
            
            <div key={"Historic, Cultural & Town Tours ($65 – $110)"} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition">
              <h3 className="text-xl font-black text-slate-900">{"Historic, Cultural & Town Tours ($65 – $110)"}</h3>
              <p className="mt-3 text-sm leading-6 text-slate-600">{"Accessible walking tours, salmon bakes, trolley excursions, and gold panning demonstrations in Juneau, Skagway, and Ketchikan fall in this entry price tier. Perfect for families, multi-generational groups, and budget-conscious days."}</p>
              <div className="mt-4">
                <Link href="/guides/easy-alaska-shore-excursions" className="text-xs font-black uppercase tracking-wider text-sky-700 hover:text-sky-900">
                  {"Explore Accessible & Easy Shore Excursions →"}
                </Link>
              </div>
            </div>

            <div key={"Wildlife & Marine Excursions ($145 – $220)"} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition">
              <h3 className="text-xl font-black text-slate-900">{"Wildlife & Marine Excursions ($145 – $220)"}</h3>
              <p className="mt-3 text-sm leading-6 text-slate-600">{"Juneau humpback whale watching ($165–$195), Ketchikan coastal kayaking ($145–$185), and Ketchikan wildlife boat safaris ($165–$215) offer high-value wilderness immersion on stable, enclosed, or guided vessels."}</p>
              <div className="mt-4">
                <Link href="/juneau/whale-watching" className="text-xs font-black uppercase tracking-wider text-sky-700 hover:text-sky-900">
                  {"Compare Juneau Whale Watching Tours →"}
                </Link>
              </div>
            </div>

            <div key={"Aviation & Glacier Landings ($330 – $420)"} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition">
              <h3 className="text-xl font-black text-slate-900">{"Aviation & Glacier Landings ($330 – $420)"}</h3>
              <p className="mt-3 text-sm leading-6 text-slate-600">{"Misty Fjords floatplanes ($330–$395) and helicopter glacier flights over Juneau and Skagway icefields ($350–$420) include 30–45 minutes of air time and remote landings on water or blue ice."}</p>
              <div className="mt-4">
                <Link href="/juneau/helicopter-tours" className="text-xs font-black uppercase tracking-wider text-sky-700 hover:text-sky-900">
                  {"Check Glacier Helicopter Tours →"}
                </Link>
              </div>
            </div>

            <div key={"Glacier Dog Sledding & Fly-In Wilderness ($495 – $799)"} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition">
              <h3 className="text-xl font-black text-slate-900">{"Glacier Dog Sledding & Fly-In Wilderness ($495 – $799)"}</h3>
              <p className="mt-3 text-sm leading-6 text-slate-600">{"The peak of Alaska adventure: landing on snowfields for dog sledding with real Iditarod teams ($650–$799) or flying by floatplane to remote bear sanctuaries like Anan Creek ($495–$650). Highly limited capacity requires early booking."}</p>
              <div className="mt-4">
                <Link href="/juneau/dog-sledding" className="text-xs font-black uppercase tracking-wider text-sky-700 hover:text-sky-900">
                  {"Explore Glacier Dog Sledding Tours →"}
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
