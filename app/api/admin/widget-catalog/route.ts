import { NextResponse } from "next/server";
import { requireAdmin } from "../_lib/auth";
import { getHelicopterToursSnapshot } from "@/lib/helicopterTours";
import { sanitizeTour } from "@/lib/tourSeo";
import {
  formatWidgetDescription,
  formatWidgetDuration,
  formatWidgetPrice,
  getOperatorDisplayName,
  getPortDisplayName,
} from "@/lib/tourWidget";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const auth = await requireAdmin();
  if (!auth.ok) {
    return NextResponse.json(
      { success: false, error: "Unauthorized" },
      { status: 401, headers: { "Cache-Control": "no-store" } },
    );
  }

  const rawTours = await getHelicopterToursSnapshot();
  const tours = rawTours.map((raw) => {
    const tour = sanitizeTour(raw);
    const priceDisplay = formatWidgetPrice(tour);
    const durationLabel = formatWidgetDuration(tour);
    const descriptionLabel = formatWidgetDescription(tour);

    return {
      pk: tour.pk,
      slug: tour.slug,
      title: tour.title,
      company: tour.company,
      operatorName: getOperatorDisplayName(tour.company),
      port: tour.port,
      portName: getPortDisplayName(tour.port),
      category: tour.category || "Adventures",
      image: tour.image || "",
      hasImage: Boolean(tour.image && tour.image.trim()),
      fromPrice: tour.fromPrice || "",
      description: tour.description || "",
      durationLabel,
      descriptionLabel,
      priceDisplay,
    };
  });

  return NextResponse.json(
    {
      success: true,
      count: tours.length,
      tours,
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}
