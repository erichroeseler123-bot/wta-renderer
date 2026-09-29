require('dotenv').config({ path: '.env.local' });
const APP_KEY = process.env.FAREHARBOR_APP_KEY || '';
const USER_KEY = process.env.FAREHARBOR_USER_KEY || '';

async function check() {
  const res = await fetch('https://fareharbor.com/api/external/v1/companies/northstartrekking/items/', {
    headers: { 'X-FareHarbor-API-App': APP_KEY, 'X-FareHarbor-API-User': USER_KEY }
  });
  const data = await res.json();
  for (const it of data.items) {
    console.log(`[${it.pk}] ${it.name}`);
    console.log(`    Headline: ${it.headline}`);
    if (it.customer_prototypes && it.customer_prototypes.length > 0) {
      it.customer_prototypes.forEach(cp => {
        console.log(`    Prototype: ${cp.display_name} - total: ${cp.total} ($${cp.total/100})`);
      });
    }
  }
}

check().catch(console.error);
