require('dotenv').config({ path: '.env.local' });
const app = process.env.FAREHARBOR_APP_KEY || process.env.FH_APP_KEY;
const user = process.env.FAREHARBOR_USER_KEY || process.env.FH_USER_KEY;

const companies = [
  'beyondak',
  'alaska-galore-juneau-whale-watching',
  'akhummer',
  'alaskatales',
  'aktraveladventures',
  'exclusivealaska',
  'coastalhelicopters',
  'dolphintours',
  'moorecharters',
  'alaskarainforest',
  'ketchikanadventurevue',
  'akduck',
  'northstartrekking',
  'kayakketchikan',
  'skagwayscooters',
  'snorkelalaska',
  'taquanair',
  'temscoair-juneau',
  'temscoair-skagway',
  'wingsairways'
];

async function scanAllItems() {
  for (const comp of companies) {
    try {
      const res = await fetch(`https://fareharbor.com/api/external/v1/companies/${comp}/items/`, {
        headers: { 'X-FareHarbor-API-App': app, 'X-FareHarbor-API-User': user }
      });
      const data = await res.json();
      const items = data.items || [];
      const policies = new Map();
      for (const it of items) {
        const pol = (it.cancellation_policy || '').trim();
        if (!policies.has(pol)) policies.set(pol, []);
        policies.get(pol).push({ pk: it.pk, name: it.name });
      }
      console.log(`\n========================================`);
      console.log(`${comp}: ${items.length} items, ${policies.size} distinct policies`);
      console.log(`========================================`);
      let idx = 1;
      for (const [pol, itemList] of policies.entries()) {
        console.log(`[Policy Variant #${idx++}] (${itemList.length} items: e.g. ${itemList.slice(0, 3).map(x => `${x.pk} - ${x.name}`).join(', ')})`);
        console.log(`Text: ${pol.replace(/\n+/g, ' ').slice(0, 160)}...`);
      }
    } catch (e) {
      console.log(`\n${comp}: ERROR: ${e.message}`);
    }
  }
}

scanAllItems();
