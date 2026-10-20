import type { OrderSnapshot, OrderLine } from "@/lib/orders";

export type CancellationReason =
  | "customer_request"
  | "operator_cancelled"
  | "weather_safety"
  | "missed_ship"
  | "ship_delayed"
  | "medical_emergency"
  | "other";

export type PolicyEvaluationResult = {
  eligible: boolean;
  refundPercentage: number; // 0 to 100
  allowedRefundCents: number;
  feeDeductedCents: number;
  hoursUntilDeparture: number | null;
  policyMatched: string;
  explanation: string;
  isOverrideApplied: boolean;
};

// Operators that have explicit contractual 100% refund clauses for late/missed cruise ships
const OPERATORS_WITH_EXPLICIT_MISSED_SHIP_REFUNDS = new Set([
  "alaska-galore-juneau-whale-watching",
  "alaskatales",
  "kayakketchikan",
  "exclusivealaska",
  "beyondak",
  "akhummer",
  "snorkelalaska",
]);

// Gift card item PKs or title indicators that are strictly non-refundable across all operators
function isGiftCard(line: OrderLine): boolean {
  const title = (line.title || "").toLowerCase();
  const giftPks = new Set([223870, 238867, 214814, 229563, 356274, 4162, 115876, 225574, 392963]);
  return giftPks.has(line.itemPk) || title.includes("gift card") || title.includes("gift certificate");
}

function evaluateLineItemPolicy(
  line: OrderLine,
  reason: CancellationReason,
  now: Date
): {
  eligible: boolean;
  percentage: number;
  feeCents: number;
  policy: string;
  explanation: string;
  hoursUntilDeparture: number | null;
} {
  const lineTotal = line.lineTotalCents || 0;

  // 1. Gift cards: strictly non-refundable under all circumstances
  if (isGiftCard(line)) {
    return {
      eligible: false,
      percentage: 0,
      feeCents: lineTotal,
      policy: "gift_card_final_sale",
      explanation: "Gift cards and certificates are strictly non-refundable per operator terms.",
      hoursUntilDeparture: null,
    };
  }

  // 2. Operator cancellation, weather, or safety grounding: 100% full refund
  if (reason === "operator_cancelled" || reason === "weather_safety") {
    return {
      eligible: true,
      percentage: 100,
      feeCents: 0,
      policy: "operator_weather_safety_cancellation",
      explanation: "Full 100% refund issued due to operator cancellation, severe weather, or safety closure.",
      hoursUntilDeparture: null,
    };
  }

  // 3. Missed cruise ship or ship itinerary change:
  if (reason === "missed_ship" || reason === "ship_delayed") {
    if (OPERATORS_WITH_EXPLICIT_MISSED_SHIP_REFUNDS.has(line.company)) {
      return {
        eligible: true,
        percentage: 100,
        feeCents: 0,
        policy: "contractual_missed_ship_guarantee",
        explanation: `${line.company} operator contract explicitly guarantees a 100% refund for cruise ship port delays or itinerary cancellations.`,
        hoursUntilDeparture: null,
      };
    } else {
      // Taquan, Rainforest, TEMSCO, Ketchikan AdventureVue, etc. operate on a reschedule-first basis
      return {
        eligible: false,
        percentage: 0,
        feeCents: lineTotal,
        policy: "reschedule_first_or_operator_review",
        explanation: `${line.company} contract states late ship arrivals will be accommodated by rescheduling to a new tour time. Automated cancellation refund is not eligible without operator review.`,
        hoursUntilDeparture: null,
      };
    }
  }

  // 4. Customer-Initiated Cancellation (calculated from departure time)
  if (!line.startAt) {
    // If departure time is unknown, standard 24h fallback applies
    return {
      eligible: true,
      percentage: 100,
      feeCents: 0,
      policy: "standard_undated_fallback",
      explanation: "Standard cancellation applied (no departure timestamp recorded on line item).",
      hoursUntilDeparture: null,
    };
  }

  const departureDate = new Date(line.startAt);
  const diffMs = departureDate.getTime() - now.getTime();
  const hoursUntilDeparture = Math.round((diffMs / (1000 * 60 * 60)) * 10) / 10;

  // Past departure time: No-shows / post-departure cancellations are non-refundable
  if (hoursUntilDeparture <= 0) {
    return {
      eligible: false,
      percentage: 0,
      feeCents: lineTotal,
      policy: "post_departure_no_show",
      explanation: "Tour has already departed or customer is a no-show. 0% refund per operator contract.",
      hoursUntilDeparture,
    };
  }

  // Operator-Specific Product Rules
  // A. Skagway Scooters (item 13748: Guided Excursion)
  if (line.company === "skagwayscooters" && line.itemPk === 13748) {
    if (hoursUntilDeparture >= 72) {
      return {
        eligible: true,
        percentage: 100,
        feeCents: 0,
        policy: "skagway_scooters_72h_full_refund",
        explanation: "Cancelled with 72+ hours advance notice. 100% full refund per Skagway Scooters contract.",
        hoursUntilDeparture,
      };
    } else if (hoursUntilDeparture < 48) {
      return {
        eligible: false,
        percentage: 0,
        feeCents: lineTotal,
        policy: "skagway_scooters_48h_non_refundable",
        explanation: "Cancelled within 48 hours of departure. Strictly non-refundable per Skagway Scooters contract.",
        hoursUntilDeparture,
      };
    } else {
      // 48h to 72h: Contract does not grant automatic refund; requires operator review
      return {
        eligible: false,
        percentage: 0,
        feeCents: lineTotal,
        policy: "skagway_scooters_interim_requires_review",
        explanation: "Between 48 and 72 hours, operator review is required; automated refund is not eligible.",
        hoursUntilDeparture,
      };
    }
  }

  // B. Skagway Scooters Harley-Davidson Rental (item 589694)
  if (line.company === "skagwayscooters" && line.itemPk === 589694) {
    if (hoursUntilDeparture >= 24) {
      const fee = Math.min(lineTotal, 3000); // $30 fee
      return {
        eligible: true,
        percentage: Math.round(((lineTotal - fee) / lineTotal) * 100),
        feeCents: fee,
        policy: "skagway_scooters_harley_fee",
        explanation: "Cancelled prior to 24h. Refunded minus $30 cancellation booking charge per contract.",
        hoursUntilDeparture,
      };
    } else {
      return {
        eligible: false,
        percentage: 0,
        feeCents: lineTotal,
        policy: "skagway_scooters_harley_under_24h",
        explanation: "Cancelled within 24 hours of rental. Non-refundable per contract.",
        hoursUntilDeparture,
      };
    }
  }

  // C. Skagway Scooters KLR / Honda Rentals (items 522188, 523466)
  if (line.company === "skagwayscooters" && (line.itemPk === 522188 || line.itemPk === 523466)) {
    if (hoursUntilDeparture >= 24) {
      const fee = Math.min(lineTotal, 1000); // $10 processing fee
      return {
        eligible: true,
        percentage: Math.round(((lineTotal - fee) / lineTotal) * 100),
        feeCents: fee,
        policy: "skagway_scooters_processing_fee",
        explanation: "Cancelled prior to 24h. Refunded minus $10 processing fee per contract.",
        hoursUntilDeparture,
      };
    } else {
      return {
        eligible: false,
        percentage: 0,
        feeCents: lineTotal,
        policy: "skagway_scooters_rental_under_24h",
        explanation: "Cancelled within 24 hours of rental. Non-refundable per contract.",
        hoursUntilDeparture,
      };
    }
  }

  // D. TEMSCO Helicopters (Juneau & Skagway: items 214803, 214810, 214807, 213561, 213556)
  if (line.company.startsWith("temscoair")) {
    if (hoursUntilDeparture >= 24) {
      const fee = Math.round(lineTotal * 0.1); // 10% fee
      return {
        eligible: true,
        percentage: 90,
        feeCents: fee,
        policy: "temsco_10pct_cancellation_fee",
        explanation: "Cancelled prior to 24 hours. 10% cancellation fee deducted per TEMSCO contract.",
        hoursUntilDeparture,
      };
    } else {
      return {
        eligible: false,
        percentage: 0,
        feeCents: lineTotal,
        policy: "temsco_under_24h_non_refundable",
        explanation: "Cancelled within 24 hours of flight. Strictly non-refundable per TEMSCO contract.",
        hoursUntilDeparture,
      };
    }
  }

  // E. Ketchikan Duck Tour (item 4161)
  if (line.company === "akduck" && line.itemPk === 4161) {
    if (hoursUntilDeparture >= 336) { // 14 days
      return {
        eligible: true,
        percentage: 100,
        feeCents: 0,
        policy: "duck_tour_14_day_notice",
        explanation: "Cancelled with 14+ days advance notice. 100% full refund per Ketchikan Duck Tour contract.",
        hoursUntilDeparture,
      };
    } else {
      return {
        eligible: false,
        percentage: 0,
        feeCents: lineTotal,
        policy: "duck_tour_under_14_days",
        explanation: "14-day notice required to receive a refund per Ketchikan Duck Tour contract. Non-refundable.",
        hoursUntilDeparture,
      };
    }
  }

  // F. Moore Charters Private Charters (items 446029, 446030, 446031)
  if (line.company === "moorecharters" && (line.itemPk === 446029 || line.itemPk === 446030 || line.itemPk === 446031)) {
    if (hoursUntilDeparture >= 720) { // 30+ days
      return {
        eligible: true,
        percentage: 100,
        feeCents: 0,
        policy: "moore_private_30d_notice",
        explanation: "Cancelled with 30+ days advance notice. 100% full refund per Moore Charters contract.",
        hoursUntilDeparture,
      };
    } else if (hoursUntilDeparture >= 360) { // 15 to 29 days
      const half = Math.floor(lineTotal * 0.5);
      return {
        eligible: true,
        percentage: 50,
        feeCents: lineTotal - half,
        policy: "moore_private_15_29d_notice",
        explanation: "Cancelled with 15–29 days notice. 50% refund issued per Moore Charters contract.",
        hoursUntilDeparture,
      };
    } else {
      return {
        eligible: false,
        percentage: 0,
        feeCents: lineTotal,
        policy: "moore_private_under_15d",
        explanation: "Cancelled with under 15 days notice. Strictly non-refundable per Moore Charters contract.",
        hoursUntilDeparture,
      };
    }
  }

  // G. 7-Day Notice Excursions: Bears, Brews & Boardwalk (#563489), Taquan Bear Adventure (#392950)
  if (
    (line.company === "alaskarainforest" && line.itemPk === 563489) ||
    (line.company === "taquanair" && line.itemPk === 392950)
  ) {
    if (hoursUntilDeparture >= 168) { // 7 days
      return {
        eligible: true,
        percentage: 100,
        feeCents: 0,
        policy: "seven_day_advance_notice",
        explanation: "Cancelled with 7+ days advance notice. 100% full refund per operator contract.",
        hoursUntilDeparture,
      };
    } else {
      return {
        eligible: false,
        percentage: 0,
        feeCents: lineTotal,
        policy: "under_seven_days_non_refundable",
        explanation: "Cancelled with under 7 days advance notice. Non-refundable per operator contract.",
        hoursUntilDeparture,
      };
    }
  }

  // Default Standard Guided Excursion Policy: 24h advance notice for full refund
  if (hoursUntilDeparture >= 24) {
    return {
      eligible: true,
      percentage: 100,
      feeCents: 0,
      policy: "standard_24h_cancellation",
      explanation: "Cancelled with 24+ hours advance notice. 100% full refund per operator contract.",
      hoursUntilDeparture,
    };
  } else {
    return {
      eligible: false,
      percentage: 0,
      feeCents: lineTotal,
      policy: "under_24h_non_refundable",
      explanation: "Cancelled within 24 hours of departure. Non-refundable per standard excursion contract.",
      hoursUntilDeparture,
    };
  }
}

export function evaluateOrderCancellationPolicy(params: {
  order: OrderSnapshot;
  reason: CancellationReason;
  now?: Date;
  adminOverride?: boolean;
  adminRequestedCents?: number | null;
  adminRationale?: string;
}): PolicyEvaluationResult {
  const { order, reason, now = new Date(), adminOverride = false, adminRequestedCents = null, adminRationale = "" } = params;

  const remainingBalance = Math.max(0, order.totalCents - (order.refundAmountCents || 0));

  // 1. Administrative Override Logic
  if (adminOverride) {
    if (!adminRationale || adminRationale.trim().length < 5) {
      throw new Error("Admin override requires a descriptive administrative rationale.");
    }
    const requested = Number.isFinite(Number(adminRequestedCents)) ? Math.floor(Number(adminRequestedCents)) : remainingBalance;
    const capped = Math.min(Math.max(0, requested), remainingBalance);
    const pct = order.totalCents > 0 ? Math.round((capped / order.totalCents) * 100) : 0;

    return {
      eligible: capped > 0,
      refundPercentage: pct,
      allowedRefundCents: capped,
      feeDeductedCents: remainingBalance - capped,
      hoursUntilDeparture: null,
      policyMatched: "admin_override",
      explanation: `Administrative override authorized by staff: "${adminRationale.trim()}". Refund amount set to $${(capped / 100).toFixed(2)}.`,
      isOverrideApplied: true,
    };
  }

  // 2. Server-Enforced Policy Calculation across All Order Line Items
  // Any caller-supplied refundAmountCents from non-admin is strictly ignored!
  let totalAllowedCents = 0;
  let totalFeeCents = 0;
  const policiesMatched: string[] = [];
  const explanations: string[] = [];
  let minHoursUntilDeparture: number | null = null;

  for (const line of order.items) {
    const res = evaluateLineItemPolicy(line, reason, now);
    const lineTotal = line.lineTotalCents || 0;
    let allowedForLine = 0;
    if (res.feeCents > 0) {
      allowedForLine = Math.max(0, lineTotal - res.feeCents);
    } else {
      allowedForLine = Math.floor(lineTotal * (res.percentage / 100));
    }
    const finalAllowedForLine = Math.max(0, Math.min(allowedForLine, lineTotal));

    totalAllowedCents += finalAllowedForLine;
    totalFeeCents += (lineTotal - finalAllowedForLine);
    policiesMatched.push(res.policy);
    explanations.push(`${line.title || line.company}: ${res.explanation}`);

    if (res.hoursUntilDeparture !== null) {
      if (minHoursUntilDeparture === null || res.hoursUntilDeparture < minHoursUntilDeparture) {
        minHoursUntilDeparture = res.hoursUntilDeparture;
      }
    }
  }

  // Cap to remaining unrefunded balance
  const cappedAllowedCents = Math.min(totalAllowedCents, remainingBalance);
  const refundPercentage = order.totalCents > 0 ? Math.round((cappedAllowedCents / order.totalCents) * 100) : 0;

  return {
    eligible: cappedAllowedCents > 0,
    refundPercentage,
    allowedRefundCents: cappedAllowedCents,
    feeDeductedCents: remainingBalance - cappedAllowedCents,
    hoursUntilDeparture: minHoursUntilDeparture,
    policyMatched: policiesMatched.join(", "),
    explanation: explanations.join(" | "),
    isOverrideApplied: false,
  };
}
