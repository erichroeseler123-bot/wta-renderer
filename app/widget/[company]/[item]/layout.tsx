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
      title: "Tour Widget | Welcome To Alaska Tours",
      description: "Embedded Juneau helicopter tour information.",
      robots: {
        index: false,
        follow: true,
      },
      alternates: {
        canonical: "https://welcometoalaskatours.com/tours",
      },
    };
  }

  const safeTour = sanitizeTour(tour);
  const canonical = buildTourUrl(safeTour);
  const description = cleanTourDescription(
    safeTour.description,
    "Embedded Juneau helicopter tour information."
  );

  return {
    title: `${safeTour.title} Widget | Welcome To Alaska Tours`,
    description,
    robots: {
      index: false,
      follow: true,
    },
    alternates: {
      canonical,
    },
    openGraph: {
      title: `${safeTour.title} Widget | Welcome To Alaska Tours`,
      description,
      url: canonical,
      images: safeTour.image ? [{ url: safeTour.image }] : undefined,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: `${safeTour.title} Widget | Welcome To Alaska Tours`,
      description,
      images: safeTour.image ? [safeTour.image] : undefined,
    },
  };
}

export default function WidgetProductLayout({ children }: { children: React.ReactNode }) {
  return children;
}
