const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, '..', 'public', 'images', 'home');
if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

const images = [
  { name: 'hero', url: 'https://upload.wikimedia.org/wikipedia/commons/5/5d/Glacier_Bay_National_Park_and_Preserve_GLBA3434.jpg' },
  { name: 'card-ports', url: 'https://upload.wikimedia.org/wikipedia/commons/1/13/Misty_Fjords-Tongass-AES-011_%2852502715136%29.jpg' },
  { name: 'card-ships', url: 'https://upload.wikimedia.org/wikipedia/commons/e/ed/At_the_face_of_a_glacier_%282f5124b0-1dd8-b71c-0781-3e60dc7694e5%29.jpg' },
  { name: 'card-experiences', url: 'https://upload.wikimedia.org/wikipedia/commons/c/c6/The_face_of_Johns_Hopkins_Glacier_%283d2a695c-b635-453f-9ea9-07f1dc2ae590%29.jpg' },
  { name: 'port-juneau', url: 'https://upload.wikimedia.org/wikipedia/commons/3/3d/Mendenhall_Glacier%2C_Juneau.jpg' },
  { name: 'port-skagway', url: 'https://upload.wikimedia.org/wikipedia/commons/5/56/KLGO_downtown_Skagway_%2835572184472%29.jpg' },
  { name: 'port-ketchikan', url: 'https://upload.wikimedia.org/wikipedia/commons/5/5a/Ketchikan_waterfront_and_cruise_ships_in_port.JPG' },
  { name: 'exp-wildlife', url: 'https://upload.wikimedia.org/wikipedia/commons/1/1c/Humpback_whale_breaching_in_southeast_alaska.jpg' },
  { name: 'exp-glaciers', url: 'https://upload.wikimedia.org/wikipedia/commons/0/04/Mendenhall_Glacier.jpg' },
  { name: 'exp-flightseeing', local: path.join(__dirname, '..', 'public', 'media', 'juneau-aerial.png') },
  { name: 'exp-dogsledding', url: 'https://upload.wikimedia.org/wikipedia/commons/c/c6/Sled_dogs.jpg' },
  { name: 'exp-fishing', url: 'https://upload.wikimedia.org/wikipedia/commons/a/a4/Novice_fisherman_with_a_chum_salmon_taken_at_Alexander_Creek%2C_Matanuska-Susitna_Borough%2C_Alaska.jpg' },
  { name: 'exp-adventure', local: path.join(__dirname, '..', 'public', 'hero', 'ketchikan.png') },
  { name: 'exp-easyday', local: path.join(__dirname, '..', 'public', 'hero', 'skagway.jpg') },
  { name: 'exp-premium', local: path.join(__dirname, '..', 'public', 'hero', 'juneau.jpg') },
  { name: 'cta-scenery', url: 'https://upload.wikimedia.org/wikipedia/commons/1/13/Misty_Fjords-Tongass-AES-011_%2852502715136%29.jpg' }
];

async function run() {
  const customUA = 'WTABot/1.0 (https://www.welcometoalaskatours.com; info@welcometoalaskatours.com)';

  for (const img of images) {
    let buf;
    if (img.local) {
      buf = fs.readFileSync(img.local);
    } else {
      console.log('Fetching', img.name, 'from', img.url);
      const res = await fetch(img.url, { headers: { 'User-Agent': customUA } });
      if (!res.ok) throw new Error(`Failed to fetch ${img.url}: ${res.status}`);
      buf = Buffer.from(await res.arrayBuffer());
    }
    
    if (img.name === 'hero') {
      await sharp(buf).resize(1920, 1080, { fit: 'cover', position: 'center' }).webp({ quality: 80 }).toFile(path.join(dir, 'hero-1920.webp'));
      await sharp(buf).resize(1200, 800, { fit: 'cover', position: 'center' }).webp({ quality: 80 }).toFile(path.join(dir, 'hero-1200.webp'));
      await sharp(buf).resize(750, 500, { fit: 'cover', position: 'center' }).webp({ quality: 80 }).toFile(path.join(dir, 'hero-750.webp'));
      await sharp(buf).resize(1920, 1080, { fit: 'cover', position: 'center' }).jpeg({ quality: 80, mozjpeg: true }).toFile(path.join(dir, 'hero.jpg'));
      // Update public/images/home-hero.jpg and home-hero.webp
      await sharp(buf).resize(1920, 1080, { fit: 'cover', position: 'center' }).jpeg({ quality: 80, mozjpeg: true }).toFile(path.join(__dirname, '..', 'public', 'images', 'home-hero.jpg'));
      await sharp(buf).resize(1920, 1080, { fit: 'cover', position: 'center' }).webp({ quality: 80 }).toFile(path.join(__dirname, '..', 'public', 'images', 'home-hero.webp'));
      console.log('Saved hero images');
    } else {
      const webpFile = path.join(dir, `${img.name}.webp`);
      const jpgFile = path.join(dir, `${img.name}.jpg`);
      await sharp(buf).resize(800, 600, { fit: 'cover', position: 'center' }).webp({ quality: 80 }).toFile(webpFile);
      await sharp(buf).resize(800, 600, { fit: 'cover', position: 'center' }).jpeg({ quality: 80, mozjpeg: true }).toFile(jpgFile);
      const s = fs.statSync(webpFile).size;
      console.log(`Saved ${img.name}: ${Math.round(s/1024)} KiB`);
    }
  }

  // Also optimize public/hero/ketchikan.png and public/media/juneau-aerial.png in place
  console.log('Optimizing large existing repo assets...');
  const ketchikanPngPath = path.join(__dirname, '..', 'public', 'hero', 'ketchikan.png');
  const juneauAerialPath = path.join(__dirname, '..', 'public', 'media', 'juneau-aerial.png');
  
  // Create webp versions next to them
  await sharp(ketchikanPngPath).webp({ quality: 80 }).toFile(path.join(__dirname, '..', 'public', 'hero', 'ketchikan.webp'));
  await sharp(juneauAerialPath).webp({ quality: 80 }).toFile(path.join(__dirname, '..', 'public', 'media', 'juneau-aerial.webp'));

  // And also optimize the ketchikan images in public/images/ketchikan/
  const kp = path.join(__dirname, '..', 'public', 'images', 'ketchikan');
  const kpPort = path.join(kp, 'ketchikan-cruise-port.jpg');
  const kpMisty = path.join(kp, 'ketchikan-misty-fjords.jpg');
  const kpWhale = path.join(kp, 'ketchikan-whale-watching.jpg');
  
  if (fs.existsSync(kpPort)) {
    const b = fs.readFileSync(kpPort);
    await sharp(b).resize(1920, null, { withoutEnlargement: true }).jpeg({ quality: 82, mozjpeg: true }).toFile(kpPort + '.tmp');
    fs.renameSync(kpPort + '.tmp', kpPort);
    console.log('Resized ketchikan-cruise-port.jpg');
  }
  if (fs.existsSync(kpMisty)) {
    const b = fs.readFileSync(kpMisty);
    await sharp(b).resize(1920, null, { withoutEnlargement: true }).jpeg({ quality: 82, mozjpeg: true }).toFile(kpMisty + '.tmp');
    fs.renameSync(kpMisty + '.tmp', kpMisty);
    console.log('Resized ketchikan-misty-fjords.jpg');
  }
  if (fs.existsSync(kpWhale)) {
    const b = fs.readFileSync(kpWhale);
    await sharp(b).resize(1920, null, { withoutEnlargement: true }).jpeg({ quality: 82, mozjpeg: true }).toFile(kpWhale + '.tmp');
    fs.renameSync(kpWhale + '.tmp', kpWhale);
    console.log('Resized ketchikan-whale-watching.jpg');
  }

  console.log('All image optimization completed!');
}

run().catch(console.error);
