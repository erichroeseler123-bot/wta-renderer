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
            Tour Catalog
          </div>
          <h1 className="text-3xl font-black tracking-tight text-white sm:text-4xl leading-tight">
            Live Shore Excursion Catalog
          </h1>
          <p className="text-sm text-slate-300 max-w-xl mx-auto">
            Directly connected to local operator flight and landing calendars. Verify timing compatibility with your cruise schedule.
          </p>
        </div>

        <div className="rounded-[2.5rem] border border-white/10 bg-white/[0.05] p-6">
          <h2 className="text-xs font-black uppercase tracking-[0.16em] text-sky-400">
            Browse Excursion Categories
          </h2>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link
              href="/categories/juneau-helicopter-tours"
              className="rounded-xl border border-sky-200 bg-white px-3 py-1.5 text-xs font-bold text-sky-950 hover:bg-sky-50 transition"
            >
              Helicopter Tours
            </Link>
            <Link
              href="/categories/glacier-tours"
              className="rounded-xl border border-sky-200 bg-white px-3 py-1.5 text-xs font-bold text-sky-950 hover:bg-sky-50 transition"
            >
              Glacier Tours
            </Link>
            <Link
              href="/categories/dog-sledding"
              className="rounded-xl border border-sky-200 bg-white px-3 py-1.5 text-xs font-bold text-sky-950 hover:bg-sky-50 transition"
            >
              Glacier Dog Sledding
            </Link>
            <Link
              href="/categories/whale-watching"
              className="rounded-xl border border-sky-200 bg-white px-3 py-1.5 text-xs font-bold text-sky-950 hover:bg-sky-50 transition"
            >
              Whale Watching
            </Link>
            <Link
              href="/categories/mendenhall-glacier"
              className="rounded-xl border border-sky-200 bg-white px-3 py-1.5 text-xs font-bold text-sky-950 hover:bg-sky-50 transition"
            >
              Mendenhall Glacier
            </Link>
            <Link
              href="/categories/flightseeing"
              className="rounded-xl border border-sky-200 bg-white px-3 py-1.5 text-xs font-bold text-sky-950 hover:bg-sky-50 transition"
            >
              Flightseeing
            </Link>
          </div>
        </div>
      </div>
      <WidgetCatalog tours={tours} mode="tours" />
      <FAQSection
        title="Alaska Shore Excursion Tour FAQs"
        faqs={[
          {
            question: "What tours are currently available on Welcome To Alaska Tours?",
            answer:
              "The current catalog focuses on Juneau helicopter tours with live availability and booking flow support.",
          },
          {
            question: "Can I browse tours before picking a date?",
            answer:
              "Yes. Open any tour detail page first, then continue into the booking calendar when you are ready to compare dates.",
          },
          {
            question: "How should I choose the right tour for a cruise day?",
            answer:
              "Compare duration, operator notes, pricing, and currently posted departure windows against your ship schedule before checkout.",
          },
        ]}
      />
    </>
  );
}
