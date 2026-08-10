import { NextResponse } from "next/server";
import path from "node:path";
import { promises as fs } from "node:fs";
import { inferPortFromCompany } from "@/lib/handoff/mappings";
import { getVisibility } from "@/lib/visibilityStore";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Tour = {
  pk: number;
  title: string;
  company: string;
  category?: string;
};

type MatchState = {
  status: "match" | "no_match" | "error";
  firstStartAt?: string;
};

function normalize(s: string) {
  return String(s || "").trim().toLowerCase();
}

function dateIsIso(s: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(s);
}

async function loadTours() {
  const p = path.join(process.cwd(), "public", "data", "tours.json");
  const raw = await fs.readFile(p, "utf8");
  const all = JSON.parse(raw) as Tour[];
  const vis = await getVisibility();

  return all.filter((t) => {
    if (vis.providers?.[t.company]) return false;
    const key = `${t.company}:${t.pk}`;
    if (vis.tours?.[key]) return false;
    return true;
  });
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const date = String(url.searchParams.get("date") || "").trim();
    const port = normalize(url.searchParams.get("port") || "");
    const category = normalize(url.searchParams.get("category") || "");
    const limit = Math.max(1, Math.min(80, Number(url.searchParams.get("limit") || 48)));

    if (!date || !dateIsIso(date)) {
      return NextResponse.json({ success: false, error: "Missing or invalid date (YYYY-MM-DD required)." }, { status: 400 });
    }

    let tours = await loadTours();
    if (port) {
      tours = tours.filter((t) => inferPortFromCompany(t.company, t.pk) === port);
    }
    if (category) {
      tours = tours.filter((t) => normalize(t.category || "Adventures") === category);
    }

    tours = tours.slice(0, limit);
    const states: Record<string, MatchState> = {};
    const matches: Array<{ company: string; itemPk: number; firstStartAt?: string }> = [];
    const queue = [...tours];
    const origin = `${url.protocol}//${url.host}`;

    const workers = Array.from({ length: 6 }, async () => {
      while (queue.length) {
        const t = queue.shift();
        if (!t) return;

        const key = `${t.company}:${t.pk}:${date}`;
        try {
          const qs = new URLSearchParams({
            company: t.company,
            item: String(t.pk),
            start: date,
            end: date,
          });
          const res = await fetch(`${origin}/api/fareharbor/availabilities?${qs.toString()}`, {
            cache: "no-store",
          });
          const j = await res.json().catch(() => null);
          const av = Array.isArray(j?.availabilities) ? j.availabilities : [];
          const first = av[0] || null;
          const firstStartAt = String(first?.start_at || first?.startAt || "");

          if (av.length > 0) {
            states[key] = { status: "match", firstStartAt: firstStartAt || undefined };
            matches.push({
              company: t.company,
              itemPk: t.pk,
              firstStartAt: firstStartAt || undefined,
            });
          } else {
            states[key] = { status: "no_match" };
          }
        } catch {
          states[key] = { status: "error" };
        }
      }
    });

    await Promise.all(workers);

    return NextResponse.json({
      success: true,
      date,
      port: port || null,
      category: category || null,
      checked: tours.length,
      matched: matches.length,
      states,
      matches,
    });
  } catch (e: unknown) {
    const err = e as Error;
    return NextResponse.json(
      { success: false, error: String(err?.message || e) },
      { status: 500 },
    );
  }
}
