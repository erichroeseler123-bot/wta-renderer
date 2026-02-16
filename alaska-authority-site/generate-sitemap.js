import fs from "fs";
import path from "path";

const SITE = "https://alaskacruiseportauthority.com";
const DIST = "dist";

function walk(dir, urls = []) {
  for (const f of fs.readdirSync(dir)) {
    const p = path.join(dir, f);
    if (fs.statSync(p).isDirectory()) walk(p, urls);
    else if (f === "index.html") {
      urls.push(SITE + p.replace(DIST, "").replace("index.html", ""));
    }
  }
  return urls;
}

const urls = walk(DIST);

fs.writeFileSync(
  path.join(DIST, "sitemap.xml"),
  `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((u) => `<url><loc>${u}</loc></url>`).join("\n")}
</urlset>`,
);

console.log("sitemap.xml generated:", urls.length);
