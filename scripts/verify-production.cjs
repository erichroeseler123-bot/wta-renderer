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
  console.log('\n==================================================');
  console.log('=== Checking host:', host, '===');
  console.log('==================================================');
  const tourUrl = host + '/tours/northstartrekking/405050';
  const res = await fetchUrl(tourUrl);
  console.log('NorthStar tour page HTTP status:', res.status);
  const html = res.data;
  
  const has388 = html.includes('388');
  const has405 = html.includes('$405');
  const has419 = html.includes('$419');
  const hasFAA = /FAA\s+surcharge/i.test(html);
  const hasUnreleased = /have\s+not\s+yet\s+been\s+released/i.test(html);
  const hasPinnedSep = /calendar\?month=2026-09/.test(html);
  const offersMatch = html.match(/"price":"([^"]+)"/);
  
  console.log('Mentions 388:', has388);
  console.log('Mentions $405:', has405);
  console.log('Mentions $419:', has419);
  console.log('Offers price in schema:', offersMatch ? offersMatch[1] : 'NOT FOUND');
  console.log('Has FAA surcharge attribution:', hasFAA);
  console.log('Has unreleased 2026 text:', hasUnreleased);
  console.log('Has pinned calendar?month=2026-09:', hasPinnedSep);

  // Check visible price card
  const priceMatches = html.match(/Tour Price \(Flat Rate\)<\/span>\s*<div[^>]*>([^<]+)<\/div>/i);
  console.log('Visible hero price:', priceMatches ? priceMatches[1].trim() : 'NOT MATCHED');

  // Check weight surcharge text in HTML
  const weightMatches = html.match(/Passengers 250\+ lbs:[^<]+/i);
  console.log('Weight surcharge text:', weightMatches ? weightMatches[0].trim() : 'NOT MATCHED');

  // Check calendar page
  const calUrl = host + '/tours/northstartrekking/405050/calendar';
  const calRes = await fetchUrl(calUrl);
  console.log('Calendar page status:', calRes.status);
  const calHasUnreleased = /have\s+not\s+yet\s+been\s+opened/i.test(calRes.data);
  const calHasDeparturesNotice = /No departures are currently available for online booking/i.test(calRes.data);
  console.log('Calendar has unreleased text:', calHasUnreleased);
  console.log('Calendar has updated departures notice:', calHasDeparturesNotice);

  // Check boat tour cancellation policy
  const boatUrl = host + '/tours/alaska-galore-juneau-whale-watching/276418';
  const boatRes = await fetchUrl(boatUrl);
  console.log('Boat tour status:', boatRes.status);
  const hasBoatConnectionGuarantee = /Guaranteed cruise connection protection/i.test(boatRes.data);
  console.log('Boat tour has "Guaranteed cruise connection protection":', hasBoatConnectionGuarantee);
}

async function main() {
  const hosts = [
    'https://wta-renderer.vercel.app',
    'https://www.welcometoalaskatours.com',
    'https://welcometoalaskatours.com',
  ];

  for (const host of hosts) {
    console.log(`\n================== HOST: ${host} ==================`);
    const tourUrl = `${host}/tours/northstartrekking/405050`;
    const res = await fetchUrl(tourUrl);
    const html = res.data;

    const has388 = html.includes('388');
    const has405 = html.includes('$405');
    const has419 = html.includes('$419');
    const priceMatches = html.match(/Tour Price \(Flat Rate\)<\/span>\s*<div[^>]*>([^<]+)<\/div>/i);
    const visiblePrice = priceMatches ? priceMatches[1].trim() : 'NOT MATCHED';
    const offersMatch = html.match(/"price":"([^"]+)"/);
    const schemaPrice = offersMatch ? offersMatch[1] : 'NOT MATCHED';

    const hasFAA = /FAA\s+surcharge/i.test(html);
    const hasNorthStarSurcharge = /NorthStar\s+surcharge/i.test(html);
    const hasUnreleased = /have\s+not\s+yet\s+been\s+released/i.test(html);
    const hasPinnedCalendar = /calendar\?month=2026-09/.test(html);

    console.log(`Tour Page HTTP Status: ${res.status}`);
    console.log(`Visible Price: ${visiblePrice}`);
    console.log(`Schema Price: ${schemaPrice}`);
    console.log(`Contains 388: ${has388}`);
    console.log(`Contains $405: ${has405}`);
    console.log(`Contains $419: ${has419}`);
    console.log(`Has "FAA surcharge": ${hasFAA}`);
    console.log(`Has "NorthStar surcharge": ${hasNorthStarSurcharge}`);
    console.log(`Has "have not yet been released": ${hasUnreleased}`);
    console.log(`Has calendar link pinned to 2026-09: ${hasPinnedCalendar}`);

    const calUrl = `${host}/tours/northstartrekking/405050/calendar`;
    const calRes = await fetchUrl(calUrl);
    const calHtml = calRes.data;
    const calHasDeparturesNotice = /No departures are currently available for online booking/i.test(calHtml);
    console.log(`Calendar Page HTTP Status: ${calRes.status}`);
    console.log(`Calendar updated departures notice: ${calHasDeparturesNotice}`);

    const boatUrl = `${host}/tours/alaska-galore-juneau-whale-watching/276418`;
    const boatRes = await fetchUrl(boatUrl);
    const boatHtml = boatRes.data;
    const hasBoatConnectionGuarantee = /Guaranteed cruise connection protection/i.test(boatHtml);
    console.log(`Boat Tour Page HTTP Status: ${boatRes.status}`);
    console.log(`Boat has "Guaranteed cruise connection protection": ${hasBoatConnectionGuarantee}`);
  }
}

main().catch(console.error);
