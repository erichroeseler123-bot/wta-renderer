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

const APP_KEY = process.env.FAREHARBOR_APP_KEY || "";
const USER_KEY = process.env.FAREHARBOR_USER_KEY || "";

function itemToTour(item: any, shortname: string): Tour {
  const name = item?.name || `Tour ${item?.pk ?? ""}`;
  const slug = (item?.slug || name).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  
  // FIX: Provide a fallback of 0 if price is missing, then check if it exists
  const rawPrice = item?.price || 0;
  const fromPrice = rawPrice > 0 ? `From $${(rawPrice / 100).toFixed(0)}` : "Check Price";

  return {
      pk: Number(item?.pk || 0),
      slug,
    title: name,
    description: item?.headline || item?.description || "View details and availability.",
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
  const companies = [
    'beyondak', 'alaska-galore-juneau-whale-watching', 'akhummer', 
    'alaskatales', 'aktraveladventures', 'exclusivealaska', 
    'coastalhelicopters', 'dolphintours', 'moorecharters', 
    'alaskarainforest', 'ketchikanadventurevue', 'akduck', 
    'northstartrekking', 'kayakketchikan', 'skagwayscooters', 
    'snorkelalaska', 'taquanair', 'temsco-summercamp-juneau', 
    'temscoair-juneau', 'temscoair-skagway', 'wingsairways'
  ];

  if (!APP_KEY || !USER_KEY) {
    console.error("Missing FareHarbor API Keys");
    return [];
  }

  // Parallel fetching: Fires all 21 pings at once
  const tourPromises = companies.map(async (shortname) => {
    try {
      const res = await fetch(`https://fareharbor.com/api/external/v1/companies/${shortname}/items/`, {
        headers: { "X-FareHarbor-API-App": APP_KEY, "X-FareHarbor-API-User": USER_KEY },
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
