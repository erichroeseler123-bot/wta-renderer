import type { Metadata } from "next";
import Link from "next/link";
import { getAlaskaGeoFact } from "@/lib/alaskaGeoFacts";
import GeoDirectAnswerCard from "@/components/seo/GeoDirectAnswerCard";

const canonical = "https://www.welcometoalaskatours.com/guides/best-things-to-do-in-skagway-4-6-hours";

export const metadata: Metadata = {
  title: "Best Things to Do in Skagway in 4 to 6 Hours (Cruise Guide)",
  description: "Maximize a short 4 to 6-hour Skagway port call: helicopter glacier landings, historic Broadway, Liarsville Gold Rush camp, and scenic White Pass summit trips.",
  alternates: { canonical },
  openGraph: {
    title: "Best Things to Do in Skagway in 4 to 6 Hours (Cruise Guide)",
    description: "Maximize a short 4 to 6-hour Skagway port call: helicopter glacier landings, historic Broadway, Liarsville Gold Rush camp, and scenic White Pass summit trips.",
    url: canonical,
    type: "article",
  },
};

const faqs = [
  {
    "question": "Can I do the White Pass & Yukon Route train in 4 hours?",
    "answer": "The classic White Pass Summit Excursion runs approximately 2.5 to 2.75 hours round trip and boards right at the cruise dock. If your ship has 5+ hours, it fits well. For calls under 5 hours, local town or helicopter tours provide less timing stress."
  },
  {
    "question": "Do I need a passport for short Skagway tours?",
    "answer": "Tours staying within Skagway, Liarsville, Dyea, or taking helicopter flights do NOT require a passport. Only excursions crossing the Canadian border into the Yukon Territory require a valid passport."
  }
];

export default function GuidePage() {
  const geoFact = getAlaskaGeoFact("skagway", "best-things-to-do-in-skagway-4-6-hours");

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
    headline: "What are the best things to do in Skagway with a 4 to 6-hour port window?",
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
          <Link href="/ports/skagway" className="text-sm font-bold text-cyan-200 hover:text-white">
            {"← Skagway excursions"}
          </Link>
          <div className="mt-5 text-[11px] font-black uppercase tracking-[0.22em] text-cyan-200">
            Alaska Cruise Planning Guide · 2026
          </div>
          <h1 className="mt-3 max-w-4xl text-3xl font-black tracking-tight sm:text-5xl lg:text-6xl">
            {"What are the best things to do in Skagway with a 4 to 6-hour port window?"}
          </h1>
          <p className="mt-5 max-w-3xl text-base leading-7 text-slate-200 sm:text-lg">
            {"Skagway is one of Alaska’s most compact and walkable cruise ports. While full-day 7-hour excursions travel into the Canadian Yukon, travelers with shorter 4 to 6-hour port calls must choose time-efficient tours that preserve a safe cushion before the ship sails."}
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
            {"For a 4 to 6-hour stay, prioritize excursions under 3 hours: a 2-hour helicopter glacier landing over Sawtooth Ridge ($350–$410), a 2.5-hour Liarsville Gold Rush camp and salmon bake ($75–$95), an electric scooter tour to Dyea ($120–$150), or strolling the 7-block Klondike National Historic District. Always verify that tour end time + 45 minutes is before your ship’s all-aboard."}
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
            
            <div key={"1. Helicopter Glacier Landing over Sawtooth Ridge (2–2.5 Hours)"} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition">
              <h3 className="text-xl font-black text-slate-900">{"1. Helicopter Glacier Landing over Sawtooth Ridge (2–2.5 Hours)"}</h3>
              <p className="mt-3 text-sm leading-6 text-slate-600">{"Because the Skagway heliport is located directly adjacent to the harbor, transfer time is under 5 minutes. Flights lift off over Taiya Inlet and land directly on high alpine glacier icefields, offering 30 minutes of guided ice walking before returning you to the docks."}</p>
              <div className="mt-4">
                <Link href="/skagway/helicopter-tours" className="text-xs font-black uppercase tracking-wider text-sky-700 hover:text-sky-900">
                  {"Check Skagway Helicopter Tours →"}
                </Link>
              </div>
            </div>

            <div key={"2. Liarsville Gold Rush Trail Camp & Salmon Bake (2.5 Hours)"} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition">
              <h3 className="text-xl font-black text-slate-900">{"2. Liarsville Gold Rush Trail Camp & Salmon Bake (2.5 Hours)"}</h3>
              <p className="mt-3 text-sm leading-6 text-slate-600">{"Located just 3 miles from the cruise piers at the foot of White Pass, Liarsville recreates an 1898 stampeders tent city. Features include seated gold panning with guaranteed gold flakes, historic melodrama performances, and fresh Alaskan wild salmon grilled over alder wood."}</p>
              <div className="mt-4">
                <Link href="/skagway/gold-rush-tours" className="text-xs font-black uppercase tracking-wider text-sky-700 hover:text-sky-900">
                  {"Explore Skagway Gold Rush Tours →"}
                </Link>
              </div>
            </div>

            <div key={"3. Historic Broadway Walking & Klondike Museum (1–2 Hours)"} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition">
              <h3 className="text-xl font-black text-slate-900">{"3. Historic Broadway Walking & Klondike Museum (1–2 Hours)"}</h3>
              <p className="mt-3 text-sm leading-6 text-slate-600">{"Skagway’s historic downtown features false-front saloons, wooden boardwalks, and restored gold rush buildings managed by the National Park Service. Free museum exhibits, the Mascot Saloon, and local artisan shops sit within a flat 10-minute walk from Broadway and Ore docks."}</p>
              <div className="mt-4">
                <Link href="/ports/skagway" className="text-xs font-black uppercase tracking-wider text-sky-700 hover:text-sky-900">
                  {"Browse All Skagway Excursions →"}
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
