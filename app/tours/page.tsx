import Link from "next/link";
import FAQSection from "@/app/components/faq/FAQSection";
import JsonLd from "@/components/seo/JsonLd";
import { WidgetCatalog } from "@/components/widget/WidgetCatalog";
import { getHelicopterTours } from "@/lib/helicopterTours";
import { buildTourItemListSchema, sanitizeTours } from "@/lib/tourSeo";

export const dynamic = "force-dynamic";

export default async function ToursPage() {
  const tours = sanitizeTours(await getHelicopterTours());
  const itemListSchema = buildTourItemListSchema(tours);

  const portCounts = tours.reduce<Record<string, number>>((counts, tour) => {
    const port = String(tour.port || "").toLowerCase();
    if (port) counts[port] = (counts[port] || 0) + 1;
    return counts;
  }, {});

  return (
    <>
      <JsonLd data={itemListSchema} />
      <div className="mx-auto max-w-7xl px-4 pt-8 sm:px-6 space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex rounded-full border border-sky-500/30 bg-sky-500/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-sky-400">
            Juneau • Skagway • Ketchikan
          </div>
          <h1 className="text-3xl font-black tracking-tight text-white sm:text-4xl leading-tight">
            Browse Alaska Shore Excursions
          </h1>
          <p className="text-sm text-slate-300 max-w-2xl mx-auto">
            Compare the Alaska excursions already available through our FareHarbor operator network, then use your ship, port, and date to narrow the list to your cruise day.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          {[
            ["juneau", "Juneau"],
            ["skagway", "Skagway"],
            ["ketchikan", "Ketchikan"],
          ].map(([slug, label]) => (
            <Link
              key={slug}
              href={`/ports/${slug}`}
              className="rounded-2xl border border-white/10 bg-white/[0.05] p-4 text-white hover:bg-white/[0.09] transition"
            >
              <div className="text-xs font-black uppercase tracking-wider text-cyan-300">{label}</div>
              <div className="mt-1 text-2xl font-black">{portCounts[slug] || 0}</div>
              <div className="text-xs text-slate-400">excursions in the catalog</div>
            </Link>
          ))}
        </div>

        <div className="rounded-[2.5rem] border border-white/10 bg-white/[0.05] p-6">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-xs font-black uppercase tracking-[0.16em] text-sky-400">
                Shop by experience
              </h2>
              <p className="mt-1 text-xs text-slate-400">
                Start with the kind of Alaska day you want, or go straight to your port page to compare the options available there.
              </p>
            </div>
            <Link href="/#find-your-port-day" className="text-xs font-bold text-cyan-300 hover:text-cyan-200">
              Start with my port day →
            </Link>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link href="/categories/juneau-helicopter-tours" className="rounded-xl border border-sky-200 bg-white px-3 py-1.5 text-xs font-bold text-sky-950 hover:bg-sky-50 transition">Juneau Helicopter Tours</Link>
            <Link href="/categories/glacier-tours" className="rounded-xl border border-sky-200 bg-white px-3 py-1.5 text-xs font-bold text-sky-950 hover:bg-sky-50 transition">Glacier Tours</Link>
            <Link href="/categories/dog-sledding" className="rounded-xl border border-sky-200 bg-white px-3 py-1.5 text-xs font-bold text-sky-950 hover:bg-sky-50 transition">Dog Sledding</Link>
            <Link href="/categories/whale-watching" className="rounded-xl border border-sky-200 bg-white px-3 py-1.5 text-xs font-bold text-sky-950 hover:bg-sky-50 transition">Whale Watching</Link>
            <Link href="/categories/mendenhall-glacier" className="rounded-xl border border-sky-200 bg-white px-3 py-1.5 text-xs font-bold text-sky-950 hover:bg-sky-50 transition">Mendenhall Glacier</Link>
            <Link href="/categories/flightseeing" className="rounded-xl border border-sky-200 bg-white px-3 py-1.5 text-xs font-bold text-sky-950 hover:bg-sky-50 transition">Flightseeing</Link>
          </div>
        </div>
      </div>
      <WidgetCatalog tours={tours} mode="tours" />
      <FAQSection
        title="Alaska Shore Excursion Tour FAQs"
        faqs={[
          {
            question: "What can I book on Welcome To Alaska Tours?",
            answer:
              "The catalog includes excursions from FareHarbor operators serving Juneau, Skagway, and Ketchikan, including whale watching, glacier experiences, helicopter and seaplane tours, dog sledding, fishing, wildlife, kayaking, rainforest adventures, sightseeing, and other port-day activities.",
          },
          {
            question: "Can I browse tours before picking a date?",
            answer:
              "Yes. Browse the catalog, port pages, or activity categories first, then open a tour's booking calendar to confirm current dates, times, pricing, and capacity.",
          },
          {
            question: "How should I choose the right tour for a cruise day?",
            answer:
              "Start with your port, ship timing, and all-aboard window. Then compare duration, meeting details, operator notes, and the live booking calendar before checkout.",
          },
        ]}
      />
    </>
  );
}
