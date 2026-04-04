import FAQSection from "@/app/components/faq/FAQSection";
import Breadcrumbs from "@/app/components/seo/Breadcrumbs";
import JsonLd from "@/components/seo/JsonLd";
import { WidgetProduct } from "@/components/widget/WidgetProduct";
import { getHelicopterTour } from "@/lib/helicopterTours";
import {
  buildTourBreadcrumbSchema,
  buildTourFaqs,
  buildTourUrl,
  cleanTourDescription,
  sanitizeTour,
} from "@/lib/tourSeo";
import { notFound } from "next/navigation";
import StageTelemetry from "@/app/components/plan/StageTelemetry";

export default async function TourDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ company: string; item: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { company, item } = await params;
  const sp = await searchParams;
  const getParam = (value: string | string[] | undefined) => Array.isArray(value) ? String(value[0] || "") : String(value || "");
  const tour = await getHelicopterTour(company, item);

  if (!tour) {
    notFound();
  }

  const safeTour = sanitizeTour(tour);

  const heroSrc = safeTour.image && String(safeTour.image).trim() ? safeTour.image : "/hero/juneau.jpg";
  const description = cleanTourDescription(safeTour.description, "Alaska helicopter tour.");
  const seoData = {
    "@context": "https://schema.org",
    "@type": "TouristTrip",
    name: safeTour.title || "Alaska Helicopter Tour",
    description,
    image: heroSrc,
    url: buildTourUrl(safeTour),
    provider: {
      "@type": "Organization",
      name: "Welcome To Alaska Tours",
    },
  };
  const breadcrumbSchema = buildTourBreadcrumbSchema(safeTour);
  const faqs = buildTourFaqs(safeTour);

  const telemetryPayload = {
    event: "detail_view" as const,
    path: `/tours/${company}/${item}`,
    requestedLane: getParam(sp.requestedLane) || undefined,
    resolvedLane: getParam(sp.resolvedLane) || getParam(sp.lane) || undefined,
    degradedFallback: getParam(sp.degradedFallback) === "true" ? true : getParam(sp.degradedFallback) === "false" ? false : undefined,
    productSlug: `${safeTour.company}/${safeTour.slug || safeTour.pk}`,
    rank: getParam(sp.rank) ? Number(getParam(sp.rank)) : undefined,
    port: safeTour.port || undefined,
    topic: getParam(sp.topic) || undefined,
    subtype: getParam(sp.subtype) || undefined,
    sourcePage: getParam(sp.sourcePage) || getParam(sp.from) || undefined,
  };

  return (
    <>
      <StageTelemetry payload={telemetryPayload} enabled={Boolean(getParam(sp.from) === "plan" || getParam(sp.requestedLane))} />
      <JsonLd data={seoData} />
      <JsonLd data={breadcrumbSchema} />
      <main className="mx-auto w-full max-w-2xl px-4 pt-4 sm:px-6 sm:pt-6">
        <Breadcrumbs
          items={[
            { href: "/", label: "Home" },
            { href: "/tours", label: "Tours" },
            { label: safeTour.title },
          ]}
        />
      </main>
      <WidgetProduct tour={safeTour} catalogHrefBase="/tours" />
      <FAQSection title={`${safeTour.title} FAQs`} faqs={faqs} />
    </>
  );
}
