import { NextResponse } from "next/server";
import { getFareHarborAvailabilities } from "@/lib/fareharborAvailability";

export const dynamic = "force-dynamic";
export const revalidate = 0;

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

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
      const company = (url.searchParams.get("company") || "").trim();
      const item = ((url.searchParams.get("item") ?? url.searchParams.get("itemPk")) || "").trim();
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

    parseYmdUTC(start);
    parseYmdUTC(end);
    const merged = await getFareHarborAvailabilities(company, item, start, end);

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
