const https = require('https');

https.get('https://fareharbor.com/embeds/book/northstartrekking/items/405050/calendar/', {
  headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
}, (res) => {
  console.log('Fareharbor public calendar status:', res.statusCode);
  if (res.statusCode >= 300 && res.statusCode < 400) {
    console.log('Redirect location:', res.headers.location);
  }
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    console.log('HTML length:', data.length);
    const match = data.match(/\"availabilities\":\s*(\[[^\]]*\])/);
    if (match) {
      console.log('Availabilities JSON:', match[1].slice(0, 300));
    } else {
      console.log('No availabilities array found');
    }
    const dates = data.match(/\"start_at\":\s*\"([^\"]+)\"/g) || [];
    console.log('Start at count:', dates.length);
    if (dates.length) console.log('Sample start_at:', dates.slice(0, 5));
  });
});
