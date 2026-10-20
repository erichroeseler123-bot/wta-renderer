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

async function checkPolicies() {
  for (const comp of companies) {
    try {
      const res = await fetch(`https://fareharbor.com/api/external/v1/companies/${comp}/items/`, {
        headers: { 'X-FareHarbor-API-App': app, 'X-FareHarbor-API-User': user }
      });
      const data = await res.json();
      const firstItem = data.items && data.items[0];
      const policy = firstItem?.cancellation_policy || 'NONE';
      console.log(`=== ${comp} ===`);
      console.log(policy.trim());
      console.log('');
    } catch (e) {
      console.log(`=== ${comp} === ERROR: ${e.message}`);
    }
  }
}

checkPolicies();
