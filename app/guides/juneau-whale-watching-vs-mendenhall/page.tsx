import type { Metadata } from "next";
import Link from "next/link";

const canonical = "https://welcometoalaskatours.com/guides/juneau-whale-watching-vs-mendenhall";

export const metadata: Metadata = {
  title: "Juneau Whale Watching vs Mendenhall Glacier: Which Should You Choose?",
  description:
    "Compare Juneau whale watching and Mendenhall Glacier for a cruise port day. Choose by wildlife priority, walking, weather tolerance, port-call length, and whether a combo tour fits your ship window.",
  alternates: { canonical },
  openGraph: {
    title: "Juneau Whale Watching vs Mendenhall Glacier",
    description: "A practical cruise-day decision guide for choosing whales, Mendenhall Glacier, or a combination of both in Juneau.",
    url: canonical,
    type: "article",
  },
};

const rows = [
  ["Best for", "Wildlife and a boat-based Alaska experience", "Glacier scenery, photos, short walks, and a land-based stop"],
  ["Choose it when", "Seeing whales up close is one of your Alaska priorities", "You want a glacier-focused day or prefer to stay mostly on land"],
  ["Main variable", "Boat time, sea conditions, departure time, and wildlife activity", "Transportation time, walking choice, weather, and time at the recreation area"],
  ["Short port call", "Choose a departure with a conservative return buffer", "A focused Mendenhall visit can be simpler than stacking two major activities"],
  ["Long port call", "Whale watching can anchor the day with flexible downtown time around it", "Mendenhall can be paired with another activity when transfers and return timing work"],
  ["Combo tour", "Useful when you want both and one operator coordinates the day", "Useful when you want both but do not want to coordinate separate transportation"],
] as const;

const faqs = [
  {
    question: "Is whale watching or Mendenhall Glacier better in Juneau?",
    answer:
      "Neither is universally better. Choose whale watching if wildlife is the priority. Choose Mendenhall if glacier scenery, walking, or a mostly land-based day matters more. If your ship has a comfortable port window, a well-timed combination can cover both.",
  },
  {
    question: "Can I do whale watching and Mendenhall Glacier in the same cruise day?",
    answer:
      "Often, yes. Combination excursions are common, but the right choice depends on your ship's actual port window, the operator's meeting point, total tour duration, and the return buffer before all-aboard.",
  },
  {
    question: "Should I still visit Mendenhall if my cruise also visits Glacier Bay?",
    answer:
      "That depends on what you want from Juneau. Glacier Bay is a ship-based scenic experience, while a Mendenhall visit can add a land-based viewpoint and walking time. If glacier scenery is already well covered for your group, you may prefer to make wildlife or another Juneau experience the priority.",
  },
  {
    question: "What is the safest choice for a short Juneau port call?",
    answer:
      "Choose one major experience that fits comfortably inside the ship window rather than forcing two activities into a tight day. Confirm the operator's meeting instructions and use the cruise line's current all-aboard time as the controlling deadline.",
  },
];

export default function JuneauWhalesVsMendenhallGuide() {
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
    dateModified: "2026-08-24",
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
          <div className="mt-5 text-[11px] font-black uppercase tracking-[0.22em] text-cyan-200">Juneau decision guide · 2026</div>
          <h1 className="mt-3 max-w-4xl text-4xl font-black tracking-tight sm:text-6xl">Whale watching vs Mendenhall Glacier: which should you choose?</h1>
          <p className="mt-5 max-w-3xl text-base leading-7 text-slate-200 sm:text-lg">
            If you only want one major Juneau excursion, make the decision around the kind of Alaska moment your group cares about most — not around which option appears first in a tour list.
          </p>
          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <Link href="/juneau/whale-watching" className="inline-flex min-h-12 items-center justify-center rounded-2xl bg-cyan-300 px-6 py-3 text-sm font-black uppercase tracking-wider text-slate-950 hover:bg-cyan-200">Compare whale watching →</Link>
            <Link href="/juneau/mendenhall-glacier-tours" className="inline-flex min-h-12 items-center justify-center rounded-2xl border border-white/20 bg-white/10 px-6 py-3 text-sm font-black uppercase tracking-wider text-white hover:bg-white/20">Compare Mendenhall tours</Link>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-5xl px-6 sm:px-8">
        <section className="mt-8 rounded-[2rem] border border-sky-100 bg-white p-6 shadow-sm sm:p-8">
          <div className="text-[10px] font-black uppercase tracking-[0.2em] text-sky-700">Quick answer</div>
          <p className="mt-3 text-xl font-black leading-8 text-slate-950">
            Pick <span className="text-sky-800">whale watching</span> when wildlife is the bucket-list priority. Pick <span className="text-sky-800">Mendenhall Glacier</span> when your group wants glacier scenery, photos, walking, or a mostly land-based day. Choose a <span className="text-sky-800">combo</span> only when the total itinerary still leaves a comfortable return buffer before your ship's all-aboard time.
          </p>
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
