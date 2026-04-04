import type { Metadata } from "next";
import { getHelicopterTour } from "@/lib/helicopterTours";
import { buildTourUrl, cleanTourDescription, sanitizeTour } from "@/lib/tourSeo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ company: string; item: string }>;
}): Promise<Metadata> {
  const { company, item } = await params;
  const tour = await getHelicopterTour(company, item);

  if (!tour) {
    return {
      title: "Tour Details | Welcome To Alaska Tours",
      description: "View Alaska helicopter tour details and continue to booking.",
    };
  }

  const safeTour = sanitizeTour(tour);

  const title = `${safeTour.title} | Welcome To Alaska Tours`;
  const description = cleanTourDescription(safeTour.description);
  const image = safeTour.image || "/hero/hero5678.jpg";
  const url = buildTourUrl(safeTour);

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      images: [{ url: image }],
      type: "article",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },
  };
}

export default function TourItemLayout({ children }: { children: React.ReactNode }) {
  return children;
}
