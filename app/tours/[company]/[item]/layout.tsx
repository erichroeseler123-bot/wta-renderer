import type { Metadata } from "next";
import fs from "node:fs/promises";
import path from "node:path";

type TourRecord = {
  company?: string;
  pk?: number | string;
  slug?: string;
  title?: string;
  shortDescription?: string;
  image?: string;
};

async function loadTour(company: string, item: string): Promise<TourRecord | null> {
  try {
    const file = path.join(process.cwd(), "public", "data", "tours.json");
    const raw = await fs.readFile(file, "utf8");
    const tours = JSON.parse(raw) as TourRecord[];
    const found =
      tours.find((t) => t.company === company && String(t.pk) === item) ||
      tours.find((t) => t.company === company && t.slug === item);
    return found || null;
  } catch {
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ company: string; item: string }>;
}): Promise<Metadata> {
  const { company, item } = await params;
  const tour = await loadTour(company, item);
  if (!tour) {
    return {
      title: "Tour Details | Welcome To Alaska Tours",
      description: "View live departures and rates for Alaska shore excursions.",
    };
  }

  const title = `${tour.title || "Alaska Shore Excursion"} | Welcome To Alaska Tours`;
  const description =
    tour.shortDescription ||
    "View live departures, choose your date and time, and check out securely.";
  const image = tour.image || "/hero/hero5678.jpg";
  const url = `https://welcometoalaskatours.com/tours/${company}/${item}`;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      images: [{ url: image }],
      type: "website",
    },
  };
}

export default function TourItemLayout({ children }: { children: React.ReactNode }) {
  return children;
}
