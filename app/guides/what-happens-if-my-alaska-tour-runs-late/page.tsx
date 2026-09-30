import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { getAlaskaGeoFact } from "@/lib/alaskaGeoFacts";
import GeoDirectAnswerCard from "@/components/seo/GeoDirectAnswerCard";

const canonical = "https://www.welcometoalaskatours.com/guides/what-happens-if-my-alaska-tour-runs-late";

export const metadata: Metadata = {
  title: "What Happens If Your Alaska Tour Runs Late? (Safety Guarantee)",
  description: "Cruise passenger safety guide: how independent Alaska tour operators guarantee on-time ship return, strict safety buffers, and comprehensive contingency protections.",
  alternates: { canonical },
  openGraph: {
    title: "What Happens If Your Alaska Tour Runs Late? (Safety Guarantee)",
    description: "Cruise passenger safety guide: how independent Alaska tour operators guarantee on-time ship return, strict safety buffers, and comprehensive contingency protections.",
    url: canonical,
    type: "article",
    images: [{ url: "https://www.welcometoalaskatours.com/images/ketchikan/ketchikan-cruise-port.jpg", width: 1200, height: 630, alt: "Alaska cruise ship docked in port" }],
  },
};

const faqs = [
  {
    "question": "Has a Welcome to Alaska Tours guest ever missed their cruise ship?",
    "answer": "No. Our verified local partners have a 100% on-time record across thousands of passenger departures. Operators schedule conservative timing buffers specifically to eliminate risk."
  },
  {
    "question": "Does the cruise ship wait for ship-booked excursions if they run late?",
    "answer": "While ships will wait for ship-sponsored excursions if feasible, even cruise-line tours must adhere to tidal and maritime schedules. Independent operators maintain direct radio contact with port dispatchers and harbor pilots."
  }
];

export default function GuidePage() {
  const geoFact = getAlaskaGeoFact("all", "what-happens-if-my-alaska-tour-runs-late");

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
    headline: "What happens if an independent Alaska tour runs late and the ship is leaving?",
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

      <section className="relative overflow-hidden bg-slate-900 px-6 py-16 text-white sm:py-24">
        <div className="absolute inset-0">
          <Image
            src="/images/ketchikan/ketchikan-cruise-port.jpg"
            alt="Cruise ship tied to Alaska port dock against forested mountains"
            fill
            priority
            sizes="100vw"
            className="object-cover object-center opacity-30"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/80 to-transparent" />
        </div>
        <div className="relative z-10 mx-auto max-w-5xl">
          <Link href="/guides" className="text-sm font-bold text-cyan-300 hover:text-white inline-flex items-center gap-1.5">
            {"← Alaska Guides Directory"}
          </Link>
          <div className="mt-5 text-[11px] font-black uppercase tracking-[0.22em] text-cyan-300">
            Alaska Cruise Planning Guide · 2026
          </div>
          <h1 className="mt-3 max-w-4xl text-3xl font-black tracking-tight sm:text-5xl lg:text-6xl">
            {"What happens if an independent Alaska tour runs late and the ship is leaving?"}
          </h1>
          <p className="mt-5 max-w-3xl text-base leading-7 text-slate-200 sm:text-lg">
            {"The number-one fear cruise passengers have about booking independent excursions is: \"Will the ship leave without me?\" Here is the reality of how port operations work in Alaska, the strict timing rules we enforce, and what protections you have on every booking."}
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
            {"Independent tour operators operate under a mandatory safety rule: tour end time + 45 minutes <= ship all-aboard time. Because Alaska ports (Juneau, Skagway, Ketchikan) have compact, single-corridor road networks, traffic jams do not exist. In the extraordinarily rare event of a mechanical delay, operators communicate directly with harbor pilots, deploy backup transport, and carry comprehensive 100% back-to-ship guarantees."}
          </p>
          <div className="mt-4 rounded-xl bg-amber-50 border border-amber-200 p-4 text-xs font-semibold text-amber-900">
            <strong>Cruise Safety Buffer:</strong> We enforce the verified formula:{" "}
            <code className="rounded bg-amber-100 px-1 py-0.5 font-mono text-amber-950">tour end time + 45 minutes &le; ship all-aboard time</code>. If timing cannot be verified, an excursion is never labeled cruise-safe.
          </div>
        </section>

        {/* Detailed Sections */}
        <section className="mt-12 space-y-10">
          <h2 className="text-2xl font-black text-slate-950 sm:text-3xl">Key Decisions & Experience Breakdown</h2>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            
            <div key={"The Golden Timing Rule: Tour End Time + 45 Minutes <= All-Aboard"} className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm hover:shadow-md transition flex flex-col">
              <div className="relative h-48 w-full bg-slate-100">
                <Image
                  src="/hero/hero8521.jpg"
                  alt="Alaska coastal waterway and timed excursion transit"
                  fill
                  sizes="(max-width: 640px) 100vw, 33vw"
                  className="object-cover"
                />
                <span className="absolute bottom-3 left-3 rounded-full bg-slate-950/80 px-3 py-1 text-[11px] font-bold text-white backdrop-blur">
                  Timing Rule
                </span>
              </div>
              <div className="p-6 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-lg font-black text-slate-900">{"Tour End Time + 45 Minutes &le; All-Aboard"}</h3>
                  <p className="mt-3 text-sm leading-6 text-slate-600">{"All-aboard is typically 30 to 60 minutes before scheduled ship departure. Reputable independent tours finish a minimum of 45 to 90 minutes prior to all-aboard. If your all-aboard is 4:30 PM, your tour must return to the dock by 3:45 PM or earlier."}</p>
                </div>
                <div className="mt-5 pt-4 border-t border-slate-100">
                  <Link href="/guides/cruise-ship-vs-independent-alaska-excursions" className="inline-flex items-center gap-1 text-xs font-black uppercase tracking-wider text-sky-700 hover:text-sky-900">
                    {"Compare Ship vs Independent →"}
                  </Link>
                </div>
              </div>
            </div>

            <div key={"Why Alaska Ports Are Logistically Low-Risk"} className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm hover:shadow-md transition flex flex-col">
              <div className="relative h-48 w-full bg-slate-100">
                <Image
                  src="/hero/juneau.jpg"
                  alt="Juneau port harbor directly adjacent to excursion departure piers"
                  fill
                  sizes="(max-width: 640px) 100vw, 33vw"
                  className="object-cover"
                />
                <span className="absolute bottom-3 left-3 rounded-full bg-slate-950/80 px-3 py-1 text-[11px] font-bold text-white backdrop-blur">
                  Low-Risk Logistics
                </span>
              </div>
              <div className="p-6 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-lg font-black text-slate-900">{"Why Alaska Ports Are Low-Risk"}</h3>
                  <p className="mt-3 text-sm leading-6 text-slate-600">{"Unlike sprawling metropolitan ports like Rome, Barcelona, or Miami where cruise ships dock 60 miles away from city centers through heavy freeway traffic, Alaska ports are tiny towns. In Juneau, the airport is 15 minutes away; in Skagway, the town is 7 blocks long."}</p>
                </div>
                <div className="mt-5 pt-4 border-t border-slate-100">
                  <Link href="/guides/how-long-does-it-take-to-get-off-the-ship-in-juneau" className="inline-flex items-center gap-1 text-xs font-black uppercase tracking-wider text-sky-700 hover:text-sky-900">
                    {"Disembarkation Timing Guide →"}
                  </Link>
                </div>
              </div>
            </div>

            <div key={"Our 100% Back-to-Ship Guarantee"} className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm hover:shadow-md transition flex flex-col">
              <div className="relative h-48 w-full bg-slate-100">
                <Image
                  src="/images/ketchikan/ketchikan-cruise-port.jpg"
                  alt="Cruise ship in Alaska harbor under verified operator guarantee"
                  fill
                  sizes="(max-width: 640px) 100vw, 33vw"
                  className="object-cover"
                />
                <span className="absolute bottom-3 left-3 rounded-full bg-slate-950/80 px-3 py-1 text-[11px] font-bold text-white backdrop-blur">
                  Back-To-Ship Guarantee
                </span>
              </div>
              <div className="p-6 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-lg font-black text-slate-900">{"100% Back-to-Ship Guarantee"}</h3>
                  <p className="mt-3 text-sm leading-6 text-slate-600">{"In the virtually non-existent event that an operator delay causes you to miss your ship, reputable operators provide full contingency coverage: arranging and paying for air transportation, meals, and lodging to deliver you to the next port."}</p>
                </div>
                <div className="mt-5 pt-4 border-t border-slate-100">
                  <Link href="/ports" className="inline-flex items-center gap-1 text-xs font-black uppercase tracking-wider text-sky-700 hover:text-sky-900">
                    {"Explore Verified Excursions →"}
                  </Link>
                </div>
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
