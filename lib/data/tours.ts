import { getFareHarborCredentials } from "@/lib/fareharbor";

export type Tour = {
  pk: number;
  slug: string;
  title: string;
  description: string;
  duration?: string;
  fromPrice?: string;
  port?: string; 
  image?: string;
  ai_summary?: string;
  fareharbor: {
    itemPk: number;
    company: string;
    url?: string;
  };
};

function cleanDescription(value: unknown) {
  return String(value || "")
    .replace(/\$\$/g, "$")
    .replace(/\s+/g, " ")
    .trim();
}

function extractDollarAmount(value: unknown) {
  const match = String(value || "").match(/\$\s*([0-9]{1,3}(?:,[0-9]{3})*|[0-9]+)/);
  if (!match) return null;
  const dollars = Number(String(match[1]).replace(/,/g, ""));
  return Number.isFinite(dollars) && dollars > 0 ? dollars : null;
}

function buildNorthstarFromPrice(item: any) {
  if (Number(item?.pk) === 405050) return "$419 Per Person (Flat Rate)";
  const candidates = [
    item?.structured_description?.pricing,
    item?.description,
    item?.headline,
  ];

  for (const candidate of candidates) {
    const dollars = extractDollarAmount(candidate);
    if (dollars) return `$${dollars} Per Person (Flat Rate)`;
  }

  return null;
}

function itemToTour(item: any, shortname: string): Tour {
  const name = item?.name || `Tour ${item?.pk ?? ""}`;
  const slug = (item?.slug || name).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  
  // FIX: Provide a fallback of 0 if price is missing, then check if it exists
  const rawPrice = item?.price || 0;
  const northstarPrice = shortname === "northstartrekking" ? buildNorthstarFromPrice(item) : null;
  let fromPrice = northstarPrice || (rawPrice > 0 ? `$${(rawPrice / 100).toFixed(0)} Per Person (Flat Rate)` : "Check Price");

  let desc = cleanDescription(item?.headline || item?.description) || "View details and availability.";
  if (shortname === "temscoair-skagway" && (Number(item?.pk) === 213556 || String(item?.pk) === "213556")) {
    fromPrice = "$439 Per Person (Flat Rate)";
    desc = "$439 Per Person (Flat Rate) | 2 Hours | All Ages | Glacier Landing & Guided Walk";
  } else if (shortname === "temscoair-skagway" && (Number(item?.pk) === 213561 || String(item?.pk) === "213561")) {
    fromPrice = "$599 Per Person (Flat Rate)";
    desc = "$599 Per Person (Flat Rate) | 2 Hours | All Ages | Glacier Dog Sledding Demonstration (No Sled Riding)";
  }
  desc = desc.replace(/^Starting at\s+/i, "");

  return {
    pk: Number(item?.pk || 0),
    slug,
    title: name,
    description: desc,
    duration: item?.duration_minutes ? `${Math.round(item.duration_minutes / 60 * 10) / 10} Hours` : undefined,
    fromPrice,
    image: item?.hero_image_url || item?.image_cdn_url || undefined,
    port: shortname,
    fareharbor: {
      itemPk: Number(item?.pk || 0),
      company: shortname,
      url: item?.url || undefined,
    },
  };
}

export async function getToursFromFareHarbor(): Promise<Tour[]> {
  if (process.env.NEXT_PHASE === "phase-production-build") {
    return [];
  }
  const companies = [
    'beyondak', 'alaska-galore-juneau-whale-watching', 'akhummer', 
    'alaskatales', 'aktraveladventures', 'exclusivealaska', 
    'coastalhelicopters', 'dolphintours', 'moorecharters', 
    'alaskarainforest', 'ketchikanadventurevue', 'akduck', 
    'northstartrekking', 'kayakketchikan', 'skagwayscooters', 
    'snorkelalaska', 'taquanair', 'temsco-summercamp-juneau', 
    'temscoair-juneau', 'temscoair-skagway', 'wingsairways'
  ];

  let appKey = "";
  let userKey = "";
  try {
    const credentials = getFareHarborCredentials();
    appKey = credentials.appKey;
    userKey = credentials.userKey;
  } catch {
    console.error("Missing FareHarbor API Keys");
    return [];
  }

  // Parallel fetching: Fires all 21 pings at once
  const tourPromises = companies.map(async (shortname) => {
    try {
      const res = await fetch(`https://fareharbor.com/api/external/v1/companies/${shortname}/items/`, {
        headers: { "X-FareHarbor-API-App": appKey, "X-FareHarbor-API-User": userKey },
        // Cache data for 24 hours to keep the site fast
        next: { revalidate: 86400 } 
      });
      if (!res.ok) return [];
      const data = await res.json();
      return (data.items || []).map((item: any) => itemToTour(item, shortname));
    } catch (e) {
      return [];
    }
  });

  const results = await Promise.all(tourPromises);
  return results.flat();
}
