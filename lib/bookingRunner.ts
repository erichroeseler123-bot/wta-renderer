import { createFareHarborBooking } from "@/lib/fareharbor";
import type { OrderSnapshot } from "@/lib/orders";

export async function runFareHarborBookingsForOrder(order: OrderSnapshot, paymentIntentId: string) {
  const results: Array<Record<string, unknown>> = [];

  for (const line of order.items) {
    try {
      const booking = await createFareHarborBooking({
        company: line.company,
        availabilityPk: line.availabilityPk,
        customerTypeRatePk: line.ratePk,
        qty: line.qty,
        amountPaid: line.lineTotalCents,
        contact: order.contact,
        note: `WTA order ${order.order_id} / PI ${paymentIntentId}`,
        voucherNumber: `WTA-${order.order_id}-${line.availabilityPk}-${line.ratePk}`.slice(0, 64),
      });

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
          dashboard_url: b["dashboard_url"],
          start_at:
            b["availability"] && typeof b["availability"] === "object"
              ? (b["availability"] as Record<string, unknown>)["start_at"]
              : undefined,
        },
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
