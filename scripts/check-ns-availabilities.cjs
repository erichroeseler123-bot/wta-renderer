require('dotenv').config({ path: '.env.local' });
const APP_KEY = process.env.FAREHARBOR_APP_KEY || '';
const USER_KEY = process.env.FAREHARBOR_USER_KEY || '';

async function checkAvailabilities() {
  const items = [115991, 116029, 116035, 116036, 116037, 405050, 645179];
  for (const it of items) {
    const url = `https://fareharbor.com/api/external/v1/companies/northstartrekking/items/${it}/availabilities/date-range/2026-06-01/2026-06-30/`;
    const res = await fetch(url, {
      headers: { 'X-FareHarbor-API-App': APP_KEY, 'X-FareHarbor-API-User': USER_KEY }
    });
    const d = await res.json();
    console.log(`Item ${it}: ${d.availabilities ? d.availabilities.length : 'error'}`);
  }
}

checkAvailabilities().catch(console.error);
