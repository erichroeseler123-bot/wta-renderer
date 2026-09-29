const https = require('https');

function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' } }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, data }));
    }).on('error', reject);
  });
}

async function verifyHost(host) {
  console.log(`\n==================================================`);
  console.log(`=== Checking host: ${host} ===`);
  console.log(`==================================================`);

  // 1. NorthStar 405050
  const nsUrl = `${host}/tours/northstartrekking/405050`;
  const nsRes = await fetchUrl(nsUrl);
  const nsHtml = nsRes.data;
  console.log(`[NorthStar 405050] HTTP Status: ${nsRes.status}`);
  console.log(`  Visible $419: ${nsHtml.includes('$419')}`);
  console.log(`  Contains obsolete $388 or $405: ${nsHtml.includes('388') || nsHtml.includes('$405')}`);
  console.log(`  FAA surcharge attribution removed: ${!/FAA\s+surcharge/i.test(nsHtml)}`);
  console.log(`  NorthStar surcharge identified: ${/NorthStar\s+surcharge/i.test(nsHtml)}`);
  console.log(`  Calendar unpinned from 2026-09: ${!/calendar\?month=2026-09/.test(nsHtml)}`);
  console.log(`  Pre-Payment Cancellation Deadlines present: ${nsHtml.includes('Pre-Payment Cancellation Deadlines')}`);
  console.log(`  Duration in specifications is '2 Hours 15 Minutes': ${nsHtml.includes('2 Hours 15 Minutes')}`);
  console.log(`  Duration specifications does NOT say '2 Hours' alone: ${!/>Duration<\/span><span[^>]*>2 Hours<\/span>/.test(nsHtml)}`);

  // 2. Alaska Galore Catamaran 585907
  const agUrl = `${host}/tours/alaska-galore-juneau-whale-watching/585907`;
  const agRes = await fetchUrl(agUrl);
  const agHtml = agRes.data;
  console.log(`[Alaska Galore Catamaran 585907] HTTP Status: ${agRes.status}`);
  console.log(`  Mentions 30+ days: ${agHtml.includes('30+ days')}`);
  console.log(`  Mentions $50 fee: ${agHtml.includes('$50')}`);
  console.log(`  Uses verified 'within 14 days' boundary: ${agHtml.includes('within 14 days')}`);
  console.log(`  Does NOT use '<14 days': ${!agHtml.includes('<14 days')}`);
  console.log(`  Does NOT claim 'out of guest control': ${!agHtml.includes('out of guest control')}`);
  console.log(`  Does NOT claim refund for illness: ${!agHtml.includes('illness')}`);

  // 3. Dolphin Tours 2436
  const dUrl = `${host}/tours/dolphintours/2436`;
  const dRes = await fetchUrl(dUrl);
  const dHtml = dRes.data;
  console.log(`[Dolphin Tours 2436] HTTP Status: ${dRes.status}`);
  console.log(`  Mentions 24 hours: ${dHtml.includes('24 hours')}`);
  console.log(`  Mentions 7 days for private tours/groups of 8+: ${dHtml.includes('7 days')}`);
  console.log(`  Does NOT falsely default to Alaska Galore 14 days: ${!dHtml.includes('within 14 days')}`);
  console.log(`  Does NOT falsely mention $50 fee: ${!dHtml.includes('$50')}`);

  // 4. Alaska Tales 47295
  const atUrl = `${host}/tours/alaskatales/47295`;
  const atRes = await fetchUrl(atUrl);
  const atHtml = atRes.data;
  console.log(`[Alaska Tales 47295] HTTP Status: ${atRes.status}`);
  console.log(`  Mentions 24 hours: ${atHtml.includes('24 hours')}`);
  console.log(`  Does NOT falsely default to Alaska Galore 14 days: ${!atHtml.includes('within 14 days')}`);
  console.log(`  Does NOT falsely mention $50 fee: ${!atHtml.includes('$50')}`);

  // 5. Skagway Helicopter Tours Category
  const skgHeliUrl = `${host}/skagway/helicopter-tours`;
  const skgHeliRes = await fetchUrl(skgHeliUrl);
  const skgHeliHtml = skgHeliRes.data;
  console.log(`[Skagway Helicopter Category] HTTP Status: ${skgHeliRes.status}`);
  console.log(`  Displays verified $439 rate: ${skgHeliHtml.includes('$439')}`);
  console.log(`  Displays verified $599 rate: ${skgHeliHtml.includes('$599')}`);
  console.log(`  Does NOT display obsolete $350-$410 range: ${!skgHeliHtml.includes('$350') && !skgHeliHtml.includes('$410')}`);
  console.log(`  Does NOT display obsolete $650-$750 range: ${!skgHeliHtml.includes('$650') && !skgHeliHtml.includes('$750')}`);

  // 6. Juneau Whale Watching Topic Page
  const jnuWhaleUrl = `${host}/juneau/whale-watching`;
  const jnuWhaleRes = await fetchUrl(jnuWhaleUrl);
  const jnuWhaleHtml = jnuWhaleRes.data;
  console.log(`[Juneau Whale Watching Topic] HTTP Status: ${jnuWhaleRes.status}`);
  console.log(`  Accurate operator-dependent ship cancellation FAQ: ${jnuWhaleHtml.includes("refund terms depend on the operator's specific booking policy")}`);
}

async function main() {
  const hosts = [
    'https://wta-renderer.vercel.app',
    'https://www.welcometoalaskatours.com',
    'https://welcometoalaskatours.com',
  ];

  for (const host of hosts) {
    await verifyHost(host);
  }
}

main().catch(console.error);
