/**
 * Utility module for cruise-port arrival, departure, and excursion timing calculations.
 */

/**
 * Converts various time formats (e.g. "07:00", "19:30", "10:30 AM", "4:15 PM")
 * into minutes from midnight (0 to 1439).
 */
export function parseTimeToMinutes(timeStr: string): number | null {
  const clean = timeStr.trim();
  
  // 1. Try 24-hour format: hh:mm or hh:mm:ss
  const match24 = clean.match(/^(\d{1,2}):(\d{2})(?::\d{2})?$/);
  if (match24) {
    const h = parseInt(match24[1], 10);
    const m = parseInt(match24[2], 10);
    if (h >= 0 && h < 24 && m >= 0 && m < 60) {
      return h * 60 + m;
    }
  }

  // 2. Try 12-hour format: hh:mm AM/PM or hh:mmAM/PM
  const match12 = clean.match(/^(\d{1,2}):(\d{2})\s*(am|pm)$/i);
  if (match12) {
    let h = parseInt(match12[1], 10);
    const m = parseInt(match12[2], 10);
    const pm = match12[3].toLowerCase() === "pm";
    if (h >= 1 && h <= 12 && m >= 0 && m < 60) {
      if (h === 12) {
        h = pm ? 12 : 0;
      } else if (pm) {
        h += 12;
      }
      return h * 60 + m;
    }
  }

  return null;
}

/**
 * Converts minutes from midnight back to 12-hour AM/PM format (e.g. 780 -> "1:00 PM").
 */
export function formatMinutesToTime(minutes: number): string {
  const h = Math.floor(minutes / 60) % 24;
  const m = minutes % 60;
  const ampm = h >= 12 ? "PM" : "AM";
  const displayH = h % 12 === 0 ? 12 : h % 12;
  const displayM = String(m).padStart(2, "0");
  return `${displayH}:${displayM} ${ampm}`;
}

export type TimingStatus = "safe" | "tight" | "unsafe" | "unknown";

export type TimingEvaluation = {
  status: TimingStatus;
  reason: string;
  bufferMinutes?: number;
  missingFields?: string[];
};

/**
 * Evaluates timing compatibility for a tour start and duration relative to ship timing.
 * 
 * Rules:
 * - Ship All-Aboard = Ship Departure - 30 minutes
 * - Tour Start must be at least 45 minutes after Ship Arrival (Disembarkation window).
 *   (If start is between 15-45 minutes of arrival, it's flagged as Tight; < 15 is Unsafe).
 * - Tour End (Start + Duration) + 45 minutes return buffer must be <= Ship All-Aboard.
 *   (If tour end is within 15-45 minutes of all-aboard, it's flagged as Tight; < 15 is Unsafe).
 */
export function evaluatePortDayFit({
  shipArrival,
  shipDeparture,
  tourStart,
  durationMinutes,
}: {
  shipArrival?: string | null;
  shipDeparture?: string | null;
  tourStart?: string | null;
  durationMinutes?: number | null;
}): TimingEvaluation {
  const missingFields: string[] = [];
  if (!shipArrival) missingFields.push("shipArrival");
  if (!shipDeparture) missingFields.push("shipDeparture");
  if (!tourStart) missingFields.push("tourStart");
  if (!durationMinutes || durationMinutes <= 0) missingFields.push("durationMinutes");

  if (missingFields.length > 0) {
    return {
      status: "unknown",
      reason: "Missing required timing details (ship parameters or tour duration).",
      missingFields,
    };
  }

  const arrivalMin = parseTimeToMinutes(shipArrival!);
  const departureMin = parseTimeToMinutes(shipDeparture!);
  const startMin = parseTimeToMinutes(tourStart!);

  if (arrivalMin === null || departureMin === null || startMin === null) {
    return {
      status: "unknown",
      reason: "Invalid time format in ship schedule or excursion departure.",
      missingFields: ["invalidTimeFormat"],
    };
  }

  const allAboardMin = departureMin - 30;
  const tourEndMin = startMin + durationMinutes!;

  // 1. Unsafe returns or disembarkation conflicts
  if (tourEndMin + 15 > allAboardMin) {
    return {
      status: "unsafe",
      reason: `Returns at ${formatMinutesToTime(tourEndMin)}, leaving less than 15 minutes before ship all-aboard (${formatMinutesToTime(allAboardMin)}).`,
      bufferMinutes: allAboardMin - tourEndMin,
    };
  }
  if (startMin < arrivalMin + 15) {
    return {
      status: "unsafe",
      reason: `Departs at ${formatMinutesToTime(startMin)}, leaving too little buffer for ship disembarkation after arrival (${formatMinutesToTime(arrivalMin)}).`,
      bufferMinutes: startMin - arrivalMin,
    };
  }

  // 2. Tight returns or disembarkation conflicts
  if (tourEndMin + 45 > allAboardMin) {
    return {
      status: "tight",
      reason: `Returns at ${formatMinutesToTime(tourEndMin)}, leaving a tight ${allAboardMin - tourEndMin}-minute buffer before all-aboard (${formatMinutesToTime(allAboardMin)}).`,
      bufferMinutes: allAboardMin - tourEndMin,
    };
  }
  if (startMin < arrivalMin + 45) {
    return {
      status: "tight",
      reason: `Departs at ${formatMinutesToTime(startMin)}, leaving a tight ${startMin - arrivalMin}-minute window after ship arrival (${formatMinutesToTime(arrivalMin)}).`,
      bufferMinutes: startMin - arrivalMin,
    };
  }

  // 3. Comfortable safe fit
  return {
    status: "safe",
    reason: `Fits comfortably. Returns at ${formatMinutesToTime(tourEndMin)}, leaving a ${allAboardMin - tourEndMin}-minute buffer before all-aboard.`,
    bufferMinutes: allAboardMin - tourEndMin,
  };
}
