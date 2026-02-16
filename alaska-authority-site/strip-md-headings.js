import fs from "fs";
import path from "path";

const ROOT = "content";

function processFile(filePath) {
  const raw = fs.readFileSync(filePath, "utf8");

  if (!raw.startsWith("---")) return;

  const parts = raw.split("---");
  if (parts.length < 3) return;

  const frontmatter = parts[1];
  let body = parts.slice(2).join("---").trimStart();

  // Remove first markdown H1 if present
  body = body.replace(/^#\s+.*\n+/, "");

  const fixed = `---\n${frontmatter.trim()}\n---\n\n${body.trim()}\n`;

  fs.writeFileSync(filePath, fixed);
  console.log("✔ fixed", filePath);
}

function walk(dir) {
  for (const item of fs.readdirSync(dir)) {
    const full = path.join(dir, item);
    const stat = fs.statSync(full);

    if (stat.isDirectory()) {
      walk(full);
    } else if (item.endsWith(".md")) {
      processFile(full);
    }
  }
}

walk(ROOT);
console.log("✅ All Markdown headings normalized");
