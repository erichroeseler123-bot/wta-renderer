/**
 * Alaska Authority Static Builder (v3)
 * Canonical non-commercial authority builder
 */

import fs from "fs";
import path from "path";
import { marked } from "marked";
import { articleSchema, breadcrumbSchema } from "./lib/schema.js";

/* ---------------- config ---------------- */

const ROOT = process.cwd();
const DIST = path.join(ROOT, "dist");

const SITE = {
  wtaOrigin: process.env.WTA_ORIGIN || "https://welcometoalaskatours.com",
  origin: process.env.SITE_ORIGIN || "http://localhost:8787",
  name: "Alaska Cruise Port Authority",
  defaultMeta: "Independent feasibility guidance for Alaska cruise ports.",
};

/* ---------------- utils ---------------- */

const read = (f) => fs.readFileSync(f, "utf8");

const write = (f, c) => {
  fs.mkdirSync(path.dirname(f), { recursive: true });
  fs.writeFileSync(f, c, "utf8");
};

const exists = (p) => {
  try {
    fs.accessSync(p);
    return true;
  } catch {
    return false;
  }
};

const walk = (dir) =>
  !exists(dir)
    ? []
    : fs.readdirSync(dir).flatMap((e) => {
        const f = path.join(dir, e);
        return fs.statSync(f).isDirectory() ? walk(f) : f;
      });

/* ---------------- helpers ---------------- */

const esc = (s) =>
  String(s ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");

const render = (tpl, vars) =>
  Object.entries(vars).reduce(
    (o, [k, v]) => o.replaceAll(`{{${k}}}`, v ?? ""),
    tpl,
  );

const slugToTitle = (s) =>
  s
    .split("-")
    .map((w) => w[0]?.toUpperCase() + w.slice(1))
    .join(" ");

const canonicalFor = (p) => SITE.origin + (p.endsWith("/") ? p : p + "/");

function inferPort(urlPath) {
  const m = urlPath.match(/^\/ports\/([^\/]+)\//);
  return m ? m[1] : null;
}

function inferCategory(urlPath) {
  const m = urlPath.match(/^\/ports\/[^\/]+\/categories\/([^\/]+)\//);
  if (!m) return null;
  const slug = m[1];
  // map authority category slugs -> WTA filter values
  if (slug === "helicopter-tours") return "helicopter";
  if (slug === "glacier-tours") return "glacier";
  if (slug === "whale-watching") return "whale-watching";
  // fallback: use slug as category
  return slug;
}

function wtaLinkFor(urlPath) {
  const port = inferPort(urlPath);
  const cat = inferCategory(urlPath);
  const base = (
    process.env.WTA_ORIGIN ||
    SITE.wtaOrigin ||
    "https://welcometoalaskatours.com"
  ).replace(/\/$/, "");
  const qs = new URLSearchParams();
  if (port) qs.set("port", port);
  if (cat) qs.set("category", cat);
  const q = qs.toString();
  return q ? `${base}/tours?${q}` : `${base}/tours`;
}

/* ---------------- frontmatter ---------------- */

function parseFrontmatter(raw) {
  if (!raw.startsWith("---\n")) return { data: {}, body: raw };

  const end = raw.indexOf("\n---\n", 4);
  if (end === -1) return { data: {}, body: raw };

  const block = raw.slice(4, end).trim();
  const body = raw.slice(end + 5);

  const data = {};
  block.split("\n").forEach((l) => {
    const m = l.match(/^(.+?):\s*(.+)$/);
    if (m) data[m[1].trim()] = m[2].replace(/^['"]|['"]$/g, "");
  });

  return { data, body };
}

const firstH1 = (md) =>
  md
    .split("\n")
    .find((l) => l.startsWith("# "))
    ?.slice(2) || "";

/* ---------------- routing ---------------- */

const urlFromContentFile = (f) => {
  const rel = path
    .relative(path.join(ROOT, "content"), f)
    .replace(/\\/g, "/")
    .replace(/\.md$/, "");
  return rel.endsWith("/index") ? `/${rel.slice(0, -6)}/` : `/${rel}/`;
};

const outFileFromUrl = (u) =>
  u === "/"
    ? path.join(DIST, "index.html")
    : path.join(DIST, u.replace(/^\/|\/$/g, ""), "index.html");

/* ---------------- breadcrumbs ---------------- */

function breadcrumbsFromUrl(urlPath) {
  const parts = urlPath.split("/").filter(Boolean);
  const crumbs = [{ name: "Home", url: canonicalFor("/") }];

  let acc = "";
  for (const p of parts) {
    acc += `/${p}`;
    crumbs.push({
      name: slugToTitle(p),
      url: canonicalFor(acc + "/"),
    });
  }
  return crumbs;
}

/* ---------------- page builder ---------------- */

function pageVarsFromMarkdown(file, urlPath) {
  const raw = read(file);
  const fm = parseFrontmatter(raw);

  const title =
    fm.data.title ||
    firstH1(fm.body) ||
    slugToTitle(urlPath.split("/").filter(Boolean).pop());

  const description =
    fm.data.description || fm.data.summary || SITE.defaultMeta;

  const canonical = canonicalFor(urlPath);
  const breadcrumbs = breadcrumbsFromUrl(urlPath);

  return {
    WTA_LINK: wtaLinkFor(urlPath),
    PAGE_TITLE: `${title} | ${SITE.name}`,
    META_DESC: esc(description),
    CANONICAL: canonical,
    NAV: breadcrumbs
      .map((b) => `<a href="${b.url}">${esc(b.name)}</a>`)
      .join(""),
    JSON_LD:
      articleSchema({ title, description, url: canonical }) +
      breadcrumbSchema(breadcrumbs),
    CONTENT: `<article class="prose">${marked.parse(fm.body)}</article>`,
  };
}

/* ---------------- build ---------------- */

function build() {
  if (exists(DIST)) fs.rmSync(DIST, { recursive: true, force: true });
  fs.mkdirSync(DIST, { recursive: true });

  if (exists("public")) {
    fs.cpSync("public", DIST, { recursive: true });
  }

  const BASE = read(path.join(ROOT, "templates", "base.html"));
  const files = walk(path.join(ROOT, "content")).filter((f) =>
    f.endsWith(".md"),
  );

  for (const file of files) {
    const url = urlFromContentFile(file);
    const out = outFileFromUrl(url);
    write(out, render(BASE, pageVarsFromMarkdown(file, url)));
  }

  console.log(`✅ Built ${files.length} authority pages`);
}

build();
