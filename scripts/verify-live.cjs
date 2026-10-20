const https = require('https');

async function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' } }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, data }));
    }).on('error', reject);
  });
}

async function testDomain(domain) {
  console.log(`\n========================================`);
  console.log(`Testing: https://${domain}`);
  console.log(`========================================`);

  // 1. Duck tour
  const duck = await fetchUrl(`https://${domain}/tours/akduck/4161`);
  console.log('1. Ketchikan Duck Tour:');
  console.log('   - HTTP Status:', duck.status);
  console.log('   - Contains $79 adult fare:', duck.data.includes('$79'));
  console.log('   - Contains $15 flat rate:', duck.data.includes('$15'));
  console.log('   - Duration 90 Minutes present:', duck.data.includes('90 min') || duck.data.includes('90 Min') || duck.data.includes('90 Minutes'));

  // 2. Skagway scooters
  const scooter = await fetchUrl(`https://${domain}/tours/skagwayscooters/13748`);
  console.log('2. Skagway Scooters:');
  console.log('   - HTTP Status:', scooter.status);
  console.log('   - Contains 2 Hours duration:', scooter.data.includes('2 Hours'));
  console.log('   - Contains "Check details" for duration:', scooter.data.includes('Check details'));
  console.log('   - Contains Ages 18+ to drive:', scooter.data.includes('Ages 18+ to drive'));
  console.log('   - Contains "All ages welcome":', scooter.data.includes('All ages welcome'));
  console.log('   - Contains "cushion enforced":', scooter.data.includes('cushion enforced'));
  console.log('   - Contains Recommended return cushion / safety buffer:', scooter.data.includes('return cushion') && scooter.data.includes('Recommended'));
  console.log('   - Contains fabricated 50% refund:', scooter.data.includes('50%'));
  console.log('   - Contains invented "operator review" text:', scooter.data.includes('operator review'));

  // 3. Late tour guide
  const late = await fetchUrl(`https://${domain}/guides/what-happens-if-my-alaska-tour-runs-late`);
  console.log('3. Late Tour Guide:');
  console.log('   - HTTP Status:', late.status);
  console.log('   - Contains "100% Back-to-Ship Guarantee":', late.data.includes('100% Back-to-Ship Guarantee') || late.data.includes('100% back-to-ship'));
  console.log('   - Contains "enforced":', late.data.includes('enforced'));
  console.log('   - Contains "0 missed cruise departures":', late.data.includes('0 missed cruise departures'));
  console.log('   - Contains blanket "All excursions include 100% refund":', late.data.includes('All excursions booked through our platform include a 100% full refund policy') || late.data.includes('all reservations include a 100% refund policy'));

  // 4. Cruise Ship vs Independent
  const vs = await fetchUrl(`https://${domain}/guides/cruise-ship-vs-independent-alaska-excursions`);
  console.log('4. Cruise Ship vs Independent:');
  console.log('   - HTTP Status:', vs.status);
  console.log('   - Contains "ironclad back-to-ship":', vs.data.includes('ironclad back-to-ship'));
  console.log('   - Contains "guaranteed ship returns":', vs.data.includes('guaranteed ship returns'));

  // 5. About page
  const about = await fetchUrl(`https://${domain}/about`);
  console.log('5. About Page:');
  console.log('   - HTTP Status:', about.status);
  console.log('   - Contains "decades of experience":', about.data.includes('decades of experience'));
  console.log('   - Contains "physically inspected":', about.data.includes('physically inspected'));
  console.log('   - Transparent FareHarbor description present:', about.data.includes('FareHarbor'));

  // 6. Privacy page
  const privacy = await fetchUrl(`https://${domain}/privacy`);
  console.log('6. Privacy Page:');
  console.log('   - HTTP Status:', privacy.status);
  console.log('   - Contains "30 business days":', privacy.data.includes('30 business days'));
  console.log('   - Contains hello@welcometoalaskatours.com:', privacy.data.includes('hello@welcometoalaskatours.com'));

  // 7. Taquan Air
  const taquan = await fetchUrl(`https://${domain}/tours/taquanair/106307`);
  console.log('7. Taquan Air Floatplane:');
  console.log('   - HTTP Status:', taquan.status);
  console.log('   - Contains "helicopter flightseeing":', taquan.data.includes('helicopter flightseeing'));
  console.log('   - Contains "heliport":', taquan.data.includes('heliport'));

  // 8. Bears Brews & Boardwalk
  const bbb = await fetchUrl(`https://${domain}/tours/exclusivealaska/523455`);
  console.log('8. Bears, Brews & Boardwalk:');
  console.log('   - HTTP Status:', bbb.status);
  console.log('   - Contains "icefield":', bbb.data.includes('icefield'));
  console.log('   - Categorized under glacier hikes:', bbb.data.includes('glacier hikes') || bbb.data.includes('Glacier Hikes'));
}

async function run() {
  await testDomain('welcometoalaskatours.com');
  await testDomain('www.welcometoalaskatours.com');
  await testDomain('wta-renderer.vercel.app');
}

run().catch(console.error);
