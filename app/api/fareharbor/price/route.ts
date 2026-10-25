import { NextResponse } from "next/server";
import { resolveExactDeparturePrice } from "@/lib/fareharborAvailability";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const company = (url.searchParams.get("company") || "").trim();
    const item = (
      url.searchParams.get("item") ??
      url.searchParams.get("item_pk") ??
      url.searchParams.get("itemPk") ??
      ""
    ).trim();
    const availabilityPk = Number(
      url.searchParams.get("availability_pk") ??
        url.searchParams.get("availabilityPk") ??
        0,
    );
    const customerTypeRatePk = Number(
      url.searchParams.get("customer_type_rate_pk") ??
        url.searchParams.get("rate_pk") ??
        url.searchParams.get("ratePk") ??
        0,
    );
    const date = (
      url.searchParams.get("date") ??
      url.searchParams.get("day") ??
      ""
    ).trim();
    const startAt = (
      url.searchParams.get("start_at") ??
      url.searchParams.get("startAt") ??
      ""
    ).trim();
    const qty = Math.max(1, Math.floor(Number(url.searchParams.get("qty") || 1)));
    const expectedUnitParam =
      url.searchParams.get("expected_unit_cents") ??
      url.searchParams.get("expectedUnitCents");
    const expectedUnitCents =
      expectedUnitParam !== null && expectedUnitParam.trim() !== ""
        ? Number(expectedUnitParam)
        : null;

    const resolved = await resolveExactDeparturePrice({
      company,
      itemPk: item,
      availabilityPk,
      customerTypeRatePk,
      date: date || undefined,
      startAt: startAt || undefined,
      qty,
      expectedUnitCents,
    });

    if (!resolved.ok) {
      return NextResponse.json(
        {
          success: false,
          code: resolved.code,
          error: resolved.error,
        },
        { status: resolved.status },
      );
    }

    return NextResponse.json({
      success: true,
      company: resolved.company,
      item: String(resolved.itemPk),
      itemPk: resolved.itemPk,
      availabilityPk: resolved.availabilityPk,
      customerTypeRatePk: resolved.customerTypeRatePk,
      date: resolved.date,
      startAt: resolved.startAt,
      qty: resolved.qty,
      unitCents: resolved.unitCents,
      lineTotalCents: resolved.lineTotalCents,
      totalCents: resolved.lineTotalCents,
      currency: resolved.currency,
      fromDisplay: `$${(resolved.unitCents / 100).toFixed(2)}`,
      capacity: resolved.capacity,
      expectedUnitCents: resolved.expectedUnitCents,
      priceChanged: resolved.priceChanged,
      exactRateMatched: resolved.exactRateMatched,
    });
  } catch (e: unknown) {
    const err = e as Error;
    return NextResponse.json(
      { success: false, error: err?.message || "Unknown error" },
      { status: 500 },
    );
  }
}

