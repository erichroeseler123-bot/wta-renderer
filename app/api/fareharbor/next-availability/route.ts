import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function ymdUTC(d: Date) {
  const yyyy = d.getUTCFullYear();
  const mm = String(d.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(d.getUTCDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function addDaysUTC(d: Date, days: number) {
  const x = new Date(d.getTime());
  x.setUTCDate(x.getUTCDate() + days);
  return x;
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const company = (url.searchParams.get("company") || "").trim();
    const item = (url.searchParams.get("item") || "").trim();
    const start = (url.searchParams.get("start") || "").trim();

    const horizonDays = Number(url.searchParams.get("horizonDays") || 365);
    const chunkDays = Number(url.searchParams.get("chunkDays") || 30);

    if (!company)
      return NextResponse.json(
        { ok: false, error: "Missing ?company=" },
        { status: 400 },
      );
    if (!item)
      return NextResponse.json(
        { ok: false, error: "Missing ?item=" },
        { status: 400 },
      );

    let cursor = start ? new Date(`${start}T00:00:00Z`) : new Date();
    if (Number.isNaN(cursor.getTime())) cursor = new Date();

    const endLimit = addDaysUTC(cursor, horizonDays);

    while (cursor <= endLimit) {
      const chunkEnd = addDaysUTC(cursor, chunkDays - 1);

      const s = ymdUTC(cursor);
      const e = ymdUTC(chunkEnd > endLimit ? endLimit : chunkEnd);

      const r = await fetch(
        `${url.origin}/api/fareharbor/availabilities?company=${encodeURIComponent(company)}&item=${encodeURIComponent(
          item,
        )}&start=${encodeURIComponent(s)}&end=${encodeURIComponent(e)}`,
        { cache: "no-store" },
      );

      const j = await r.json();

      const av = Array.isArray(j?.availabilities) ? j.availabilities : [];
      if (av.length > 0) {
        // choose earliest start_at / startAt
        const withStart = av
          .map((a: any) => ({
            raw: a,
            startAt:
              a.start_at ||
              a.startAt ||
              a.start_time ||
              a.start_datetime ||
              null,
          }))
          .filter((x: any) => x.startAt);

        withStart.sort((a: any, b: any) =>
          String(a.startAt).localeCompare(String(b.startAt)),
        );

        return NextResponse.json({
          ok: true,
          company,
          item: Number(item),
          searched: { start: s, end: e },
          next: withStart[0]?.raw || av[0],
          count: av.length,
          availabilities: av,
        });
      }

      cursor = addDaysUTC(chunkEnd, 1);
    }

    return NextResponse.json({
      ok: true,
      company,
      item: Number(item),
      searchedUntil: ymdUTC(endLimit),
      next: null,
      count: 0,
      availabilities: [],
    });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err?.message || String(err) },
      { status: 500 },
    );
  }
}
