import type { Metadata } from "next";
import Link from "next/link";
import { getAlaskaGeoFact } from "@/lib/alaskaGeoFacts";
import GeoDirectAnswerCard from "@/components/seo/GeoDirectAnswerCard";

const canonical = "https://www.welcometoalaskatours.com/guides/juneau-whale-watching-vs-mendenhall";

export const metadata: Metadata = {
  title: "Juneau Whale Watching vs Mendenhall Glacier (or Both? 2026 Cruise Guide)",
  description:
    "Whale watching vs Mendenhall Glacier in Juneau: compare standalone trips vs 5-hour combo excursions. Cruise port logistics, timing buffers, USFS permits, and 2026 prices.",
  alternates: { canonical },
  openGraph: {
    title: "Juneau Whale Watching vs Mendenhall Glacier (or Both? 2026 Cruise Guide)",
    description: "A practical cruise-day decision guide for choosing whales, Mendenhall Glacier, or a combined tour in Juneau.",
    url: canonical,
    type: "article",
  },
};

const rows = [
  ["Best for", "Wildlife and a boat-based Alaska experience", "Glacier scenery, photos, short walks, and a land-based stop", "Seeing both signature Juneau icons on a single port call"],
  ["Duration & timing", "3 to 3.5 hours total (2–2.5h on water)", "2.5 to 3 hours total (20m drive + 2h on site)", "5 to 5.5 hours total (2.5h water + 1.5–2h glacier)"],
  ["Typical price", "$165–$195 per adult", "$45–$95 shuttle/tour (USFS pass included)", "$245–$295 combo package"],
  ["Cruise port fit", "Fits tight 4–5 hour port calls easily", "Fits tight 4–5 hour port calls easily", "Requires comfortable 6.5+ hour port call"],
  ["Transportation", "Round-trip bus/van from Mt. Roberts Tram plaza to Auke Bay", "Shuttle from Mt. Roberts Tram parking to Visitor Center", "Pre-coordinated shuttle connecting dock, marina, and glacier"],
  ["Key highlights", "Guaranteed humpbacks, sea lions, eagles, hydrophone listening", "Nugget Falls 2-mile walk, Visitor Center exhibits, photo points", "100% whale guarantee + Mendenhall access without separate bookings"],
] as const;

const faqs = [
  {
    question: "Can I do whale watching and Mendenhall Glacier in the same cruise day?",
    answer:
      "Yes! Combination excursions package both into a single 5 to 5.5-hour tour. You get 2 to 2.5 hours on a whale-watching boat in Auke Bay, followed by 1.5 to 2 hours at Mendenhall Glacier Recreation Area. All transfers between the cruise docks, boat marina, and glacier are pre-coordinated, saving time and eliminating the stress of separate bookings.",
  },
  {
    question: "Is whale watching or Mendenhall Glacier better in Juneau?",
    answer:
      "Neither is universally better. Choose whale watching if seeing wild marine life up close is your bucket-list priority. Choose Mendenhall if glacier scenery, walking the trail to Nugget Falls, or a mostly land-based day matters more. If your ship has at least 6.5 hours in port, the combination tour gives you both.",
  },
  {
    question: "How do cruise passengers get to the tour departures?",
    answer:
      "All major independent Juneau tour operators stage departures directly at the Mt. Roberts Tramway parking lot (490 S Franklin St), less than a 5-minute flat walk from the downtown cruise berths (Franklin, CT, and IVF docks). Passengers docking at the AJ Dock take the $5 port shuttle directly to the tram plaza.",
  },
  {
    question: "What happens if our cruise ship arrives late or misses Juneau?",
    answer:
      "Independent operators monitor ship docking schedules in real time. If your vessel arrives late, tour departure times are adjusted. If weather or mechanical issues force your cruise ship to cancel the Juneau port call entirely, Welcome to Alaska Tours automatically issues a 100% full refund.",
  },
  {
    question: "What is included on Whale Watching + Mendenhall combination tours?",
    answer:
      "Combo tours include round-trip transfers from the cruise docks, 2 to 2.5 hours on a covered heated catamaran with outdoor viewing decks and a naturalist guide, light snacks and hot beverages, and official US Forest Service admission permits for the Mendenhall Glacier Recreation Area and Visitor Center.",
  },
];

export default function JuneauWhalesVsMendenhallGuide() {
  const geoFact = getAlaskaGeoFact("juneau", "juneau-whale-watching-vs-mendenhall");

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
    headline: "Juneau Whale Watching vs Mendenhall Glacier: Which Should You Choose?",
    description: metadata.description,
    datePublished: "2026-08-24",
    dateModified: "2026-09-17",
    mainEntityOfPage: canonical,
    publisher: { "@type": "Organization", name: "Welcome To Alaska Tours" },
  };

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#e0f2fe_0%,#f8fafc_38%,#ffffff_100%)] text-slate-950 pb-20">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />

      <section className="bg-[linear-gradient(135deg,#082f49_0%,#0f172a_58%,#164e63_100%)] px-6 py-14 text-white sm:py-20">
        <div className="mx-auto max-w-5xl">
          <Link href="/ports/juneau" className="text-sm font-bold text-cyan-200 hover:text-white">← Juneau excursions</Link>
          <div className="mt-5 text-[11px] font-black uppercase tracking-[0.22em] text-cyan-200">Juneau Cruise Planning Guide · 2026</div>
          <h1 className="mt-3 max-w-4xl text-3xl font-black tracking-tight sm:text-5xl lg:text-6xl">Whale watching vs Mendenhall Glacier: which should you choose?</h1>
          <p className="mt-5 max-w-3xl text-base leading-7 text-slate-200 sm:text-lg">
            Compare Juneau's signature excursions: guaranteed humpback whale watching in Auke Bay, exploring Mendenhall Glacier Recreation Area, or doing both on a coordinated 5-hour combination tour.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link href="/juneau/whale-watching" className="inline-flex min-h-12 items-center justify-center rounded-2xl bg-cyan-300 px-6 py-3 text-sm font-black uppercase tracking-wider text-slate-950 hover:bg-cyan-200 shadow-md transition">Compare Whale Watching →</Link>
            <Link href="/juneau/mendenhall-glacier-tours" className="inline-flex min-h-12 items-center justify-center rounded-2xl border border-white/20 bg-white/10 px-6 py-3 text-sm font-black uppercase tracking-wider text-white hover:bg-white/20 transition">Compare Mendenhall Tours</Link>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-5xl px-6 sm:px-8">
        {geoFact && (
          <div className="mt-8">
            <GeoDirectAnswerCard fact={geoFact} />
          </div>
        )}

        <section className="mt-8 rounded-[2rem] border border-sky-100 bg-white p-6 shadow-sm sm:p-8">
          <div className="text-[10px] font-black uppercase tracking-[0.2em] text-sky-700">Quick Decision Framework</div>
          <p className="mt-3 text-xl font-black leading-8 text-slate-950">
            If your cruise call is <span className="text-sky-800">6.5 hours or longer</span>, book a <span className="text-sky-800">Whale Watching + Mendenhall Glacier combo tour ($245–$295)</span> to see both seamlessly. If your port stay is under 6 hours, pick <span className="text-sky-800">whale watching</span> for guaranteed wildlife or <span className="text-sky-800">Mendenhall Glacier</span> for walking to Nugget Falls and visitor center viewing.
          </p>
          <div className="mt-4 rounded-xl bg-amber-50 border border-amber-200 p-4 text-xs font-semibold text-amber-900">
            <strong>Cruise Safety Formula:</strong> We strictly enforce:{" "}
            <code className="rounded bg-amber-100 px-1 py-0.5 font-mono text-amber-950">tour end time + 45 minutes &le; ship all-aboard time</code>.
          </div>
        </section>

        <section className="mt-10">
          <div className="mb-5">
            <div className="text-[10px] font-black uppercase tracking-[0.2em] text-sky-700">Side-by-side</div>
            <h2 className="mt-2 text-3xl font-black tracking-tight">The decision in one table</h2>
          </div>
          <div className="overflow-x-auto rounded-[2rem] border border-slate-200 bg-white shadow-sm">
            <table className="w-full min-w-[720px] border-collapse text-left">
              <thead className="bg-slate-900 text-white">
                <tr>
                  <th className="p-4 text-xs font-black uppercase tracking-wider">Decision</th>
                  <th className="p-4 text-xs font-black uppercase tracking-wider">Whale watching</th>
                  <th className="p-4 text-xs font-black uppercase tracking-wider">Mendenhall Glacier</th>
                </tr>
              </thead>
              <tbody>
                {rows.map(([label, whales, glacier]) => (
                  <tr key={label} className="border-t border-slate-100 align-top">
                    <th className="p-4 text-sm font-black text-slate-900">{label}</th>
                    <td className="p-4 text-sm leading-6 text-slate-600">{whales}</td>
                    <td className="p-4 text-sm leading-6 text-slate-600">{glacier}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="mt-10 grid gap-6 md:grid-cols-2">
          <article className="rounded-[2rem] border border-slate-200 bg-white p-7 shadow-sm">
            <div className="text-[10px] font-black uppercase tracking-[0.2em] text-sky-700">Choose whales when...</div>
            <h2 className="mt-2 text-2xl font-black tracking-tight">Wildlife is the reason you came to Alaska.</h2>
            <ul className="mt-5 space-y-3 text-sm leading-6 text-slate-600">
              <li>• Your group wants a boat-based wildlife experience more than another scenic land stop.</li>
              <li>• Seeing whales from a dedicated viewing boat matters more than seeing them opportunistically from the cruise ship.</li>
              <li>• Your group is comfortable with a marine excursion and variable weather.</li>
              <li>• You found a departure that fits the ship window without a rushed return.</li>
            </ul>
            <Link href="/juneau/whale-watching" className="mt-6 inline-flex rounded-xl bg-sky-700 px-5 py-3 text-sm font-black text-white hover:bg-sky-800">See connected whale tours →</Link>
          </article>

          <article className="rounded-[2rem] border border-slate-200 bg-white p-7 shadow-sm">
            <div className="text-[10px] font-black uppercase tracking-[0.2em] text-sky-700">Choose Mendenhall when...</div>
            <h2 className="mt-2 text-2xl font-black tracking-tight">You want glacier scenery on your own two feet.</h2>
            <ul className="mt-5 space-y-3 text-sm leading-6 text-slate-600">
              <li>• A glacier viewpoint is a must-do for your first Alaska visit.</li>
              <li>• Your group prefers a land-based outing to several hours on a sightseeing boat.</li>
              <li>• You want the option to pair scenery with walking rather than make wildlife the whole excursion.</li>
              <li>• Your port call is tight enough that one focused activity feels smarter than stacking two.</li>
            </ul>
            <Link href="/juneau/mendenhall-glacier-tours" className="mt-6 inline-flex rounded-xl bg-sky-700 px-5 py-3 text-sm font-black text-white hover:bg-sky-800">See connected Mendenhall tours →</Link>
          </article>
        </section>

        <section className="mt-10 rounded-[2rem] border border-amber-200 bg-amber-50 p-7 sm:p-8">
          <div className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-800">When a combo makes sense</div>
          <h2 className="mt-2 text-2xl font-black tracking-tight">Two icons, but only if the timing is comfortable.</h2>
          <p className="mt-4 text-sm leading-7 text-slate-700">
            Whale-watching and Mendenhall combinations are popular because one operator can coordinate the transfers and sequence. The tradeoff is that each stop gets a defined amount of time. If your priority is a longer hike, a long wildlife outing, or a relaxed downtown visit, one major excursion may fit better than trying to collect both highlights.
          </p>
          <p className="mt-3 text-sm font-bold leading-7 text-slate-800">
            Use the cruise line's current all-aboard time and the operator's actual meeting and return details as the controlling schedule. Never rely on a generic port-day estimate for a specific sailing.
          </p>
        </section>

        <section className="mt-10 rounded-[2rem] border border-slate-200 bg-white p-7 sm:p-8">
          <div className="text-[10px] font-black uppercase tracking-[0.2em] text-sky-700">Fast chooser</div>
          <h2 className="mt-2 text-2xl font-black tracking-tight">Still split 50/50?</h2>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600">
            Tell the Alaska planner your port, ship window, group, pace, and activity style. It can narrow the connected catalog instead of making you compare every Juneau listing manually.
          </p>
          <Link href="/plan?port=juneau&sourcePage=/guides/juneau-whale-watching-vs-mendenhall" className="mt-5 inline-flex min-h-12 items-center justify-center rounded-2xl bg-slate-900 px-6 py-3 text-sm font-black uppercase tracking-wider text-white hover:bg-slate-800">Show my best Juneau choices →</Link>
        </section>

        <section className="mt-10 rounded-[2rem] border border-slate-200 bg-white p-7 sm:p-8">
          <h2 className="text-2xl font-black tracking-tight">Frequently asked questions</h2>
          <div className="mt-5 divide-y divide-slate-100">
            {faqs.map((faq) => (
              <div key={faq.question} className="py-5 first:pt-0 last:pb-0">
                <h3 className="text-base font-black text-slate-950">{faq.question}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">{faq.answer}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
