import {
  createFareHarborBooking,
  validateAndStoreAuthorizedFareHarborBooking,
} from "@/lib/fareharbor";
import type { OrderSnapshot } from "@/lib/orders";

export async function runFareHarborBookingsForOrder(
  order: OrderSnapshot,
  paymentIntentId: string,
  options?: { useValidatedBookingWhenDisabled?: boolean },
) {
  const results: Array<Record<string, unknown>> = [];
  const liveBookingsEnabled = String(process.env.FH_BOOKINGS_ENABLED || "0") === "1";

  for (const line of order.items) {
    try {
      const dccHandoffId = (order.attribution?.handoffId || line.handoffId || "").trim();
      const bookingNote = dccHandoffId
        ? `WTA order ${order.order_id} / PI ${paymentIntentId} / DCC ${dccHandoffId}`
        : `WTA order ${order.order_id} / PI ${paymentIntentId}`;
      const voucherNumber = dccHandoffId
        ? `WTA-${dccHandoffId}-${order.order_id.slice(0, 16)}`.slice(0, 64)
        : `WTA-${order.order_id}-${line.availabilityPk}-${line.ratePk}`.slice(0, 64);

      console.log("[fareharbor-booking]", {
        orderId: order.order_id,
        paymentIntentId,
        handoffId: dccHandoffId || null,
        company: line.company,
        availabilityPk: line.availabilityPk,
        ratePk: line.ratePk,
        note: bookingNote,
        voucherNumber,
      });

      const bookingInput = {
        company: line.company,
        itemPk: line.itemPk,
        itemName: line.title,
        startAt: line.startAt,
        availabilityPk: line.availabilityPk,
        customerTypeRatePk: line.ratePk,
        qty: line.qty,
        amountPaid: line.lineTotalCents,
        contact: order.contact,
        note: bookingNote,
        voucherNumber,
        orderId: order.order_id,
        paymentIntentId,
        handoffId: dccHandoffId || undefined,
      };

      const booking =
        !liveBookingsEnabled && options?.useValidatedBookingWhenDisabled
          ? await validateAndStoreAuthorizedFareHarborBooking(bookingInput)
          : await createFareHarborBooking(bookingInput);

      const maybeBooking =
        typeof booking === "object" && booking !== null
          ? (booking as Record<string, unknown>)
          : {};
      const b =
        maybeBooking["booking"] && typeof maybeBooking["booking"] === "object"
          ? (maybeBooking["booking"] as Record<string, unknown>)
          : maybeBooking;
      results.push({
        ok: true,
        line,
        booking: {
          pk: b["pk"],
          uuid: b["uuid"],
          display_id: b["display_id"],
          voucher_number: b["voucher_number"],
          note: b["note"],
          receipt_subtotal: b["receipt_subtotal"],
          receipt_taxes: b["receipt_taxes"],
          receipt_total: b["receipt_total"],
          invoice_price: b["invoice_price"],
          dashboard_url: b["dashboard_url"],
          start_at:
            b["availability"] && typeof b["availability"] === "object"
              ? (b["availability"] as Record<string, unknown>)["start_at"]
              : undefined,
        },
        rawBooking: b,
      });
    } catch (e: unknown) {
      const err = e as Error & { details?: unknown };
      results.push({
        ok: false,
        line,
        error: String(err?.message || e),
        details: err?.details || null,
      });
    }
  }

  return {
    results,
    allOk: results.every((x) => x.ok),
  };
}

