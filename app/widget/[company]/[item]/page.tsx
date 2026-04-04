import { redirect } from "next/navigation";
import { getHelicopterTour } from "@/lib/helicopterTours";
import { WidgetProduct } from "@/components/widget/WidgetProduct";
import { sanitizeTour } from "@/lib/tourSeo";

export default async function WidgetProductPage({
  params,
  searchParams,
}: {
  params: Promise<{ company: string; item: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const [{ company, item }, resolvedSearch] = await Promise.all([params, searchParams]);
  const tour = await getHelicopterTour(company, item);

  if (!tour) {
    const qs = new URLSearchParams();
    for (const [key, value] of Object.entries(resolvedSearch)) {
      if (typeof value === "string" && value) qs.set(key, value);
    }
    redirect(qs.toString() ? `/widget?${qs.toString()}` : "/widget");
  }

  return <WidgetProduct tour={sanitizeTour(tour)} />;
}
