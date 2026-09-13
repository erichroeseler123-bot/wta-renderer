import type { Metadata } from "next";
import Link from "next/link";
import { getAlaskaGeoFact } from "@/lib/alaskaGeoFacts";
import GeoDirectAnswerCard from "@/components/seo/GeoDirectAnswerCard";

const canonical = "https://www.welcometoalaskatours.com/guides/private-premium-alaska-shore-excursions";

export const metadata: Metadata = {
  title: "Private & Premium Alaska Shore Excursions: VIP Charters",
  description: "Exclusive private Alaska shore excursions: private 6-pack whale watching yachts, chartered glacier helicopters, luxury van tours, and private Misty Fjords floatplanes.",
  alternates: { canonical },
  openGraph: {
    title: "Private & Premium Alaska Shore Excursions: VIP Charters",
    description: "Exclusive private Alaska shore excursions: private 6-pack whale watching yachts, chartered glacier helicopters, luxury van tours, and private Misty Fjords floatplanes.",
    url: canonical,
    type: "article",
  },
};

const faqs = [
  {
    "question": "How far in advance should private Alaska charters be booked?",
    "answer": "Because private 6-pack boats, luxury vans, and aircraft charters are strictly limited in each port, they frequently sell out 6 to 9 months ahead of the Alaska summer cruise season (May–September)."
  },
  {
    "question": "Are private charters cost-effective for families of 4 to 6?",
    "answer": "Yes! A private whale watching charter for 6 guests ($1,400–$1,600 total) costs roughly $230–$265 per person — only slightly more than standard commercial group tours, while providing complete exclusivity and customized pacing."
  }
];

export default function GuidePage() {
  const geoFact = getAlaskaGeoFact("all", "private-premium-alaska-shore-excursions");

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
    headline: "What luxury, private, and VIP shore excursions are available in Alaska?",
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
            {"What luxury, private, and VIP shore excursions are available in Alaska?"}
          </h1>
          <p className="mt-5 max-w-3xl text-base leading-7 text-slate-200 sm:text-lg">
            {"For luxury cruise travelers, multi-generational families, or small groups who prefer private guides and tailored schedules over crowded tour buses, Alaska offers world-class private charters."}
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
            {"Top private options include private 6-pack whale watching yachts in Juneau ($1,400–$1,800), private glacier helicopter expeditions ($2,200–$3,500), private Misty Fjords floatplanes ($1,800–$2,400), and private luxury passenger vans ($750–$1,200). Private charters allow you to set your own departure time, adjust pacing, and enjoy dedicated dockside greeting."}
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
            
            <div key={"Private 6-Pack Whale Watching Charters (Juneau)"} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition">
              <h3 className="text-xl font-black text-slate-900">{"Private 6-Pack Whale Watching Charters (Juneau)"}</h3>
              <p className="mt-3 text-sm leading-6 text-slate-600">{"Charter an entire 32 to 38-foot catamaran for just your family (up to 6 passengers). You get 360-degree unobstructed rail space, direct access to the licensed captain and naturalist, custom hydrophone listening, and flexible cruise dock departure timing."}</p>
              <div className="mt-4">
                <Link href="/juneau/private-tours" className="text-xs font-black uppercase tracking-wider text-sky-700 hover:text-sky-900">
                  {"Explore Juneau Private Shore Excursions →"}
                </Link>
              </div>
            </div>

            <div key={"Exclusive Helicopter Glacier & Icefield Charters"} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition">
              <h3 className="text-xl font-black text-slate-900">{"Exclusive Helicopter Glacier & Icefield Charters"}</h3>
              <p className="mt-3 text-sm leading-6 text-slate-600">{"Charter a private helicopter for up to 6 guests to land on secluded high-altitude icefields, drink pure glacial meltwater, and explore untouched crevasses away from standard commercial tour groups."}</p>
              <div className="mt-4">
                <Link href="/juneau/helicopter-tours" className="text-xs font-black uppercase tracking-wider text-sky-700 hover:text-sky-900">
                  {"Explore Juneau Helicopter Tours →"}
                </Link>
              </div>
            </div>

            <div key={"Private Misty Fjords Floatplane Charters (Ketchikan)"} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition">
              <h3 className="text-xl font-black text-slate-900">{"Private Misty Fjords Floatplane Charters (Ketchikan)"}</h3>
              <p className="mt-3 text-sm leading-6 text-slate-600">{"A private floatplane charter accommodates your party for an unforgettable aerial flight through Misty Fjords, landing in a secluded alpine lake for champagne or wilderness photography before flying back along the coastline."}</p>
              <div className="mt-4">
                <Link href="/ketchikan/private-tours" className="text-xs font-black uppercase tracking-wider text-sky-700 hover:text-sky-900">
                  {"Explore Ketchikan Private Shore Excursions →"}
                </Link>
              </div>
            </div>

            <div key={"Private Luxury Van & Yukon Explorations (Skagway)"} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition">
              <h3 className="text-xl font-black text-slate-900">{"Private Luxury Van & Yukon Explorations (Skagway)"}</h3>
              <p className="mt-3 text-sm leading-6 text-slate-600">{"Travel the scenic Klondike Highway in a private luxury Mercedes Sprinter or executive van, crossing the Canadian border to Emerald Lake and Carcross with custom photo stops, wildlife viewing, and no large bus crowds."}</p>
              <div className="mt-4">
                <Link href="/skagway/private-tours" className="text-xs font-black uppercase tracking-wider text-sky-700 hover:text-sky-900">
                  {"Explore Skagway Private Shore Excursions →"}
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
