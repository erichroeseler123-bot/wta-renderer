export type OperatorCancellationPolicy = {
  operatorName: string;
  shortTerms: string;
  guestCutoffNotice: string;
  faqAnswer: string;
  overviewCardText: string;
};

const OPERATOR_POLICIES: Record<
  string,
  {
    operatorName: string;
    weatherPolicy: string;
    guestCutoffNotice: string;
    shortSummary: string;
    detailedBullets: string[];
  }
> = {
  "dolphintours": {
    operatorName: "Dolphin Jet Boat Tours",
    weatherPolicy: "100% full refund if unsafe sea or weather conditions prevent operations.",
    guestCutoffNotice: "Full refund when canceled at least 24 hours prior to departure (7 days notice required for private tours or groups of 8+); non-refundable within 24 hours.",
    shortSummary: "100% refund for weather cancellations. Guest cancellations: 100% refund up to 24 hours prior (7 days for private tours/groups of 8+), non-refundable within 24 hours.",
    detailedBullets: [
      "24+ hours prior to departure: 100% full refund.",
      "Private charters or groups of 8+: 7 days advance notice required for full refund.",
      "Within 24 hours of departure: Non-refundable.",
    ],
  },
  "alaskatales": {
    operatorName: "Alaska Tales Whale Watching",
    weatherPolicy: "100% full refund in case of operator cancellation, late cruise ship arrival, medical emergency (with documentation), or cruise itinerary change.",
    guestCutoffNotice: "Full refund allowed up until 24 hours before the start of the tour; non-refundable within 24 hours.",
    shortSummary: "100% refund for weather or cruise delays. Guest cancellations: 100% refund up to 24 hours prior, non-refundable within 24 hours.",
    detailedBullets: [
      "24+ hours prior to tour start: 100% full refund.",
      "Within 24 hours of departure: Non-refundable (except for verified late ship arrival or cruise itinerary changes).",
    ],
  },
  "alaska-galore-juneau-whale-watching": {
    operatorName: "Alaska Galore Tours",
    weatherPolicy: "100% full refund if the operator cancels due to unsafe sea or weather conditions.",
    guestCutoffNotice: "30+ days prior (100% refund less $50 fee), 15–29 days prior (50%), non-refundable within 14 days of departure.",
    shortSummary: "100% refund for operator weather cancellations. Guest cancellations: 30+ days prior (full less $50 fee), 15–29 days (50%), within 14 days (non-refundable).",
    detailedBullets: [
      "30+ days prior to departure: 100% refund minus a $50 cancellation fee.",
      "15 to 29 days prior to departure: 50% refund.",
      "Within 14 days of departure: Non-refundable.",
    ],
  },
  "northstartrekking": {
    operatorName: "NorthStar Trekking",
    weatherPolicy: "100% full refund if mountain weather or safety conditions ground the aircraft.",
    guestCutoffNotice: "10% cancellation fee if canceled more than 24 hours in advance; non-refundable within 24 hours.",
    shortSummary: "100% refund for weather cancellations. Guest cancellations: 10% fee >24 hours prior, non-refundable within 24 hours.",
    detailedBullets: [
      "More than 24 hours prior to departure: 100% refund minus a 10% operator cancellation fee.",
      "Within 24 hours of departure: Non-refundable.",
    ],
  },
  "temscoair-juneau": {
    operatorName: "TEMSCO Helicopters",
    weatherPolicy: "100% full refund if mountain weather prevents safe flight operations, or if your cruise ship misses port.",
    guestCutoffNotice: "10% cancellation fee if canceled up to 24 hours prior; non-refundable within 24 hours.",
    shortSummary: "100% refund for weather cancellations. Guest cancellations: 10% fee up to 24 hours prior, non-refundable within 24 hours.",
    detailedBullets: [
      "Up to 24 hours prior to departure: 100% refund minus a 10% cancellation fee.",
      "Within 24 hours of departure: Non-refundable.",
    ],
  },
  "temscoair-skagway": {
    operatorName: "TEMSCO Helicopters",
    weatherPolicy: "100% full refund if mountain weather prevents safe flight operations, or if your cruise ship misses port.",
    guestCutoffNotice: "10% cancellation fee if canceled up to 24 hours prior; non-refundable within 24 hours.",
    shortSummary: "100% refund for weather cancellations. Guest cancellations: 10% fee up to 24 hours prior, non-refundable within 24 hours.",
    detailedBullets: [
      "Up to 24 hours prior to departure: 100% refund minus a 10% cancellation fee.",
      "Within 24 hours of departure: Non-refundable.",
    ],
  },
  "temsco-summercamp-juneau": {
    operatorName: "TEMSCO Helicopters",
    weatherPolicy: "100% full refund if weather prevents flight operations.",
    guestCutoffNotice: "10% cancellation fee up to 24 hours prior; non-refundable within 24 hours.",
    shortSummary: "100% refund for weather cancellations. Guest cancellations: 10% fee up to 24 hours prior, non-refundable within 24 hours.",
    detailedBullets: [
      "Up to 24 hours prior to departure: 100% refund minus a 10% cancellation fee.",
      "Within 24 hours of departure: Non-refundable.",
    ],
  },
  "coastalhelicopters": {
    operatorName: "Coastal Helicopters",
    weatherPolicy: "100% full refund if flight canceled due to weather/delay or if your cruise line cancels your sailing.",
    guestCutoffNotice: "7+ days prior (100% refund), 4–6 days prior (50%), non-refundable within 3 days of departure.",
    shortSummary: "100% refund if weather or cruise cancels. Guest cancellations: 7+ days (100%), 4–6 days (50%), within 3 days (non-refundable).",
    detailedBullets: [
      "7+ days prior to scheduled tour: 100% full refund.",
      "4 to 6 days prior to scheduled tour: 50% refund.",
      "Within 3 days of departure: Non-refundable.",
    ],
  },
  "beyondak": {
    operatorName: "Above & Beyond Alaska",
    weatherPolicy: "100% full refund if trip canceled due to unsafe weather, route conditions, or cruise ship sailing changes.",
    guestCutoffNotice: "72+ hours prior (100% refund); non-refundable under 72 hours of departure.",
    shortSummary: "100% refund if cruise changes or weather cancels. Guest cancellations: 100% refund 72+ hours prior, non-refundable under 72 hours.",
    detailedBullets: [
      "72+ hours prior to scheduled departure: 100% full refund.",
      "Under 72 hours of scheduled departure: Non-refundable.",
    ],
  },
  "akhummer": {
    operatorName: "Alaska Hummer Adventures",
    weatherPolicy: "100% full refund in case of operator cancellation due to weather or cruise ship port cancellation.",
    guestCutoffNotice: "Full refund with 14 days notice; non-refundable within 14 days of departure.",
    shortSummary: "100% refund for port or weather cancellation. Guest cancellations: 14+ days notice (100% refund), non-refundable within 14 days.",
    detailedBullets: [
      "14+ days notice of cancellation: 100% full refund.",
      "Within 14 days of departure: Non-refundable.",
    ],
  },
  "aktraveladventures": {
    operatorName: "Alaska Travel Adventures",
    weatherPolicy: "100% full refund if the excursion is canceled by the operator due to weather or safety.",
    guestCutoffNotice: "Full refund up to 7 days prior to departure; non-refundable within 7 days.",
    shortSummary: "100% refund for operator weather cancellation. Guest cancellations: full refund up to 7 days prior, non-refundable within 7 days.",
    detailedBullets: [
      "7+ days prior to departure: 100% full refund.",
      "Within 7 days of departure: Non-refundable.",
    ],
  },
  "exclusivealaska": {
    operatorName: "Exclusive Alaska Charters",
    weatherPolicy: "100% full refund if your ship cancels the port call or arrives late and the trip cannot safely operate.",
    guestCutoffNotice: "Full refund up to 24 hours prior to scheduled departure time; non-refundable within 24 hours.",
    shortSummary: "100% refund if ship cancels port or arrives late. Guest cancellations: 100% refund up to 24 hours prior, non-refundable within 24 hours.",
    detailedBullets: [
      "Up to 24 hours prior to departure: 100% full refund.",
      "Within 24 hours of departure: Non-refundable.",
    ],
  },
  "moorecharters": {
    operatorName: "Moore Charters",
    weatherPolicy: "100% full refund or rescheduling if weather, mechanical, or passenger minimum issues prevent departure.",
    guestCutoffNotice: "30+ days prior (100% refund), 15–29 days prior (50%), non-refundable within 14 days of departure.",
    shortSummary: "100% refund for weather/mechanical issues. Guest cancellations: 30+ days (100%), 15–29 days (50%), within 14 days (non-refundable).",
    detailedBullets: [
      "30+ days notice: 100% full refund.",
      "15 to 29 days notice: 50% refund.",
      "Within 14 days of departure: Non-refundable.",
    ],
  },
  "alaskarainforest": {
    operatorName: "Alaska Rainforest Sanctuary",
    weatherPolicy: "Operator reschedules for ship delays; 100% full refund if tour cannot operate due to safety.",
    guestCutoffNotice: "Full refund up to 7 days prior to date of service; non-refundable within 7 days.",
    shortSummary: "100% refund if tour cannot operate. Guest cancellations: full refund up to 7 days prior, non-refundable within 7 days.",
    detailedBullets: [
      "Up to 7 days prior to service: 100% full refund with no penalty.",
      "Within 7 days of departure: Non-refundable.",
    ],
  },
  "taquanair": {
    operatorName: "Taquan Air",
    weatherPolicy: "Operator reschedules for cruise ship delays; 100% full refund if weather or safety prevents flight operations.",
    guestCutoffNotice: "Changes and cancellations permitted up to 7 days prior with no penalty; non-refundable within 7 days.",
    shortSummary: "100% refund for weather flight cancellations. Guest cancellations: 7+ days prior (no penalty), non-refundable within 7 days.",
    detailedBullets: [
      "Up to 7 days prior to date of service: 100% full refund with no penalty.",
      "Within 7 days of departure: Non-refundable.",
    ],
  },
  "ketchikanadventurevue": {
    operatorName: "Ketchikan AdventureVue",
    weatherPolicy: "Operator reschedules for cruise ship delays; 100% full refund if tour cannot be provided.",
    guestCutoffNotice: "Cancellations permitted up to 14 days prior with no penalty; non-refundable within 14 days.",
    shortSummary: "100% refund if tour cannot be provided. Guest cancellations: 14+ days prior (no penalty), non-refundable within 14 days.",
    detailedBullets: [
      "14+ days prior to date of service: 100% full refund with no penalty.",
      "Within 14 days of departure: Non-refundable.",
    ],
  },
  "akduck": {
    operatorName: "Ketchikan Duck Tour",
    weatherPolicy: "100% full refund if excursion is canceled by operator due to mechanical or safety issues.",
    guestCutoffNotice: "14-day notice required for refund; non-refundable within 14 days of departure.",
    shortSummary: "100% refund for operator cancellations. Guest cancellations: 14-day notice required, non-refundable within 14 days.",
    detailedBullets: [
      "14+ days notice prior to tour: 100% full refund.",
      "Within 14 days of departure: Non-refundable.",
    ],
  },
  "kayakketchikan": {
    operatorName: "Southeast Sea Kayaks",
    weatherPolicy: "100% full refund if your ship skips port, arrives late, or if weather forces cancellation.",
    guestCutoffNotice: "Prior to 7 days of tour date (100% refund); non-refundable within 7 days of departure.",
    shortSummary: "100% refund if ship late or weather cancels. Guest cancellations: 7+ days prior (100%), non-refundable within 7 days.",
    detailedBullets: [
      "Prior to 7 days of tour date: 100% full refund.",
      "Within 7 days of departure: Non-refundable (unless seats can be resold).",
    ],
  },
  "skagwayscooters": {
    operatorName: "Skagway Scooters",
    weatherPolicy: "100% full refund in case of operator cancellation or unforeseen circumstances.",
    guestCutoffNotice: "72+ hours notice of cancellation (100% refund); non-refundable within 48 hours of departure.",
    shortSummary: "100% refund for operator cancellation. Guest cancellations: 72+ hours notice (100%), non-refundable within 48 hours.",
    detailedBullets: [
      "72+ hours notice of cancellation: 100% full refund.",
      "Within 48 hours of departure: Non-refundable.",
    ],
  },
  "snorkelalaska": {
    operatorName: "Snorkel Alaska",
    weatherPolicy: "100% full refund if your ship skips port or operator cancels due to weather.",
    guestCutoffNotice: "Minimum 24 hours notice of cancellation (100% refund); non-refundable within 24 hours.",
    shortSummary: "100% refund if ship skips port or weather cancels. Guest cancellations: 24+ hours notice (100%), non-refundable within 24 hours.",
    detailedBullets: [
      "24+ hours notice of cancellation: 100% full refund.",
      "Within 24 hours of departure: Non-refundable.",
    ],
  },
  "wingsairways": {
    operatorName: "Wings Airways",
    weatherPolicy: "100% full refund if seaplane flight is canceled due to low visibility or mountain weather.",
    guestCutoffNotice: "Canceled or rescheduled up to 24 hours in advance without penalty; non-refundable within 24 hours.",
    shortSummary: "100% refund for weather flight cancellations. Guest cancellations: 24+ hours prior (no penalty), non-refundable within 24 hours.",
    detailedBullets: [
      "Up to 24 hours in advance: Canceled or rescheduled without penalty (100% full refund).",
      "Within 24 hours of departure: Non-refundable.",
    ],
  },
};

export function getOperatorCancellationPolicy(
  company: string,
  _pk?: number | string,
  livePolicyText?: string,
): OperatorCancellationPolicy {
  const normComp = String(company || "").trim().toLowerCase();
  const entry = OPERATOR_POLICIES[normComp];

  if (entry) {
    const bulletsFormatted = entry.detailedBullets.map((b) => `• ${b}`).join("\n");
    const overviewCardText = `Weather & Safety Policy:\n${entry.weatherPolicy}\n\nGuest-Initiated Cancellation Deadlines (Pre-Payment Disclosure):\n${bulletsFormatted}`;
    const faqAnswer = `Safety is paramount in Southeast Alaska. ${entry.weatherPolicy} Pre-payment guest cancellation deadlines: ${entry.guestCutoffNotice}`;

    return {
      operatorName: entry.operatorName,
      shortTerms: entry.shortSummary,
      guestCutoffNotice: entry.guestCutoffNotice,
      faqAnswer,
      overviewCardText,
    };
  }

  // Fallback for unknown / unmapped operator: DO NOT default to Alaska Galore's 30/15/14 day deadlines!
  if (livePolicyText && livePolicyText.trim()) {
    const cleaned = livePolicyText.replace(/\*\*/g, "").trim();
    return {
      operatorName: "Tour Operator",
      shortTerms: "100% refund for operator weather cancellations. Guest cancellations subject to operator cutoff.",
      guestCutoffNotice: "Guest cancellations subject to operator notice deadlines disclosed prior to booking.",
      faqAnswer: `Safety is paramount in Southeast Alaska. If weather or safety prevents operations, you receive a 100% full refund. Guest cancellations are subject to operator cutoff policies: ${cleaned}`,
      overviewCardText: `Weather & Safety Policy:\n100% full refund if weather or safety prevents tour operations.\n\nOperator Policy Terms:\n${cleaned}`,
    };
  }

  return {
    operatorName: "Tour Operator",
    shortTerms: "100% refund for operator weather cancellations. Guest cancellations subject to operator cutoff terms.",
    guestCutoffNotice: "Guest cancellations subject to operator notice deadlines disclosed prior to booking.",
    faqAnswer:
      "Safety is paramount in Southeast Alaska. If severe weather or safety conditions force the operator to cancel, you receive a 100% full refund. Guest-initiated cancellation deadlines depend on the specific excursion and operator policy disclosed prior to payment.",
    overviewCardText:
      "Weather & Safety Policy:\n100% full refund if weather or safety prevents tour operations.\n\nGuest Cancellation Terms:\nGuest-initiated cancellation deadlines apply per operator policy. Contact customer support or review your selected date's booking terms prior to checkout.",
  };
}
