import type { Metadata } from "next";
import Link from "next/link";
import { getAlaskaGeoFact } from "@/lib/alaskaGeoFacts";
import GeoDirectAnswerCard from "@/components/seo/GeoDirectAnswerCard";

const canonical = "https://www.welcometoalaskatours.com/guides/easy-alaska-shore-excursions";

export const metadata: Metadata = {
  title: "Best Easy Alaska Shore Excursions for Seniors & Limited Mobility",
  description: "Discover the best low-walking, scenic, and wheelchair-accessible Alaska cruise excursions in Juneau, Skagway, and Ketchikan for seniors and multigenerational families.",
  alternates: { canonical },
  openGraph: {
    title: "Best Easy Alaska Shore Excursions for Seniors & Limited Mobility",
    description: "Discover the best low-walking, scenic, and wheelchair-accessible Alaska cruise excursions in Juneau, Skagway, and Ketchikan for seniors and multigenerational families.",
    url: canonical,
    type: "article",
  },
};

const faqs = [
  {
    "question": "Can folding wheelchairs and walkers be brought on tour?",
    "answer": "Yes. Most tour vans, minibuses, and marine vessels can stow collapsible wheelchairs and walkers in storage compartments. Notify the operator when booking so the driver can prepare boarding assistance."
  },
  {
    "question": "Are floatplane tours suitable for seniors?",
    "answer": "Yes. Boarding a DeHavilland Beaver floatplane involves stepping down three steps onto the pontoon and entering the cabin. Once seated, it is a smooth, gentle ride offering bird’s-eye views without any walking required."
  }
];

export default function GuidePage() {
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
    headline: "What are the best low-walking, easy shore excursions in Alaska?",
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
            {"What are the best low-walking, easy shore excursions in Alaska?"}
          </h1>
          <p className="mt-5 max-w-3xl text-base leading-7 text-slate-200 sm:text-lg">
            {"An Alaska cruise is the ultimate multi-generational vacation, but not everyone wants or is able to hike 5 miles over glacier moraines or paddle a sea kayak. Fortunately, some of Alaska’s most breathtaking sights require minimal physical effort."}
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
            {"Top low-walking excursions include covered catamaran whale watching ($165–$185) with heated cabins, scenic floatplane flights over Misty Fjords ($330–$395), historic Liarsville salmon bakes with seated gold panning ($65–$95), and the amphibious Ketchikan Duck Tour ($65–$85). All offer low-step or ramp boarding and direct dockside pick-ups."}
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
            
            <div key={"Juneau: Heated Catamarans & Mendenhall Overlooks"} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition">
              <h3 className="text-xl font-black text-slate-900">{"Juneau: Heated Catamarans & Mendenhall Overlooks"}</h3>
              <p className="mt-3 text-sm leading-6 text-slate-600">{"Juneau whale-watching catamarans feature step-free boarding ramps, large interior heated salons with wide picture windows, and table seating. At Mendenhall Glacier, the Visitor Center is fully accessible by elevator and ramp, offering panoramic glacier views without walking the trails."}</p>
              <div className="mt-4">
                <Link href="/juneau/easy-shore-excursions" className="text-xs font-black uppercase tracking-wider text-sky-700 hover:text-sky-900">
                  {"Explore Easy Juneau Shore Excursions →"}
                </Link>
              </div>
            </div>

            <div key={"Skagway: Liarsville Camp & Flat Historic Boardwalks"} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition">
              <h3 className="text-xl font-black text-slate-900">{"Skagway: Liarsville Camp & Flat Historic Boardwalks"}</h3>
              <p className="mt-3 text-sm leading-6 text-slate-600">{"Skagway is flat with no hills. The Liarsville Gold Rush camp provides seated gold panning at waist-height troughs, covered heated pavilions, and live entertaining shows. Downtown Skagway’s wooden boardwalks and National Park Service museums are right off the cruise piers."}</p>
              <div className="mt-4">
                <Link href="/skagway/easy-shore-excursions" className="text-xs font-black uppercase tracking-wider text-sky-700 hover:text-sky-900">
                  {"Explore Easy Skagway Shore Excursions →"}
                </Link>
              </div>
            </div>

            <div key={"Ketchikan: Amphibious Duck Tours & Saxman Native Village"} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition">
              <h3 className="text-xl font-black text-slate-900">{"Ketchikan: Amphibious Duck Tours & Saxman Native Village"}</h3>
              <p className="mt-3 text-sm leading-6 text-slate-600">{"The Ketchikan Duck Tour drives directly onto harbor waters for gentle marine sightseeing, while comfortable tour buses visit Saxman Native Village for indoor clan house cultural performances and totem pole carver demonstrations."}</p>
              <div className="mt-4">
                <Link href="/ketchikan/easy-shore-excursions" className="text-xs font-black uppercase tracking-wider text-sky-700 hover:text-sky-900">
                  {"Explore Easy Ketchikan Shore Excursions →"}
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
