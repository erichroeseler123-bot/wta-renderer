import type { Metadata } from "next";
import { getWidgetTourState } from "@/lib/helicopterTours";
import { buildTourUrl, cleanTourDescription, sanitizeTour } from "@/lib/tourSeo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ company: string; item: string }>;
}): Promise<Metadata> {
  const { company, item } = await params;
  const state = await getWidgetTourState(company, item);
  const tour = state.tour;

  if (!tour || state.status !== "active") {
    return {
      title: "Tour Widget | Welcome To Alaska Tours",
      description: "Embedded Alaska shore excursion widget.",
      robots: {
        index: false,
        follow: true,
      },
      alternates: {
        canonical: "https://www.welcometoalaskatours.com/tours",
      },
    };
  }

  const safeTour = sanitizeTour(tour);
  const canonical = buildTourUrl(safeTour);
  const description = cleanTourDescription(
    safeTour.description,
    "Embedded Alaska shore excursion information.",
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
