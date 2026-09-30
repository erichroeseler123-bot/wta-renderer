const testUrls = [
  'https://www.welcometoalaskatours.com',
  'https://www.welcometoalaskatours.com/tours',
  'https://www.welcometoalaskatours.com/ports',
  'https://www.welcometoalaskatours.com/ports/juneau',
  'https://www.welcometoalaskatours.com/ports/skagway',
  'https://www.welcometoalaskatours.com/ports/ketchikan',
  'https://www.welcometoalaskatours.com/juneau/helicopter-tours',
  'https://www.welcometoalaskatours.com/juneau/whale-watching',
  'https://www.welcometoalaskatours.com/juneau/mendenhall-glacier-tours',
  'https://www.welcometoalaskatours.com/skagway/helicopter-tours',
  'https://www.welcometoalaskatours.com/ketchikan/bear-tours',
  'https://www.welcometoalaskatours.com/ketchikan/misty-fjords',
  'https://www.welcometoalaskatours.com/guides',
  'https://www.welcometoalaskatours.com/guides/juneau-whale-watching-vs-mendenhall-glacier',
  'https://www.welcometoalaskatours.com/guides/skagway-train-vs-helicopter',
  'https://www.welcometoalaskatours.com/guides/best-juneau-helicopter-tour',
  'https://www.welcometoalaskatours.com/guides/what-happens-if-my-alaska-tour-runs-late',
  'https://www.welcometoalaskatours.com/ships',
  'https://www.welcometoalaskatours.com/about'
];

async function run() {
  console.log('Auditing WTA Live Images:\n');
  for (const url of testUrls) {
    try {
      const res = await fetch(url);
      const html = await res.text();
      const imgs = html.match(/<img[^>]+>/g) || [];
      const sources = imgs.map(tag => {
        const src = tag.match(/src="([^"]+)"/)?.[1] || '';
        return src;
      });
      console.log(`URL: ${url}`);
      console.log(`  Status: ${res.status}`);
      console.log(`  Total <img> tags: ${imgs.length}`);
      if (imgs.length === 0) {
        console.log(`  *** NO IMAGES FOUND ***`);
      } else {
        console.log(`  Sources sample:`, sources.slice(0, 3));
      }
    } catch (err) {
      console.error(`Error fetching ${url}:`, err.message);
    }
  }
}

run();
