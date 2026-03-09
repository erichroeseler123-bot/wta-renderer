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

export const CRUISE_ITINERARY_HINTS: Partial<Record<CruiseShipName, { portSlug: string; window: string }>> = {
  "Norwegian Encore": { portSlug: "juneau", window: "07:00 - 20:00" },
  "Discovery Princess": { portSlug: "ketchikan", window: "06:30 - 18:00" },
  "Ovation of the Seas": { portSlug: "skagway", window: "07:00 - 17:00" },
};
