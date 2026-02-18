import { NextResponse } from "next/server";

function pickEarliestStartAt(payload: any): string | null {
  // Support a few possible shapes:
  // - array of slots
  // - { availabilities: [...] }
  // - { results: [...] }
  const list =
    Array.isArray(payload) ? payload :
    Array.isArray(payload?.availabilities) ? payload.availabilities :
    Array.isArray(payload?.results) ? payload.results :
    Array.isArray(payload?.data) ? payload.data :
    [];

  let best: string | null = null;

  for (const x of list) {
    const s =
      x?.startAt ??
      x?.start_at ??
      x?.start ??
      x?.availability?.startAt ??
      null;

    if (typeof s === "string" && s.length >= 10) {
      if (!best || s < best) best = s;
    }
  }

  return best;
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const company = url.searchParams.get("company") || "";
    const itemPk = ((url.searchParams.get("item") ?? url.searchParams.get("itemPk")) || "").trim();

    if (!company || !itemPk) {
      return NextResponse.json(
        { startAt: null, error: "Missing company or item (or itemPk)" },
        { status: 400 }
      );
    }

    // Call OUR working availabilities endpoint on the same origin (works local + prod)
    const origin = url.origin;

    // Give it a decent window to find the next slot
    const start = new Date();
    const end = new Date();
    end.setDate(end.getDate() + 90);

    const fmt = (d: Date) => d.toISOString().slice(0, 10);

    const qs = new URLSearchParams({
      company: String(company),
      item: String(itemPk),
      start: fmt(start),
      end: fmt(end),
    });

    const res = await fetch(`${origin}/api/fareharbor/availabilities?${qs.toString()}`, {
      // keep it fresh-ish
      cache: "no-store",
    });

    const text = await res.text();
    let json: any = null;
    try { json = JSON.parse(text); } catch { json = text; }

    if (!res.ok) {
      return NextResponse.json(
        {
          startAt: null,
          error: `Availabilities endpoint error ${res.status}`,
          detail: json,
        },
        { status: 200 }
      );
    }

    const startAt = pickEarliestStartAt(json);

    return NextResponse.json({ startAt }, { status: 200 });
  } catch (e: any) {
    return NextResponse.json(
      { startAt: null, error: "next-availability failed", detail: String(e?.message || e) },
      { status: 200 }
    );
  }
}
