import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const BASE = "https://fareharbor.com/api/external/v1";
const MAX_RANGE_DAYS = 100;
// Keep a little buffer to avoid inclusive-range off-by-one weirdness.
const CHUNK_DAYS = 95;

function mustEnv(name: string) {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env var: ${name}`);
  return v;
}

function ymdUTC(d: Date) {
  const yyyy = d.getUTCFullYear();
  const mm = String(d.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(d.getUTCDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function parseYmdUTC(s: string) {
  const m = s.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!m) throw new Error(`Invalid date: ${s} (expected YYYY-MM-DD)`);
  const d = new Date(Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3])));
  if (Number.isNaN(d.getTime())) throw new Error(`Invalid date: ${s}`);
  return d;
}

function addDaysUTC(d: Date, days: number) {
  const x = new Date(d.getTime());
  x.setUTCDate(x.getUTCDate() + days);
  return x;
}

function daysBetweenInclusiveUTC(a: Date, b: Date) {
  const ms = 24 * 60 * 60 * 1000;
  const aa = Date.UTC(a.getUTCFullYear(), a.getUTCMonth(), a.getUTCDate());
  const bb = Date.UTC(b.getUTCFullYear(), b.getUTCMonth(), b.getUTCDate());
  return Math.floor((bb - aa) / ms) + 1;
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const company = (url.searchParams.get("company") || "").trim();
    const item = (url.searchParams.get("item") || "").trim();
    let start = (url.searchParams.get("start") || "").trim();
    let end = (url.searchParams.get("end") || "").trim();

    if (!company) {
      return NextResponse.json(
        { ok: false, error: "Missing ?company=SHORTNAME" },
        { status: 400 },
      );
    }
    if (!item) {
      return NextResponse.json(
        { ok: false, error: "Missing ?item=ITEM_PK" },
        { status: 400 },
      );
    }

    // default: next 7 days
    if (!start || !end) {
      const s = new Date();
      const e = new Date();
      e.setDate(e.getDate() + 7);
      start =
        start ||
        ymdUTC(new Date(Date.UTC(s.getFullYear(), s.getMonth(), s.getDate())));
      end =
        end ||
        ymdUTC(new Date(Date.UTC(e.getFullYear(), e.getMonth(), e.getDate())));
    }

    const APP = mustEnv("FAREHARBOR_APP_KEY");
    const USER = mustEnv("FAREHARBOR_USER_KEY");

    const startD = parseYmdUTC(start);
    const endD = parseYmdUTC(end);

    async function fetchChunk(sYmd: string, eYmd: string) {
      const fhUrl =
        `${BASE}/companies/${encodeURIComponent(company)}` +
        `/items/${encodeURIComponent(item)}` +
        `/minimal/availabilities/date-range/${encodeURIComponent(sYmd)}/${encodeURIComponent(eYmd)}/`;

      const resp = await fetch(fhUrl, {
        headers: {
          "X-FareHarbor-API-App": APP,
          "X-FareHarbor-API-User": USER,
          Accept: "application/json",
          "User-Agent": "wta-ui/1.0 (+welcometoalaskatours.com)",
        },
        cache: "no-store",
      });

      const text = await resp.text();
      if (!resp.ok) {
        return {
          ok: false as const,
          error: `FareHarbor request failed ${resp.status} ${resp.statusText}`,
          fhUrl,
          bodyPreview: text.slice(0, 400),
        };
      }

      const data = JSON.parse(text);
      return { ok: true as const, fhUrl, data };
    }

    const totalDays = daysBetweenInclusiveUTC(startD, endD);

    // If within limit, just do one call
    if (totalDays <= MAX_RANGE_DAYS) {
      const r = await fetchChunk(start, end);
      if (!r.ok) return NextResponse.json({ ...r, ok: false }, { status: 500 });

      const av = r.data.availabilities ?? [];
      return NextResponse.json({
        ok: true,
        company,
        item: Number(item),
        start,
        end,
        count: av.length,
        availabilities: av,
      });
    }

    // Otherwise chunk and merge
    let merged: any[] = [];
    let cursor = startD;

    while (cursor <= endD) {
      const chunkEnd = addDaysUTC(cursor, CHUNK_DAYS - 1);
      const actualEnd = chunkEnd > endD ? endD : chunkEnd;

      if (daysBetweenInclusiveUTC(cursor, actualEnd) > MAX_RANGE_DAYS) {
        throw new Error(
          `Internal chunking bug: requested >${MAX_RANGE_DAYS} days`,
        );
      }

      const sY = ymdUTC(cursor);
      const eY = ymdUTC(actualEnd);

      const r = await fetchChunk(sY, eY);
      if (!r.ok) return NextResponse.json({ ...r, ok: false }, { status: 500 });

      const av = r.data.availabilities ?? [];
      merged = merged.concat(av);

      cursor = addDaysUTC(actualEnd, 1);
    }

    return NextResponse.json({
      ok: true,
      company,
      item: Number(item),
      start,
      end,
      count: merged.length,
      availabilities: merged,
    });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err?.message || String(err) },
      { status: 500 },
    );
  }
}
