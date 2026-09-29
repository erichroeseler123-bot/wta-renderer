const https = require('https');

https.get('https://northstartrekking.com/adventures/helicopter-flightseeing-and-glacier-landing-tour/', {
  headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
}, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    // Let's search for book button
    console.log('--- Buttons & Links ---');
    const buttons = data.match(/<a[^>]+(?:book|button|fareharbor)[^>]*>[\s\S]*?<\/a>/gi) || [];
    for (const b of buttons.slice(0, 10)) {
      console.log(b.trim());
    }

    console.log('\n--- Pricing & Details Blocks ---');
    const sections = data.match(/<div[^>]+(?:price|detail|overview|meta|content|tour-info)[^>]*>[\s\S]*?<\/div>/gi) || [];
    for (const s of sections.slice(0, 10)) {
      // strip html tags
      const text = s.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
      if (text.length > 20 && text.length < 500) {
        console.log('Section:', text);
      }
    }

    // Search for 419 or prices
    const p419 = data.match(/.{0,50}(?:419|388|405).{0,50}/gi) || [];
    console.log('\n419/388/405 mentions:', p419);

    // Search for 250 lbs
    const lbs = data.match(/.{0,80}(?:250|pound|weight|surcharge).{0,80}/gi) || [];
    console.log('\nWeight/Surcharge mentions:');
    for (const l of lbs.slice(0, 10)) {
      if (!l.includes('font-weight')) console.log('-', l.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim());
    }

    // Search for age
    const age = data.match(/.{0,80}(?:age|years\s*old|minimum\s*age).{0,80}/gi) || [];
    console.log('\nAge mentions:');
    for (const a of age.slice(0, 10)) {
      if (!a.includes('image') && !a.includes('script')) console.log('-', a.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim());
    }
  });
});
