import { getHelicopterTours } from "@/lib/helicopterTours";
import { WidgetCatalog } from "@/components/widget/WidgetCatalog";
import { sanitizeTours } from "@/lib/tourSeo";

export const dynamic = "force-dynamic";

export default async function WidgetCatalogPage() {
  const tours = sanitizeTours(await getHelicopterTours());
  return <WidgetCatalog tours={tours} />;
}
