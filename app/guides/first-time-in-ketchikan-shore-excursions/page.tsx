import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { getAlaskaGeoFact } from "@/lib/alaskaGeoFacts";
import GeoDirectAnswerCard from "@/components/seo/GeoDirectAnswerCard";

const canonical = "https://www.welcometoalaskatours.com/guides/first-time-in-ketchikan-shore-excursions";

export const metadata: Metadata = {
  title: "First Time in Ketchikan: Best Shore Excursions & Port Guide",
  description: "First-time cruise visitor guide to Ketchikan: Misty Fjords floatplanes, Herring Cove bear viewing, Creek Street boardwalk, coastal kayaking, and dock logistics.",
  alternates: { canonical },
  openGraph: {
    title: "First Time in Ketchikan: Best Shore Excursions & Port Guide",
    description: "First-time cruise visitor guide to Ketchikan: Misty Fjords floatplanes, Herring Cove bear viewing, Creek Street boardwalk, coastal kayaking, and dock logistics.",
    url: canonical,
    type: "article",
    images: [{ url: "https://www.welcometoalaskatours.com/images/ketchikan/ketchikan-cruise-port.jpg", width: 1200, height: 630, alt: "Ketchikan Alaska cruise harbor and waterfront" }],
  },
};

const faqs = [
  {
    "question": "What if my ship docks at Ward Cove instead of downtown?",
    "answer": "Norwegian Cruise Line and Oceania ships dock at Ward Cove, 7 miles north of downtown Ketchikan. Continuous free motorcoach shuttles run between Ward Cove and downtown (approx. 20-minute ride). All independent tours meet either at downtown Berth 2 or provide dedicated Ward Cove transfers. Allow an extra 30-minute cushion when returning to Ward Cove."
  },
  {
    "question": "Does it rain every day in Ketchikan?",
    "answer": "Ketchikan is part of a temperate coastal rainforest receiving over 150 inches of precipitation annually. Tours operate normally in misty rain, and operators provide waterproof jackets and pants. The lush green scenery and waterfalls are at their most dramatic in the rain!"
  }
];

export default function GuidePage() {
  const geoFact = getAlaskaGeoFact("ketchikan", "first-time-in-ketchikan-shore-excursions");

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
    headline: "First time in Ketchikan: what shore excursions should you do?",
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
            alt="Scenic Ketchikan cruise ship port, harbor, and green rainforest mountains"
            fill
            priority
            sizes="100vw"
            className="object-cover object-center opacity-30"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/90 to-slate-950/80" />
        </div>
        <div className="relative z-10 mx-auto max-w-5xl">
          <Link href="/ports/ketchikan" className="text-sm font-bold text-cyan-300 hover:text-white inline-flex items-center gap-1.5">
            {"← Ketchikan excursions"}
          </Link>
          <div className="mt-5 text-[11px] font-black uppercase tracking-[0.22em] text-cyan-300">
            Alaska Cruise Planning Guide · 2026
          </div>
          <h1 className="mt-3 max-w-4xl text-3xl font-black tracking-tight sm:text-5xl lg:text-6xl">
            {"First time in Ketchikan: what shore excursions should you do?"}
          </h1>
          <p className="mt-5 max-w-3xl text-base leading-7 text-slate-200 sm:text-lg">
            {"Known as the \"First City\" and the Salmon Capital of the World, Ketchikan is nestled against the dramatic cliffs of Revillagigedo Island in the heart of the Tongass National Forest. Here is how first-time cruise passengers can experience Ketchikan’s best sights without wasting precious port time."}
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
              className="inline-flex min-h-12 items-center justify-center rounded-2xl border-2 border-white/40 bg-slate-950 px-6 py-3 text-sm font-black uppercase tracking-wider text-white hover:bg-slate-900 hover:border-white/70 shadow-md transition"
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
            {"First-timers should pick one signature excursion: a Misty Fjords floatplane flight with an alpine lake landing ($330–$395), a guided bear viewing and rainforest tour at Herring Cove ($120–$180), or sea kayaking in coastal coves ($145–$185). Pair your tour with an hour exploring historic Creek Street, Dolly’s House, and the native totem poles right in town."}
          </p>
          <div className="mt-4 rounded-xl bg-amber-50 border border-amber-200 p-4 text-xs font-semibold text-amber-900">
            <strong>Cruise Safety Buffer:</strong> We enforce the verified formula:{" "}
            <code className="rounded bg-amber-100 px-1 py-0.5 font-mono text-amber-950">tour end time + 45 minutes &le; ship all-aboard time</code>. If timing cannot be verified, an excursion is never labeled cruise-safe.
          </div>
        </section>

        {/* Detailed Sections */}
        <section className="mt-12 space-y-10">
          <h2 className="text-2xl font-black text-slate-950 sm:text-3xl">Key Decisions & Experience Breakdown</h2>
          <div className="grid gap-8 sm:grid-cols-2">
            
            <div key={"1. Misty Fjords National Monument Floatplane (Signature Splurge)"} className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm hover:shadow-md transition flex flex-col">
              <div className="relative h-52 w-full bg-slate-100">
                <Image
                  src="https://cdn.filestackcontent.com/F68TIQZRJSNvKvyDfnyl"
                  alt="Taquan Air DeHavilland Beaver floatplane soaring over the granite cliffs of Misty Fjords"
                  fill
                  sizes="(max-width: 640px) 100vw, 50vw"
                  className="object-cover"
                />
                <span className="absolute bottom-3 left-3 rounded-full bg-slate-950/80 px-3 py-1 text-[11px] font-bold text-white backdrop-blur">
                  Signature Splurge
                </span>
              </div>
              <div className="p-6 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-xl font-black text-slate-900">{"1. Misty Fjords National Monument Floatplane"}</h3>
                  <p className="mt-3 text-sm leading-6 text-slate-600">{"Misty Fjords sits 22 miles east of Ketchikan and has no road access. Seaplanes take off directly from the harbor next to the cruise berths, cruising over 3,000-foot granite sea walls, sheer waterfalls, and jade-green fjords. Authentic tours include an active water landing on a remote mountain lake."}</p>
                </div>
                <div className="mt-5 pt-4 border-t border-slate-100">
                  <Link href="/ketchikan/misty-fjords" className="inline-flex items-center gap-1 text-xs font-black uppercase tracking-wider text-sky-700 hover:text-sky-900">
                    {"Check Misty Fjords Floatplane Tours →"}
                  </Link>
                </div>
              </div>
            </div>

            <div key={"2. Rainforest Wildlife & Bear Viewing at Herring Cove (Top Wildlife)"} className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm hover:shadow-md transition flex flex-col">
              <div className="relative h-52 w-full bg-slate-100">
                <Image
                  src="https://cdn.filestackcontent.com/rEhXeXTySWCkJhxJvCSr"
                  alt="Wild black bear standing in a rocky salmon stream at Herring Cove in Ketchikan"
                  fill
                  sizes="(max-width: 640px) 100vw, 50vw"
                  className="object-cover"
                />
                <span className="absolute bottom-3 left-3 rounded-full bg-slate-950/80 px-3 py-1 text-[11px] font-bold text-white backdrop-blur">
                  Top Wildlife Pick
                </span>
              </div>
              <div className="p-6 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-xl font-black text-slate-900">{"2. Rainforest Wildlife & Bear Viewing at Herring Cove"}</h3>
                  <p className="mt-3 text-sm leading-6 text-slate-600">{"During salmon spawning season (mid-July through September), black bears gather along the tidal flats and streams of Herring Cove to feast on pink and chum salmon. Guided excursions provide safe elevated boardwalk viewing alongside bald eagles and harbor seals."}</p>
                </div>
                <div className="mt-5 pt-4 border-t border-slate-100">
                  <Link href="/ketchikan/bear-tours" className="inline-flex items-center gap-1 text-xs font-black uppercase tracking-wider text-sky-700 hover:text-sky-900">
                    {"Explore Ketchikan Bear & Wildlife Tours →"}
                  </Link>
                </div>
              </div>
            </div>

            <div key={"3. Coastal Sea Kayaking (Top Active Adventure)"} className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm hover:shadow-md transition flex flex-col">
              <div className="relative h-52 w-full bg-slate-100">
                <Image
                  src="https://cdn.filestackcontent.com/IFzOuXaQluJBuQtn3Gtw"
                  alt="Tandem sea kayakers paddling in Orca Cove near Ketchikan"
                  fill
                  sizes="(max-width: 640px) 100vw, 50vw"
                  className="object-cover"
                />
                <span className="absolute bottom-3 left-3 rounded-full bg-slate-950/80 px-3 py-1 text-[11px] font-bold text-white backdrop-blur">
                  Top Active Adventure
                </span>
              </div>
              <div className="p-6 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-xl font-black text-slate-900">{"3. Coastal Sea Kayaking"}</h3>
                  <p className="mt-3 text-sm leading-6 text-slate-600">{"Paddling tandem kayaks through protected coastal channels lets you glide silently past starfish, sea urchins, harbor seals, and diving bald eagles. Stable boats, warm spray skirts, and professional marine guides make this accessible even for first-time paddlers."}</p>
                </div>
                <div className="mt-5 pt-4 border-t border-slate-100">
                  <Link href="/ketchikan/kayaking" className="inline-flex items-center gap-1 text-xs font-black uppercase tracking-wider text-sky-700 hover:text-sky-900">
                    {"Explore Ketchikan Sea Kayaking Tours →"}
                  </Link>
                </div>
              </div>
            </div>

            <div key={"4. Creek Street & Totem Heritage (On Foot in Port)"} className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm hover:shadow-md transition flex flex-col">
              <div className="relative h-52 w-full bg-slate-100">
                <Image
                  src="/hero/ketchikan.png"
                  alt="Historic Ketchikan Creek Street boardwalk on wooden pilings"
                  fill
                  sizes="(max-width: 640px) 100vw, 50vw"
                  className="object-cover"
                />
                <span className="absolute bottom-3 left-3 rounded-full bg-slate-950/80 px-3 py-1 text-[11px] font-bold text-white backdrop-blur">
                  On Foot in Port
                </span>
              </div>
              <div className="p-6 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-xl font-black text-slate-900">{"4. Creek Street & Totem Heritage"}</h3>
                  <p className="mt-3 text-sm leading-6 text-slate-600">{"Built on wooden pilings over Ketchikan Creek, Creek Street was the town’s historic red-light district during gold rush and fishing booms. Today it is a charming boardwalk filled with galleries, salmon ladders, and access to the Totem Heritage Center."}</p>
                </div>
                <div className="mt-5 pt-4 border-t border-slate-100">
                  <Link href="/ports/ketchikan" className="inline-flex items-center gap-1 text-xs font-black uppercase tracking-wider text-sky-700 hover:text-sky-900">
                    {"Browse All Ketchikan Shore Excursions →"}
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
            Compare verified local operators in Juneau, Skagway, and Ketchikan with live calendar availability, transparent pricing, and 100% missed-port refund protection.
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
