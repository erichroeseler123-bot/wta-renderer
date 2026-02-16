import fs from "fs";
import path from "path";

const ROOT = "content/ports";

function fixDir(dir) {
  if (!fs.existsSync(dir)) return;

  for (const entry of fs.readdirSync(dir)) {
    const full = path.join(dir, entry);

    if (fs.statSync(full).isDirectory()) {
      fixDir(full);
      continue;
    }

    if (!entry.endsWith(".md")) continue;

    const raw = fs.readFileSync(full, "utf8");
    if (!raw.startsWith("---")) continue;

    const parts = raw.split("---");
    if (parts.length < 3) continue;

    const front = parts[1];
    const body = parts.slice(2).join("---");

    const fixedFront = front
      .split("\n")
      .map((line) => {
        if (!line.includes(":")) return line;
        const [key, ...rest] = line.split(":");
        const value = rest.join(":").trim();

        if (!value) return line;
        if (value.startsWith('"') && value.endsWith('"')) return line;

        return `${key}: "${value.replace(/"/g, '\\"')}"`;
      })
      .join("\n");

    const fixed = `---\n${fixedFront}\n---${body}`;
    fs.writeFileSync(full, fixed);
    console.log(`✔ fixed ${full}`);
  }
}

fixDir(ROOT);
console.log("✅ All front-matter normalized (ports, logic, ships)");
