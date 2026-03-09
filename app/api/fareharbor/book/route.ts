import { NextResponse } from "next/server";
import { assertBookingsEnabled, assertInternalSecret, createFareHarborBooking } from "@/lib/fareharbor";

function jsonError(message: string, status = 400, extra?: Record<string, unknown>) {
  return NextResponse.json({ success: false, error: message, ...extra }, { status });
}

export async function POST(req: Request) {
  try {
    try {
      assertInternalSecret(req);
    } catch (e: unknown) {
      const err = e as Error;
      return jsonError(String(err?.message || "Unauthorized (internal only)."), 403);
    }

    try {
      assertBookingsEnabled();
    } catch (e: unknown) {
      const err = e as Error;
      return jsonError(String(err?.message || "Bookings disabled."), 409);
    }

    const body = await req.json();

    const booking = await createFareHarborBooking({
      company: String(body?.company || ""),
      availabilityPk: Number(body?.availability_pk || 0),
      customerTypeRatePk: Number(body?.customer_type_rate_pk || 0),
      qty: Number(body?.qty || 0),
      contact: {
        name: String(body?.contact?.name || ""),
        email: String(body?.contact?.email || ""),
        phone: String(body?.contact?.phone || ""),
      },
      note: String(body?.note || "Booking via WTA (paid)"),
      amountPaid: Number(body?.amount_paid || 0),
      voucherNumber: body?.voucher_number ? String(body.voucher_number) : undefined,
    });

    return NextResponse.json({ success: true, booking });
  } catch (e: unknown) {
    const err = e as Error & { details?: unknown };
    return NextResponse.json(
      {
        success: false,
        error: "FareHarbor booking failed",
        details: err?.details || String(err?.message || e),
      },
      { status: 502 },
    );
  }
}
