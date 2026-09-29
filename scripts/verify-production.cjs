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

  // 1. Skagway Dog Sledding Category
  const skgDogUrl = `${host}/skagway/dog-sledding`;
  const skgDogRes = await fetchUrl(skgDogUrl);
  const skgDogHtml = skgDogRes.data;
  console.log(`[Skagway Dog Sledding] HTTP Status: ${skgDogRes.status}`);
  console.log(`  Visible $599 rate: ${skgDogHtml.includes('$599')}`);
  console.log(`  Obsolete $650-$750 rate removed: ${!skgDogHtml.includes('$650') && !skgDogHtml.includes('$750')}`);
  console.log(`  Clarified demonstration (no riding on glacier): ${skgDogHtml.includes('demonstration') && !skgDogHtml.includes('glacier snow sledding')}`);
  console.log(`  Base check-in / return transfer reflected: ${skgDogHtml.includes('TEMSCO Skagway heliport') || skgDogHtml.includes('Congress Way')}`);

  // 2. Skagway Helicopter Tours Category
  const skgHeliUrl = `${host}/skagway/helicopter-tours`;
  const skgHeliRes = await fetchUrl(skgHeliUrl);
  const skgHeliHtml = skgHeliRes.data;
  console.log(`[Skagway Helicopter Category] HTTP Status: ${skgHeliRes.status}`);
  console.log(`  Displays verified $439 rate: ${skgHeliHtml.includes('$439')}`);
  console.log(`  Displays verified $599 rate: ${skgHeliHtml.includes('$599')}`);
  console.log(`  Discloses explicit $150 weight surcharge: ${skgHeliHtml.includes('$150') && skgHeliHtml.includes('250')}`);
  console.log(`  Footwear / clothing inclusion mentioned: ${skgHeliHtml.includes('clothing and footwear') || skgHeliHtml.includes('clothing & footwear')}`);
  console.log(`  Check-in base logistics described: ${skgHeliHtml.includes('Congress Way') || skgHeliHtml.includes('heliport base')}`);
  console.log(`  No 'Starting at' for TEMSCO cards: ${!/Starting at \$439/i.test(skgHeliHtml) && !/Starting at \$599/i.test(skgHeliHtml)}`);

  // 3. Juneau Helicopter Tours Category
  const jnuHeliUrl = `${host}/juneau/helicopter-tours`;
  const jnuHeliRes = await fetchUrl(jnuHeliUrl);
  const jnuHeliHtml = jnuHeliRes.data;
  console.log(`[Juneau Helicopter Category] HTTP Status: ${jnuHeliRes.status}`);
  console.log(`  Meta description limits $409-$429 to basic landings: ${jnuHeliHtml.includes('basic glacier landings') || jnuHeliHtml.includes('$409 to $429 per person flat rate for basic glacier landings')}`);

  // 4. TEMSCO 213556 Detail Page
  const temsco556Url = `${host}/tours/temscoair-skagway/213556`;
  const temsco556Res = await fetchUrl(temsco556Url);
  const temsco556Html = temsco556Res.data;
  console.log(`[TEMSCO Glacier Discovery 213556] HTTP Status: ${temsco556Res.status}`);
  console.log(`  Price $439 flat rate: ${temsco556Html.includes('$439')}`);
  console.log(`  TEMSCO $150 weight surcharge visible: ${temsco556Html.includes('+$150 TEMSCO') || temsco556Html.includes('$150 operator weight surcharge')}`);
  console.log(`  Base check-in / return transfer visible: ${temsco556Html.includes('Congress Way') || temsco556Html.includes('TEMSCO Skagway heliport base')}`);

  // 5. TEMSCO 213561 Detail Page
  const temsco561Url = `${host}/tours/temscoair-skagway/213561`;
  const temsco561Res = await fetchUrl(temsco561Url);
  const temsco561Html = temsco561Res.data;
  console.log(`[TEMSCO Dog Sledding Demonstration 213561] HTTP Status: ${temsco561Res.status}`);
  console.log(`  Price $599 flat rate: ${temsco561Html.includes('$599')}`);
  console.log(`  Described as demonstration / puppy interaction: ${temsco561Html.includes('demonstration')}`);
  console.log(`  TEMSCO $150 weight surcharge visible: ${temsco561Html.includes('+$150 TEMSCO') || temsco561Html.includes('$150 operator weight surcharge')}`);

  // 6. NorthStar 405050
  const nsUrl = `${host}/tours/northstartrekking/405050`;
  const nsRes = await fetchUrl(nsUrl);
  const nsHtml = nsRes.data;
  console.log(`[NorthStar 405050] HTTP Status: ${nsRes.status}`);
  console.log(`  Visible $419: ${nsHtml.includes('$419')}`);
  console.log(`  Duration in specifications is '2 Hours 15 Minutes': ${nsHtml.includes('2 Hours 15 Minutes')}`);
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
