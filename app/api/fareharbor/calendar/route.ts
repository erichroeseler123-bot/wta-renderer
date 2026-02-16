import { NextRequest, NextResponse } from "next/server";

function dayKey(iso: string) {
  return iso.slice(0, 10);
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  const company = searchParams.get("company");
  const item = searchParams.get("item");
  const start = searchParams.get("start"); // YYYY-MM-DD
  const end = searchParams.get("end"); // YYYY-MM-DD

  if (!company || !item || !start || !end) {
    return NextResponse.json(
      { ok: false, error: "Missing company, item, start, end" },
      { status: 400 },
    );
  }

  // Use your existing working engine (big horizon, chunk scan).
  // Horizon just needs to cover start->end window; give it a cushion.
  const startDate = new Date(start + "T00:00:00Z");
  const endDate = new Date(end + "T00:00:00Z");
  const ms = endDate.getTime() - startDate.getTime();
  const horizonDays = Math.max(1, Math.ceil(ms / 86400000) + 7);

  const base = `${req.nextUrl.origin}/api/fareharbor/next-availability`;
  const url =
    `${base}?company=${encodeURIComponent(company)}` +
    `&item=${encodeURIComponent(item)}` +
    `&start=${encodeURIComponent(start)}` +
    `&horizonDays=${horizonDays}` +
    `&chunkDays=30`;

  const r = await fetch(url, { cache: "no-store" });
  const j = await r.json();

  const avs: any[] = j.availabilities || [];
  const filtered = avs.filter((a) => {
    const s = a.start_at || a.startAt;
    if (!s) return false;
    const d = dayKey(s);
    return d >= start && d < end;
  });

  // group by day
  const byDay: Record<string, any[]> = {};
  for (const a of filtered) {
    const s = a.start_at || a.startAt;
    const d = dayKey(s);
    (byDay[d] ||= []).push(a);
  }

  // nice: day list sorted
  const days = Object.keys(byDay)
    .sort()
    .map((d) => ({
      day: d,
      slots: byDay[d].sort((x, y) => {
        const xs = (x.start_at || x.startAt) ?? "";
        const ys = (y.start_at || y.startAt) ?? "";
        return xs.localeCompare(ys);
      }),
    }));

  return NextResponse.json({
    ok: true,
    company,
    item: Number(item),
    start,
    end,
    days,
    totalSlots: filtered.length,
  });
}
