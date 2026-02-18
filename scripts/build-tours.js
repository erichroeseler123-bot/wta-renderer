import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function buildTours() {
  const APP_KEY = process.env.FAREHARBOR_APP_KEY;
  const USER_KEY = process.env.FAREHARBOR_USER_KEY;
  
  if (!APP_KEY || !USER_KEY) {
    console.error("❌ ABORTING: Missing FareHarbor API Keys.");
    process.exit(0); // Exit safely so build can continue if keys aren't needed
  }

  const companies = ['beyondak', 'alaska-galore-juneau-whale-watching', 'akhummer', 'alaskatales', 'aktraveladventures', 'exclusivealaska', 'coastalhelicopters', 'dolphintours', 'moorecharters', 'alaskarainforest', 'ketchikanadventurevue', 'akduck', 'northstartrekking', 'kayakketchikan', 'skagwayscooters', 'snorkelalaska', 'taquanair', 'temsco-summercamp-juneau', 'temscoair-juneau', 'temscoair-skagway', 'wingsairways'];

  console.log("🚀 Aggregating 125 Tours...");
  const promises = companies.map(async (shortname) => {
    try {
      const res = await fetch(`https://fareharbor.com/api/external/v1/companies/${shortname}/items/`, {
        headers: { "X-FareHarbor-API-App": APP_KEY, "X-FareHarbor-API-User": USER_KEY }
      });
      const data = await res.json();
      return (data.items || []).map(item => ({
        ...item,
        company: shortname,
        fromPrice: item.price ? `From $${(item.price / 100).toFixed(0)}` : "Check Price"
      }));
    } catch (e) { return []; }
  });

  const allTours = (await Promise.all(promises)).flat();
  const dataPath = path.join(__dirname, '../public/data/tours.json');
  fs.writeFileSync(dataPath, JSON.stringify(allTours));
  console.log(`✅ Success: ${allTours.length} tours baked into production.`);
}

buildTours();
