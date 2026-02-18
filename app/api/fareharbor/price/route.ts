import { NextResponse } from "next/server";

function pickMinPriceCents(payload: any): number | null {
  const avails = Array.isArray(payload?.availabilities) ? payload.availabilities : [];
  let best: number | null = null;

  for (const a of avails) {
    const rates = Array.isArray(a?.customer_type_rates) ? a.customer_type_rates : [];
    for (const r of rates) {
      const cents = r?.customer_prototype?.total; // 20900 => $209.00
      if (typeof cents === "number" && cents > 0) {
        if (best === null || cents < best) best = cents;
      }
    }
  }

  return best;
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const company = (url.searchParams.get("company") || "").trim();
    const item = ((url.searchParams.get("item") ?? url.searchParams.get("itemPk")) || "").trim();

    if (!company || !item) {
      return NextResponse.json({ ok: false, error: "Missing company or item" }, { status: 400 });
    }

    // 90 day window is usually enough for "From" price
    const start = new Date();
    const end = new Date();
    end.setDate(end.getDate() + 90);
    const fmt = (d: Date) => d.toISOString().slice(0, 10);

    const qs = new URLSearchParams({
      company,
      item,
      start: fmt(start),
      end: fmt(end),
    });

    const res = await fetch(`${url.origin}/api/fareharbor/availabilities?${qs.toString()}`, {
      cache: "no-store",
    });

    const json = await res.json().catch(() => null);
    const minCents = pickMinPriceCents(json);

    return NextResponse.json({
      ok: true,
      company,
      item,
      fromCents: minCents,
      fromDisplay: minCents ? `$${(minCents / 100).toFixed(0)}` : null,
    });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || "Unknown error" }, { status: 200 });
  }
}
