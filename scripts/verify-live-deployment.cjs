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
  const base = 'https://wta-renderer.vercel.app';
  console.log(`Checking live deployment at: ${base}`);

  console.log('\n1. /juneau/helicopter-tours');
  const heli = await get(`${base}/juneau/helicopter-tours`);
  console.log('Status:', heli.status);
  console.log('CSP allows googletagmanager.com:', heli.headers['content-security-policy']?.includes('googletagmanager.com'));
  console.log('CSP allows google-analytics.com:', heli.headers['content-security-policy']?.includes('google-analytics.com'));
  console.log('Contains $388 Per Person (Flat Rate):', heli.body.includes('$388 Per Person (Flat Rate)'));
  console.log('Contains conflicting $405 (should be FALSE):', heli.body.includes('$405') || heli.body.includes('405.00'));
  console.log('Contains TEMSCO summer camp cart (should be FALSE):', heli.body.includes('temsco-summercamp') || heli.body.includes('213994'));
  console.log('Contains TEMSCO flightseeing $100 (should be FALSE):', heli.body.includes('TEMSCO') && heli.body.includes('$100'));

  console.log('\n2. /tours/northstartrekking/405050');
  const ns = await get(`${base}/tours/northstartrekking/405050`);
  console.log('Status:', ns.status);
  console.log('Contains $388 Per Person (Flat Rate):', ns.body.includes('$388 Per Person (Flat Rate)'));
  console.log('Contains 388.00 Offer Schema:', ns.body.includes('"price":"388.00"') || ns.body.includes('388.00'));
  console.log('Contains conflicting $405 (should be FALSE):', ns.body.includes('$405') || ns.body.includes('405.00'));
  console.log('Contains Starting Price (should be FALSE):', ns.body.includes('Starting Price'));

  console.log('\n3. /juneau/whale-watching');
  const whale = await get(`${base}/juneau/whale-watching`);
  console.log('Status:', whale.status);
  console.log('Contains return safety buffer text:', whale.body.includes('safety buffer') || whale.body.includes('buffer'));
  console.log('Attributed 100% guarantee to marine operators:', whale.body.includes('marine operators'));
  console.log('Does not claim blanket ship guarantee:', !whale.body.includes('guaranteed return to your ship'));

  console.log('\n4. /guides/juneau-whale-watching-vs-mendenhall');
  const g1 = await get(`${base}/guides/juneau-whale-watching-vs-mendenhall`);
  console.log('Status:', g1.status);
  console.log('Contains operator refund notice guidance:', g1.body.includes('100% full refund upon verification'));
  console.log('Contains operator whale guarantee attribution:', g1.body.includes('operator sighting guarantees (May'));

  console.log('\n5. /guides/how-to-get-to-mendenhall-glacier-from-cruise-port');
  const g2 = await get(`${base}/guides/how-to-get-to-mendenhall-glacier-from-cruise-port`);
  console.log('Status:', g2.status);
  console.log('Contains Mt. Roberts Tramway lot pickup note:', g2.body.includes('Mt. Roberts Tramway'));
  console.log('Contains AJ Dock shuttle note:', g2.body.includes('AJ Dock'));

  console.log('\nVerification complete!');
}

verify().catch(console.error);
