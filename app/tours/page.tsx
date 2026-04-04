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
