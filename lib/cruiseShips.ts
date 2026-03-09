export const CRUISE_SHIPS = [
  "Celebrity Edge",
  "Celebrity Millennium",
  "Coral Princess",
  "Crown Princess",
  "Discovery Princess",
  "Eurodam",
  "Grand Princess",
  "Koningsdam",
  "Nieuw Amsterdam",
  "Noordam",
  "Norwegian Bliss",
  "Norwegian Encore",
  "Norwegian Jade",
  "Ovation of the Seas",
  "Quantum of the Seas",
  "Radiance of the Seas",
  "Regatta",
  "Ruby Princess",
  "Seven Seas Explorer",
  "Seven Seas Mariner",
  "Silver Moon",
  "Silver Muse",
  "Star Breeze",
  "Westerdam",
  "Zaandam",
] as const;

export type CruiseShipName = (typeof CRUISE_SHIPS)[number];

type CruisePlanHint = {
  portSlug: string;
  window: string;
  departurePort: "seattle" | "vancouver";
};

export const CRUISE_ITINERARY_HINTS: Partial<Record<CruiseShipName, CruisePlanHint>> = {
  "Celebrity Edge": { portSlug: "juneau", window: "07:00 - 19:00", departurePort: "vancouver" },
  "Celebrity Millennium": { portSlug: "juneau", window: "07:00 - 20:00", departurePort: "vancouver" },
  "Coral Princess": { portSlug: "ketchikan", window: "06:30 - 17:30", departurePort: "vancouver" },
  "Crown Princess": { portSlug: "juneau", window: "07:00 - 20:00", departurePort: "seattle" },
  "Norwegian Encore": { portSlug: "juneau", window: "07:00 - 20:00", departurePort: "seattle" },
  "Eurodam": { portSlug: "juneau", window: "07:00 - 19:30", departurePort: "seattle" },
  "Grand Princess": { portSlug: "juneau", window: "07:00 - 19:30", departurePort: "vancouver" },
  "Koningsdam": { portSlug: "juneau", window: "07:00 - 19:00", departurePort: "vancouver" },
  "Nieuw Amsterdam": { portSlug: "juneau", window: "07:00 - 19:00", departurePort: "vancouver" },
  "Noordam": { portSlug: "skagway", window: "07:00 - 17:00", departurePort: "vancouver" },
  "Norwegian Bliss": { portSlug: "juneau", window: "07:00 - 19:30", departurePort: "seattle" },
  "Norwegian Jade": { portSlug: "skagway", window: "07:00 - 17:00", departurePort: "vancouver" },
  "Discovery Princess": { portSlug: "ketchikan", window: "06:30 - 18:00", departurePort: "seattle" },
  "Ovation of the Seas": { portSlug: "skagway", window: "07:00 - 17:00", departurePort: "seattle" },
  "Quantum of the Seas": { portSlug: "juneau", window: "07:00 - 19:00", departurePort: "seattle" },
  "Radiance of the Seas": { portSlug: "skagway", window: "07:00 - 17:00", departurePort: "vancouver" },
  "Regatta": { portSlug: "ketchikan", window: "07:30 - 17:30", departurePort: "vancouver" },
  "Ruby Princess": { portSlug: "juneau", window: "07:00 - 20:00", departurePort: "seattle" },
  "Seven Seas Explorer": { portSlug: "juneau", window: "07:00 - 18:30", departurePort: "vancouver" },
  "Seven Seas Mariner": { portSlug: "juneau", window: "07:00 - 18:30", departurePort: "vancouver" },
  "Silver Moon": { portSlug: "ketchikan", window: "07:00 - 17:00", departurePort: "vancouver" },
  "Silver Muse": { portSlug: "juneau", window: "07:00 - 18:30", departurePort: "vancouver" },
  "Star Breeze": { portSlug: "juneau", window: "07:00 - 18:00", departurePort: "vancouver" },
  "Westerdam": { portSlug: "juneau", window: "07:00 - 19:00", departurePort: "seattle" },
  "Zaandam": { portSlug: "ketchikan", window: "07:00 - 17:00", departurePort: "vancouver" },
};

const FIRST_SAILING_BY_DEPARTURE_PORT: Record<"seattle" | "vancouver", string> = {
  seattle: "2026-05-02",
  vancouver: "2026-05-03",
};

export function getFirstSailingDateForShip(ship: string): string {
  const hint = CRUISE_ITINERARY_HINTS[ship as CruiseShipName];
  if (!hint?.departurePort) return "";
  return FIRST_SAILING_BY_DEPARTURE_PORT[hint.departurePort] || "";
}
