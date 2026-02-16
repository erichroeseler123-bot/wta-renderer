// build.js
// Authority Node Builder – FINAL (frontmatter-safe)
// Node 18+ / 20 compatible. Zero deps.

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// --------------------
// PATH SETUP
// --------------------
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CONTENT_DIR = path.join(__dirname, "content");
const DIST_DIR = path.join(__dirname, "dist");

// ONE-WAY EXIT (CHANGE PER NODE)
const CORE_BOOKING_URL =
  process.env.CORE_BOOKING_URL || "https://welcometoalaska.com/skagway";

// --------------------
// HELPERS
// --------------------
function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function writeFile(filePath, contents) {
  ensureDir(path.dirname(filePath));
  fs.writeFileSync(filePath, contents);
}

function readFile(filePath) {
  return fs.readFileSync(filePath, "utf-8");
}

function cleanDist() {
  if (fs.existsSync(DIST_DIR)) {
    fs.rmSync(DIST_DIR, { recursive: true, force: true });
  }
  ensureDir(DIST_DIR);
}

// REMOVE YAML FRONTMATTER
function stripFrontmatter(md) {
  if (md.startsWith("---")) {
    const end = md.indexOf("\n---", 3);
    if (end !== -1) {
      return md.slice(end + 4).trim();
    }
  }
  return md;
}

function markdownToHtml(md) {
  return md
    .replace(/^# (.*)$/gim, "<h1>$1</h1>")
    .replace(/^## (.*)$/gim, "<h2>$1</h2>")
    .replace(/^### (.*)$/gim, "<h3>$1</h3>")
    .replace(/\*\*(.*?)\*\*/gim, "<strong>$1</strong>")
    .replace(/\*(.*?)\*/gim, "<em>$1</em>")
    .replace(/\n/gim, "<br />");
}

function pageTemplate(title, body) {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>${title}</title>
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="robots" content="index,follow" />
  <style>
    body {
      font-family: system-ui, -apple-system, BlinkMacSystemFont, sans-serif;
      background: #0b0b0b;
      color: #f5f5f5;
      padding: 40px;
      max-width: 820px;
      margin: auto;
      line-height: 1.6;
    }
    h1,h2,h3 { color: #9ddcff; }
    a { color: #9ddcff; }
    .cta {
      margin-top: 56px;
      padding-top: 24px;
      border-top: 1px solid #333;
    }
    .cta a {
      display: inline-block;
      padding: 14px 20px;
      background: #9ddcff;
      color: #000;
      font-weight: 700;
      text-decoration: none;
    }
  </style>
</head>
<body>

${body}

<div class="cta">
  <p><strong>Ready to see live availability?</strong></p>
  <a href="${CORE_BOOKING_URL}" rel="noopener">
    View tours & book on Welcome to Alaska →
  </a>
</div>

</body>
</html>`;
}

// ROOT REDIRECT
function writeRootRedirect(target) {
  writeFile(
    path.join(DIST_DIR, "index.html"),
    `<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <meta http-equiv="refresh" content="0; url=${target}" />
  <link rel="canonical" href="${target}" />
  <title>Redirecting…</title>
</head>
<body>
  Redirecting to <a href="${target}">${target}</a>
</body>
</html>`,
  );
}

// --------------------
// BUILD
// --------------------
console.log("🛠 Building authority site…");

cleanDist();
writeRootRedirect("/ports/skagway/");

// LOGIC PAGES
const logicDir = path.join(CONTENT_DIR, "logic");
if (fs.existsSync(logicDir)) {
  for (const file of fs.readdirSync(logicDir)) {
    if (!file.endsWith(".md")) continue;

    const slug = file.replace(".md", "");
    const raw = stripFrontmatter(readFile(path.join(logicDir, file)));
    const html = markdownToHtml(raw);

    writeFile(
      path.join(DIST_DIR, "logic", slug, "index.html"),
      pageTemplate(slug.replace(/-/g, " "), html),
    );
  }
}

// PORTS
const portsDir = path.join(CONTENT_DIR, "ports");
if (fs.existsSync(portsDir)) {
  for (const port of fs.readdirSync(portsDir)) {
    const portPath = path.join(portsDir, port);
    if (!fs.statSync(portPath).isDirectory()) continue;

    const indexMd = path.join(portPath, "index.md");
    if (fs.existsSync(indexMd)) {
      const raw = stripFrontmatter(readFile(indexMd));
      const html = markdownToHtml(raw);

      writeFile(
        path.join(DIST_DIR, "ports", port, "index.html"),
        pageTemplate(port, html),
      );
    }
  }
}

console.log("✅ Build complete");
