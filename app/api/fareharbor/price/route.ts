import { NextResponse } from "next/server";

type RateShape = { pk?: number; customer_prototype?: { total?: number } };
type AvailabilityShape = { pk?: number; availability_pk?: number; customer_type_rates?: RateShape[] };
type AvailabilitiesPayload = { availabilities?: AvailabilityShape[]; ok?: boolean };

function pickMinPriceCents(payload: AvailabilitiesPayload): number | null {
  const avails = Array.isArray(payload?.availabilities) ? payload.availabilities : [];
  let best: number | null = null;

  for (const a of avails) {
    const rates = Array.isArray(a?.customer_type_rates) ? a.customer_type_rates : [];
    for (const r of rates) {
      const cents = r?.customer_prototype?.total;
      if (typeof cents === "number" && cents > 0) {
        if (best === null || cents < best) best = cents;
      }
    }
  }

  return best;
}

function pickExactRateCents(payload: AvailabilitiesPayload, availabilityPk: number, customerTypeRatePk: number): number | null {
  const avails = Array.isArray(payload?.availabilities) ? payload.availabilities : [];
  const targetAvail = avails.find((a) => Number(a?.pk || a?.availability_pk) === availabilityPk);
  if (!targetAvail) return null;

  const rates = Array.isArray(targetAvail?.customer_type_rates) ? targetAvail.customer_type_rates : [];
  const targetRate = rates.find((r) => Number(r?.pk) === customerTypeRatePk);
  const cents = targetRate?.customer_prototype?.total;

  return typeof cents === "number" && cents > 0 ? cents : null;
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const company = (url.searchParams.get("company") || "").trim();
    const item = ((url.searchParams.get("item") ?? url.searchParams.get("item_pk") ?? url.searchParams.get("itemPk")) || "").trim();
    const availabilityPk = Number(url.searchParams.get("availability_pk") || 0);
    const customerTypeRatePk = Number(url.searchParams.get("customer_type_rate_pk") || 0);
    const qty = Math.max(1, Math.floor(Number(url.searchParams.get("qty") || 1)));

    if (!company || !item) {
      return NextResponse.json({ success: false, error: "Missing company or item" }, { status: 400 });
    }

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

    const json = (await res.json().catch(() => null)) as AvailabilitiesPayload | null;
    if (!res.ok || !json?.ok) {
      return NextResponse.json({ success: false, error: "Failed to read availabilities", details: json }, { status: 502 });
    }

    const exactCents =
      availabilityPk > 0 && customerTypeRatePk > 0
        ? pickExactRateCents(json, availabilityPk, customerTypeRatePk)
        : null;

    const baseCents = exactCents ?? pickMinPriceCents(json);
    if (!baseCents || baseCents <= 0) {
      return NextResponse.json({ success: false, error: "No valid price found" }, { status: 409 });
    }

    const lineTotalCents = baseCents * qty;

    return NextResponse.json({
      success: true,
      company,
      item,
      qty,
      unitCents: baseCents,
      lineTotalCents,
      totalCents: lineTotalCents,
      currency: "usd",
      fromDisplay: `$${Math.floor(baseCents / 100)}`,
      exactRateMatched: exactCents !== null,
    });
  } catch (e: unknown) {
    const err = e as Error;
    return NextResponse.json({ success: false, error: err?.message || "Unknown error" }, { status: 500 });
  }
}
