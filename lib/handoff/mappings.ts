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
  akhummer: "juneau",
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

export function inferPortFromCompany(company: string): string | null {
  const key = String(company || "").trim().toLowerCase();
  return companyToPort[key] || null;
}
