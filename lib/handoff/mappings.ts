export const dccPortToWtaPort: Record<string, string> = {
  juneau: "juneau",
  skagway: "skagway",
  ketchikan: "ketchikan",
};

export const dccCategoryToWtaCategory: Record<string, string> = {
  "whale-watching": "Whale Watching",
  glacier: "Hiking & Glaciers",
  helicopter: "Air Tours",
  fishing: "Fishing",
  wildlife: "Adventures",
  "city-tour": "Adventures",
};

export const dccEntityToWtaProduct: Record<string, { company: string; itemPk: number }> = {
  // Fill with canonical DCC entity slug -> concrete WTA product mapping as you onboard nodes.
  // Example:
  // "juneau-whale-watch-signature": { company: "alaska-galore-juneau-whale-watching", itemPk: 585466 },
};

export const companyToPort: Record<string, string> = {
  beyondak: "juneau",
  "alaska-galore-juneau-whale-watching": "juneau",
  akhummer: "ketchikan",
  alaskatales: "juneau",
  aktraveladventures: "juneau",
  exclusivealaska: "juneau",
  coastalhelicopters: "juneau",
  dolphintours: "juneau",
  moorecharters: "juneau",
  alaskarainforest: "ketchikan",
  ketchikanadventurevue: "ketchikan",
  akduck: "ketchikan",
  northstartrekking: "juneau",
  kayakketchikan: "ketchikan",
  skagwayscooters: "skagway",
  snorkelalaska: "ketchikan",
  taquanair: "ketchikan",
  "temsco-summercamp-juneau": "juneau",
  "temscoair-juneau": "juneau",
  "temscoair-skagway": "skagway",
  wingsairways: "juneau",
};

// Some FareHarbor companies sell inventory in more than one Alaska port.
// Item-level overrides keep those products in the correct storefront and preserve
// the right port attribution through timing checks and checkout.
export const itemToPort: Record<string, string> = {
  // Alaska Travel Adventures — Ketchikan
  "aktraveladventures:311655": "ketchikan",
  "aktraveladventures:311664": "ketchikan",
  "aktraveladventures:311666": "ketchikan",
  "aktraveladventures:311669": "ketchikan",
  "aktraveladventures:311677": "ketchikan",

  // Alaska Travel Adventures — Skagway
  "aktraveladventures:340207": "skagway",
  "aktraveladventures:343971": "skagway",
};

export function inferPortFromCompany(company: string, itemPk?: number | string | null): string | null {
  const key = String(company || "").trim().toLowerCase();
  const item = Number(itemPk || 0);
  if (key && item > 0) {
    const itemPort = itemToPort[`${key}:${item}`];
    if (itemPort) return itemPort;
  }
  return companyToPort[key] || null;
}
