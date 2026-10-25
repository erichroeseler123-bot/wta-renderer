import {
  createFareHarborBooking,
  isAmbiguousProviderTimeoutError,
} from "@/lib/fareharbor";
import { getKV } from "@/lib/kv";
import { ORDER_TTL_SECONDS, type OrderLine, type OrderSnapshot } from "@/lib/orders";
import { sanitizePlacementLabel } from "@/lib/tourWidget";

type LineAttemptRecord = {
  status: "in_flight" | "booked" | "ambiguous_timeout" | "failed";
  voucherNumber: string;
  booking?: Record<string, unknown>;
  error?: string;
  updatedAt: string;
};

function makeLineKey(line: OrderLine, idx: number): string {
  return `${idx}:${line.company}:${line.itemPk}:${line.availabilityPk}:${line.ratePk}`;
}

function makeVoucherNumber(orderId: string, line: OrderLine): string {
  return `WTA-${orderId}-${line.availabilityPk}-${line.ratePk}`.slice(0, 64);
}

function matchesOrderLine(existingLine: unknown, line: OrderLine): boolean {
  if (!existingLine || typeof existingLine !== "object") return false;
  const candidate = existingLine as Partial<OrderLine>;
  return (
    String(candidate.company || "") === String(line.company || "") &&
    Number(candidate.itemPk) === Number(line.itemPk) &&
    Number(candidate.availabilityPk) === Number(line.availabilityPk) &&
    Number(candidate.ratePk) === Number(line.ratePk)
  );
}

export type RunBookingsOptions = {
  forceRebookAfterManualCheck?: boolean;
};

export async function runFareHarborBookingsForOrder(
  order: OrderSnapshot,
  paymentIntentId: string,
  opts?: RunBookingsOptions,
) {
  const results: Array<Record<string, unknown>> = [];
  const kv = await getKV();
  const priorResults = Array.isArray(order.bookingResults) ? order.bookingResults : [];
  const forceRebook = opts?.forceRebookAfterManualCheck === true;

  for (let idx = 0; idx < order.items.length; idx += 1) {
    const line = order.items[idx];
    const lineKey = makeLineKey(line, idx);
    const attemptKey = `booking_attempt:${order.order_id}:${lineKey}`;
    const voucherNumber = makeVoucherNumber(order.order_id, line);

    const priorLineResult = priorResults.find((r) => matchesOrderLine(r?.line, line));
    const kvAttempt = kv ? await kv.get<LineAttemptRecord>(attemptKey) : null;

    // 1. If this line was already booked on an earlier attempt, preserve the existing booking without calling FareHarbor again.
    if (priorLineResult?.ok === true) {
      results.push(priorLineResult);
      continue;
    }
    if (kvAttempt?.status === "booked" && kvAttempt.booking) {
      results.push({
        ok: true,
        voucherNumber: kvAttempt.voucherNumber || voucherNumber,
        line,
        booking: kvAttempt.booking,
      });
      continue;
    }

    // 2. If a prior attempt for this line timed out ambiguously after dispatch (or is still marked in_flight),
    // do NOT blindly re-book unless an operator explicitly passes forceRebookAfterManualCheck after checking FareHarbor.
    const hadAmbiguousTimeout =
      priorLineResult?.ambiguousTimeout === true ||
      kvAttempt?.status === "ambiguous_timeout" ||
      kvAttempt?.status === "in_flight";

    if (hadAmbiguousTimeout && !forceRebook) {
      results.push({
        ok: false,
        ambiguousTimeout: true,
        requiresManualVerification: true,
        code: "ambiguous_provider_timeout",
        voucherNumber: kvAttempt?.voucherNumber || voucherNumber,
        line,
        error:
          typeof priorLineResult?.error === "string" && priorLineResult.error
            ? priorLineResult.error
            : `Ambiguous provider timeout on prior attempt (voucher ${voucherNumber}); manual operator verification is required before re-booking to prevent a duplicate reservation.`,
      });
      continue;
    }

    try {
      const dccHandoffId = order.attribution?.handoffId?.trim();
      const placement =
        sanitizePlacementLabel(line.widgetPlacement) ||
        sanitizePlacementLabel(order.attribution?.widgetPlacements?.[0]) ||
        sanitizePlacementLabel(order.attribution?.widgetPlacement);
      const noteParts = [`WTA order ${order.order_id}`, `PI ${paymentIntentId}`];
      if (dccHandoffId) noteParts.push(`DCC ${dccHandoffId}`);
      if (placement) noteParts.push(`Placement ${placement}`);
      const bookingNote = noteParts.join(" / ");

      if (kv) {
        await kv.set(
          attemptKey,
          {
            status: "in_flight",
            voucherNumber,
            updatedAt: new Date().toISOString(),
          } satisfies LineAttemptRecord,
          { ex: ORDER_TTL_SECONDS },
        );
      }

      console.log("[fareharbor-booking]", {
        orderId: order.order_id,
        paymentIntentId,
        handoffId: dccHandoffId ?? null,
        widgetPlacement: placement ?? null,
        company: line.company,
        availabilityPk: line.availabilityPk,
        ratePk: line.ratePk,
        voucherNumber,
        note: bookingNote,
      });

      const booking = await createFareHarborBooking({
        company: line.company,
        availabilityPk: line.availabilityPk,
        customerTypeRatePk: line.ratePk,
        qty: line.qty,
        amountPaid: line.lineTotalCents,
        contact: order.contact,
        note: bookingNote,
        voucherNumber,
      });

      const maybeBooking =
        typeof booking === "object" && booking !== null
          ? (booking as Record<string, unknown>)
          : {};
      const b =
        maybeBooking["booking"] && typeof maybeBooking["booking"] === "object"
          ? (maybeBooking["booking"] as Record<string, unknown>)
          : maybeBooking;

      const bookingSummary = {
        pk: b["pk"],
        uuid: b["uuid"],
        display_id: b["display_id"],
        dashboard_url: b["dashboard_url"],
        start_at:
          b["availability"] && typeof b["availability"] === "object"
            ? (b["availability"] as Record<string, unknown>)["start_at"]
            : undefined,
      };

      if (kv) {
        await kv.set(
          attemptKey,
          {
            status: "booked",
            voucherNumber,
            booking: bookingSummary,
            updatedAt: new Date().toISOString(),
          } satisfies LineAttemptRecord,
          { ex: ORDER_TTL_SECONDS },
        );
      }

      results.push({
        ok: true,
        voucherNumber,
        line,
        booking: bookingSummary,
      });
    } catch (e: unknown) {
      const err = e as Error & { details?: unknown; code?: string };
      const ambiguous = isAmbiguousProviderTimeoutError(err);
      const errMsg = ambiguous
        ? `Ambiguous provider timeout after request dispatch (${String(
            err?.message || e,
          )}). Reservation may have been created under voucher ${voucherNumber}; manual operator verification is required before re-booking.`
        : String(err?.message || e);

      if (kv) {
        await kv.set(
          attemptKey,
          {
            status: ambiguous ? "ambiguous_timeout" : "failed",
            voucherNumber,
            error: errMsg,
            updatedAt: new Date().toISOString(),
          } satisfies LineAttemptRecord,
          { ex: ORDER_TTL_SECONDS },
        );
      }

      results.push({
        ok: false,
        ambiguousTimeout: ambiguous,
        requiresManualVerification: ambiguous,
        code: ambiguous ? "ambiguous_provider_timeout" : err?.code || "booking_failed",
        voucherNumber,
        line,
        error: errMsg,
        details: err?.details || null,
      });
    }
  }

  return {
    results,
    allOk: results.every((x) => x.ok),
    hasAmbiguousTimeout: results.some((x) => x.ambiguousTimeout === true),
  };
}
