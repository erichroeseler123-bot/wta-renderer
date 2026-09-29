const tours = require('../public/data/tours.json');

const domains = new Set();
let countWithImage = 0;
let missingImages = [];
let sampleTours = {};

for (const t of tours) {
  if (t.image) {
    countWithImage++;
    try {
      const u = new URL(t.image);
      domains.add(u.hostname);
    } catch {
      domains.add(t.image);
    }
  } else {
    missingImages.push(`${t.company}/${t.pk}: ${t.title}`);
  }
  if (!sampleTours[t.company]) {
    sampleTours[t.company] = {
      title: t.title,
      image: t.image,
      galleryLength: t.imageGallery ? t.imageGallery.length : 0
    };
  }
}

console.log('Total tours:', tours.length);
console.log('Tours with image:', countWithImage);
console.log('Missing image count:', missingImages.length);
console.log('Image domains / paths:', Array.from(domains));
console.log('Sample operator images:', JSON.stringify(sampleTours, null, 2));
