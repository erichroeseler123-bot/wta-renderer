const https = require('https');

function get(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' } }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, headers: res.headers, body: data }));
    }).on('error', reject);
  });
}

async function verify() {
  const base = process.env.VERIFY_BASE || 'https://wta-renderer.vercel.app';
  console.log(`Checking live deployment at: ${base}`);

  console.log('\n1. /juneau/helicopter-tours');
  const heli = await get(`${base}/juneau/helicopter-tours`);
  console.log('Status:', heli.status);
  console.log('Contains $409 to $429 category range:', heli.body.includes('$409 to $429') || heli.body.includes('$409–$429'));
  console.log('Contains NorthStar $419 Per Person (Flat Rate):', heli.body.includes('$419 Per Person (Flat Rate)'));
  console.log('Contains conflicting $405 (should be FALSE):', heli.body.includes('$405') || heli.body.includes('405.00'));
  console.log('Contains TEMSCO summer camp cart (should be FALSE):', heli.body.includes('temsco-summercamp') || heli.body.includes('213994'));
  console.log('Contains TEMSCO flightseeing $100 (should be FALSE):', heli.body.includes('TEMSCO') && heli.body.includes('$100'));

  console.log('\n2. /tours/northstartrekking/405050 (NorthStar Detail Page)');
  const ns = await get(`${base}/tours/northstartrekking/405050`);
  console.log('Status:', ns.status);
  console.log('Contains $419 Per Person (Flat Rate):', ns.body.includes('$419 Per Person (Flat Rate)'));
  console.log('Contains 419.00 Offer Schema:', ns.body.includes('"price":"419.00"') || ns.body.includes('419.00'));
  console.log('Contains 2 Hours 15 Minutes duration:', ns.body.includes('2 Hours 15 Minutes'));
  console.log('Contains Ages 7+ policy:', ns.body.includes('Ages 7+'));
  console.log('Contains September Only season:', ns.body.includes('September Only'));
  console.log('Contains $150 weight surcharge policy:', ns.body.includes('150') && ns.body.includes('250+ lbs'));
  console.log('Contains seasonal schedule notice:', ns.body.includes('Seasonal Schedule Notice'));
  console.log('Contains May-August alternative link:', ns.body.includes('Browse May–August Helicopter Tours'));

  console.log('\n3. /tours/alaska-galore-juneau-whale-watching/585907 (Boat Tour Boilerplate Isolation)');
  const boat = await get(`${base}/tours/alaska-galore-juneau-whale-watching/585907`);
  console.log('Status:', boat.status);
  console.log('Mentions helicopter flights (should be FALSE):', boat.body.includes('Helicopter flights') || boat.body.includes('helicopter flights'));
  console.log('Mentions airport heliports (should be FALSE):', boat.body.includes('airport heliports') || boat.body.includes('heliports'));
  console.log('Mentions high-altitude visibility (should be FALSE):', boat.body.includes('high-altitude visibility'));
  console.log('Mentions strict safety flight rules (should be FALSE):', boat.body.includes('Strict safety flight rules') || boat.body.includes('flight rules'));
  console.log('Contains catamaran / marine copy:', boat.body.includes('Catamaran') || boat.body.includes('marine') || boat.body.includes('harbor'));

  console.log('\n4. /tours/northstartrekking/405050/calendar (Seasonal Calendar Page)');
  const cal = await get(`${base}/tours/northstartrekking/405050/calendar`);
  console.log('Status:', cal.status);
  console.log('Contains Operating Season: September Only banner:', cal.body.includes('Operating Season: September Only'));
  console.log('Contains May-August alternative helicopter tours:', cal.body.includes('Need a Juneau Helicopter Tour for May through August?'));
  console.log('Contains TEMSCO Mendenhall link:', cal.body.includes('/tours/temscoair-juneau/214803'));
  console.log('Contains Coastal Icefield link:', cal.body.includes('/tours/coastalhelicopters/413056'));

  console.log('\nVerification complete!');
}

verify().catch(console.error);
