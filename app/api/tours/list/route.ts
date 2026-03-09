import { NextResponse } from "next/server";
import path from "path";
import { promises as fs } from "fs";
import { getVisibility } from "@/lib/visibilityStore";

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

export async function GET() {
  const p = path.join(process.cwd(), "public", "data", "tours.json");
  const raw = await fs.readFile(p, "utf8");
  const tours: Tour[] = JSON.parse(raw);

  const vis = await getVisibility();

  const filtered = tours.filter((t) => {
    if (vis.providers?.[t.company]) return false;
    const key = `${t.company}:${t.pk}`;
    if (vis.tours?.[key]) return false;
    return true;
  });

  return NextResponse.json({ success: true, count: filtered.length, tours: filtered });
}
