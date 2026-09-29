const fs = require('fs');
require('dotenv').config({ path: '.env.local' });

const APP_KEY = process.env.FAREHARBOR_APP_KEY || process.env.FH_APP_NAME || process.env.FH_APP_KEY || "";
const USER_KEY = process.env.FAREHARBOR_USER_KEY || process.env.FH_API_KEY || process.env.FH_USER_KEY || "";

async function run() {
  console.log('App key present:', Boolean(APP_KEY), 'User key present:', Boolean(USER_KEY));
  const itemUrl = `https://fareharbor.com/api/external/v1/companies/northstartrekking/items/405050/`;
  const res = await fetch(itemUrl, {
    headers: {
      "X-FareHarbor-API-App": APP_KEY,
      "X-FareHarbor-API-User": USER_KEY,
      Accept: "application/json",
    }
  });
  const data = await res.json();
  const item = data.item;
  console.log('--- NorthStar Item 405050 ---');
  console.log('name:', item.name);
  console.log('headline:', item.headline);
  console.log('customer_prototypes:', JSON.stringify(item.customer_prototypes, null, 2));
  console.log('description snippet:');
  console.log(item.description);

  // Check availabilities for June 2026
  const avUrl = `https://fareharbor.com/api/external/v1/companies/northstartrekking/items/405050/availabilities/date-range/2026-06-01/2026-06-30/`;
  const avRes = await fetch(avUrl, {
    headers: {
      "X-FareHarbor-API-App": APP_KEY,
      "X-FareHarbor-API-User": USER_KEY,
      Accept: "application/json",
    }
  });
  const avData = await avRes.json();
  console.log('June 2026 availabilities count:', avData.availabilities ? avData.availabilities.length : 0);
  if (avData.availabilities && avData.availabilities.length > 0) {
    const firstAv = avData.availabilities[0];
    console.log('Sample availability start_at:', firstAv.start_at);
    console.log('Customer type rates:');
    firstAv.customer_type_rates.forEach(ctr => {
      console.log('  rate pk:', ctr.pk, 'name:', ctr.customer_type.singular, 'total:', ctr.customer_prototype.total, 'cents ($', (ctr.customer_prototype.total/100).toFixed(2), ')');
    });
  } else {
    // Check if there are ANY availabilities in 2026
    const avYearUrl = `https://fareharbor.com/api/external/v1/companies/northstartrekking/items/405050/availabilities/date-range/2026-05-01/2026-09-30/`;
    const avYearRes = await fetch(avYearUrl, {
      headers: {
        "X-FareHarbor-API-App": APP_KEY,
        "X-FareHarbor-API-User": USER_KEY,
        Accept: "application/json",
      }
    });
    const avYearData = await avYearRes.json();
    console.log('2026 full season availabilities count:', avYearData.availabilities ? avYearData.availabilities.length : 0);
    if (avYearData.availabilities && avYearData.availabilities.length > 0) {
      console.log('First slot:', avYearData.availabilities[0].start_at);
      avYearData.availabilities[0].customer_type_rates.forEach(ctr => {
        console.log('  rate pk:', ctr.pk, 'name:', ctr.customer_type.singular, 'total:', ctr.customer_prototype.total, 'cents ($', (ctr.customer_prototype.total/100).toFixed(2), ')');
      });
    }
  }
}

run().catch(console.error);
