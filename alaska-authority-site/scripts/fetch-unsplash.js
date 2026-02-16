import fs from "fs";
import path from "path";
import fetch from "node-fetch";

const ACCESS_KEY = process.env.UNSPLASH_ACCESS_KEY;
if (!ACCESS_KEY) {
  console.error("❌ UNSPLASH_ACCESS_KEY not set");
  process.exit(1);
}

const IMAGE_ROOT = "public/images";
const CREDITS_FILE = path.join(IMAGE_ROOT, "credits.json");

function slugify(str) {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

async function fetchImage({ query, port, filenameHint }) {
  const res = await fetch(
    `https://api.unsplash.com/search/photos?query=${encodeURIComponent(
      query,
    )}&orientation=landscape&per_page=1`,
    {
      headers: {
        Authorization: `Client-ID ${ACCESS_KEY}`,
      },
    },
  );

  const data = await res.json();
  if (!data.results || !data.results.length) {
    throw new Error(`No Unsplash results for ${query}`);
  }

  const img = data.results[0];
  const imgUrl = img.urls.full;
  const photographer = img.user.name;
  const profile = img.user.links.html;

  const portDir = path.join(IMAGE_ROOT, port);
  fs.mkdirSync(portDir, { recursive: true });

  const filename = slugify(filenameHint) + ".jpg";
  const outPath = path.join(portDir, filename);

  const imgRes = await fetch(imgUrl);
  const buffer = Buffer.from(await imgRes.arrayBuffer());
  fs.writeFileSync(outPath, buffer);

  // save credit
  const credits = JSON.parse(fs.readFileSync(CREDITS_FILE, "utf8"));
  credits.images.push({
    file: `/images/${port}/${filename}`,
    photographer,
    profile,
    source: "Unsplash",
  });
  fs.writeFileSync(CREDITS_FILE, JSON.stringify(credits, null, 2));

  console.log(`✅ Saved ${filename} (${photographer})`);

  return `/images/${port}/${filename}`;
}

// -------- CONFIGURE DOWNLOADS HERE --------
const jobs = [
  {
    query: "Ketchikan Alaska whale watching boat",
    port: "ketchikan",
    filenameHint: "ketchikan-whale-watching",
  },
  {
    query: "Ketchikan Misty Fjords floatplane",
    port: "ketchikan",
    filenameHint: "ketchikan-misty-fjords",
  },
  {
    query: "Ketchikan Alaska cruise port rain",
    port: "ketchikan",
    filenameHint: "ketchikan-cruise-port",
  },
];

// -------- RUN --------
(async () => {
  for (const job of jobs) {
    await fetchImage(job);
  }
})();
