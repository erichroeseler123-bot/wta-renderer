import { getWidgetTourState } from "@/lib/helicopterTours";
import { WidgetProduct } from "@/components/widget/WidgetProduct";
import { sanitizeTour } from "@/lib/tourSeo";
import { sanitizePlacementLabel, sanitizeWidgetLayout } from "@/lib/tourWidget";

function firstString(value: string | string[] | undefined): string | undefined {
  if (typeof value === "string") return value;
  if (Array.isArray(value)) return value[0];
  return undefined;
}

export default async function WidgetProductPage({
  params,
  searchParams,
}: {
  params: Promise<{ company: string; item: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const [{ company, item }, resolvedSearch] = await Promise.all([params, searchParams]);
  const state = await getWidgetTourState(company, item);

  const initialLayout = sanitizeWidgetLayout(firstString(resolvedSearch.layout));
  const initialAccent = firstString(resolvedSearch.accent);
  const initialPlacement = sanitizePlacementLabel(
    firstString(resolvedSearch.placement) ||
      firstString(resolvedSearch.widgetPlacement) ||
      firstString(resolvedSearch.widget_placement),
  );

  return (
    <WidgetProduct
      tour={state.tour ? sanitizeTour(state.tour) : null}
      status={state.status}
      reason={state.reason}
      requestedCompany={company}
      requestedItem={item}
      initialLayout={initialLayout}
      initialAccent={initialAccent}
      initialPlacement={initialPlacement}
    />
  );
}
