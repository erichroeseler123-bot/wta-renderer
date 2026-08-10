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

  return (
    <>
      <JsonLd data={itemListSchema} />
      <div className="mx-auto max-w-7xl px-4 pt-8 sm:px-6 space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex rounded-full border border-sky-500/30 bg-sky-500/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-sky-400">
            Alaska Excursion Catalog
          </div>
          <h1 className="text-3xl font-black tracking-tight text-white sm:text-4xl leading-tight">
            Browse Alaska Shore Excursions
          </h1>
          <p className="text-sm text-slate-300 max-w-2xl mx-auto">
            Compare the bookable inventory currently available on Welcome To Alaska Tours, then use your ship and port timing to decide what fits your cruise day.
          </p>
        </div>

        <div className="rounded-[2.5rem] border border-white/10 bg-white/[0.05] p-6">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-xs font-black uppercase tracking-[0.16em] text-sky-400">
                Shop by experience
              </h2>
              <p className="mt-1 text-xs text-slate-400">
                Juneau currently has the deepest live booking inventory. These category pages also help you compare the broader Alaska excursion landscape as inventory expands.
              </p>
            </div>
            <Link href="/#find-your-port-day" className="text-xs font-bold text-cyan-300 hover:text-cyan-200">
              Start with my port day →
            </Link>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link href="/categories/juneau-helicopter-tours" className="rounded-xl border border-sky-200 bg-white px-3 py-1.5 text-xs font-bold text-sky-950 hover:bg-sky-50 transition">Helicopter Tours</Link>
            <Link href="/categories/glacier-tours" className="rounded-xl border border-sky-200 bg-white px-3 py-1.5 text-xs font-bold text-sky-950 hover:bg-sky-50 transition">Glacier Tours</Link>
            <Link href="/categories/dog-sledding" className="rounded-xl border border-sky-200 bg-white px-3 py-1.5 text-xs font-bold text-sky-950 hover:bg-sky-50 transition">Glacier Dog Sledding</Link>
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
            question: "What can I book on Welcome To Alaska Tours right now?",
            answer:
              "The live catalog currently has its strongest bookable inventory in Juneau, especially helicopter, glacier, dog sledding, and related experiences. Skagway and Ketchikan are also part of the cruise-day planning experience while additional bookable inventory is added.",
          },
          {
            question: "Can I browse tours before picking a date?",
            answer:
              "Yes. You can compare tour and category pages first, then open the booking calendar to confirm current dates, times, pricing, and capacity.",
          },
          {
            question: "How should I choose the right tour for a cruise day?",
            answer:
              "Start with your port, ship timing, and all-aboard window. Then compare tour duration, meeting details, operator notes, and the live booking calendar before checkout.",
          },
        ]}
      />
    </>
  );
}
