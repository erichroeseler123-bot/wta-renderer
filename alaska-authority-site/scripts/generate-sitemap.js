import fs from "fs";
import path from "path";

const DIST = path.join(process.cwd(), "dist");
const ORIGIN = "https://alaskacruiseportauthority.com";

function walk(dir) {
  let results = [];
  for (const f of fs.readdirSync(dir)) {
    const p = path.join(dir, f);
    if (fs.statSync(p).isDirectory()) {
      results = results.concat(walk(p));
    } else if (f === "index.html") {
      results.push(p);
    }
  }
  return results;
}

const urls = walk(DIST).map(
  (f) => ORIGIN + f.replace(DIST, "").replace(/index\.html$/, ""),
);

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (u) => `
  <url>
    <loc>${u}</loc>
  </url>
`,
  )
  .join("")}
</urlset>`;

fs.writeFileSync(path.join(DIST, "sitemap.xml"), xml);
console.log(`✅ sitemap.xml generated (${urls.length} URLs)`);
