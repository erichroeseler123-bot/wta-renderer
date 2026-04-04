import { NextResponse } from "next/server";
import path from "path";
import { promises as fs } from "fs";
import { getVisibility } from "@/lib/visibilityStore";
import { getToursFromFareHarbor, type Tour as LiveTour } from "@/lib/data/tours";

type Tour = {
  pk: number;
  title: string;
  slug: string;
  description?: string;
  image?: string;
  company: string;
  fromPrice?: string;
  rateSummary?: string;
  category?: string;
};

function asCatalogTour(live: LiveTour): Tour {
  return {
    pk: Number(live.pk || 0),
    title: String(live.title || ""),
    slug: String(live.slug || ""),
    description: String(live.description || ""),
    image: live.image || undefined,
    company: String(live.fareharbor?.company || ""),
    fromPrice: live.fromPrice || undefined,
    category: live.port || undefined,
  };
}

export async function GET() {
  const p = path.join(process.cwd(), "public", "data", "tours.json");

  let tours: Tour[] = [];
  const liveTours = await getToursFromFareHarbor().catch(() => []);
  tours = liveTours.map(asCatalogTour).filter((t) => t.company && t.pk > 0);

  if (tours.length < 1) {
    try {
      const raw = await fs.readFile(p, "utf8");
      const parsed = JSON.parse(raw);
      tours = Array.isArray(parsed) ? (parsed as Tour[]) : [];
    } catch {
      tours = [];
    }
  }

  const vis = await getVisibility();

  const filtered = tours.filter((t) => {
    if (vis.providers?.[t.company]) return false;
    const key = `${t.company}:${t.pk}`;
    if (vis.tours?.[key]) return false;
    return true;
  });

  return NextResponse.json({ success: true, count: filtered.length, tours: filtered });
}
