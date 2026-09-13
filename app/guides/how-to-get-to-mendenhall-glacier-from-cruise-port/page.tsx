import type { Metadata } from "next";
import Link from "next/link";
import { getAlaskaGeoFact } from "@/lib/alaskaGeoFacts";
import GeoDirectAnswerCard from "@/components/seo/GeoDirectAnswerCard";

const canonical = "https://www.welcometoalaskatours.com/guides/how-to-get-to-mendenhall-glacier-from-cruise-port";

export const metadata: Metadata = {
  title: "How to Get to Mendenhall Glacier from Juneau Cruise Port",
  description: "Complete guide on how to get from Juneau cruise docks to Mendenhall Glacier: commercial shuttles, tour buses, taxi shortages, city bus walking distance, and permit limits.",
  alternates: { canonical },
  openGraph: {
    title: "How to Get to Mendenhall Glacier from Juneau Cruise Port",
    description: "Complete guide on how to get from Juneau cruise docks to Mendenhall Glacier: commercial shuttles, tour buses, taxi shortages, city bus walking distance, and permit limits.",
    url: canonical,
    type: "article",
  },
};

const faqs = [
  {
    "question": "How long do you need at Mendenhall Glacier?",
    "answer": "Plan for 2 to 2.5 hours on site. This allows 45 minutes to walk to Nugget Falls and back, 30 minutes to explore the Visitor Center exhibits and theatre, and 30 minutes for scenic photographs and trail strolling."
  },
  {
    "question": "Are there public shuttles without advance reservations?",
    "answer": "Due to US Forest Service permit caps instituted in recent years, walk-up shuttle ticket booths at the docks frequently sell out early in the morning. Advance reservations are essential."
  }
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
    headline: "How do I get to Mendenhall Glacier from the cruise port without getting stranded?",
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
            {"How do I get to Mendenhall Glacier from the cruise port without getting stranded?"}
          </h1>
          <p className="mt-5 max-w-3xl text-base leading-7 text-slate-200 sm:text-lg">
            {"Mendenhall Glacier is located 13 miles northwest of the downtown Juneau cruise docks. Getting there requires careful planning because Juneau has unique logistical constraints: strict Forest Service visitor permit limits and a severe shortage of local taxis and rideshare drivers."}
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
            {"Book an authorized commercial shuttle or guided tour ($45–$95) in advance. Do not rely on Uber, Lyft, or local taxis for your return trip, as cellular reception at the glacier is spotty and drivers are scarce. The Juneau municipal bus drops passengers 1.5 miles from the visitor center, requiring a 3-mile round-trip walk along the highway."}
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
            
            <div key={"Option 1: Authorized Tour Shuttles (Recommended)"} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition">
              <h3 className="text-xl font-black text-slate-900">{"Option 1: Authorized Tour Shuttles (Recommended)"}</h3>
              <p className="mt-3 text-sm leading-6 text-slate-600">{"Commercial operators with US Forest Service permits run dedicated shuttle vans and motorcoaches between the Mt. Roberts Tramway parking lot and the Mendenhall Glacier Visitor Center. Shuttles run on fixed schedules, include your USFS entrance pass, and guarantee your return seat back to port well ahead of all-aboard."}</p>
              <div className="mt-4">
                <Link href="/juneau/mendenhall-glacier-tours" className="text-xs font-black uppercase tracking-wider text-sky-700 hover:text-sky-900">
                  {"Book Guaranteed Mendenhall Glacier Transport →"}
                </Link>
              </div>
            </div>

            <div key={"Option 2: Whale Watching & Mendenhall Combos (Best Value)"} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition">
              <h3 className="text-xl font-black text-slate-900">{"Option 2: Whale Watching & Mendenhall Combos (Best Value)"}</h3>
              <p className="mt-3 text-sm leading-6 text-slate-600">{"If you want to see wildlife and the glacier without juggling two separate transport reservations, book a combined excursion. One operator coordinates your pick-up at the dock, takes you to Auke Bay for whale watching, transfers you directly to the glacier, and returns you downtown with 60+ minutes to spare."}</p>
              <div className="mt-4">
                <Link href="/juneau/whale-watching" className="text-xs font-black uppercase tracking-wider text-sky-700 hover:text-sky-900">
                  {"View Juneau Whale Watching & Glacier Combos →"}
                </Link>
              </div>
            </div>

            <div key={"Option 3: Rideshare & Taxis (Proceed with Caution)"} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition">
              <h3 className="text-xl font-black text-slate-900">{"Option 3: Rideshare & Taxis (Proceed with Caution)"}</h3>
              <p className="mt-3 text-sm leading-6 text-slate-600">{"While Uber and Lyft operate in Juneau, peak cruise days with 15,000+ passengers overwhelm the small driver pool. Many travelers successfully get dropped off at Mendenhall only to find zero available rides back to downtown, causing extreme stress as ship all-aboard approaches."}</p>
              <div className="mt-4">
                <Link href="/guides/what-happens-if-my-alaska-tour-runs-late" className="text-xs font-black uppercase tracking-wider text-sky-700 hover:text-sky-900">
                  {"Read Our Cruise Port Safety Guarantee →"}
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
