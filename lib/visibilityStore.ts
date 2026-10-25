import path from "path";
import { promises as fs } from "fs";
import { getKV } from "@/lib/kv";

export type TourCatalogOverride = {
  title?: string;
  fromPrice?: string;
  priceUpdatedAt?: string | null;
  description?: string;
  duration?: string;
  retired?: boolean;
};

export type VisibilityDB = {
  providers: Record<string, boolean>; // company -> hidden
  tours: Record<string, boolean>; // "company:itemPk" -> hidden
  overrides?: Record<string, TourCatalogOverride>; // "company:itemPk" -> runtime catalog override
  updatedAt: string;
};

const FILE = path.join(process.cwd(), "data", "visibility.json");
const KV_KEY = "wta:visibility:v1";

declare global {
  // eslint-disable-next-line no-var
  var __wtaVisibilityDB: VisibilityDB | undefined;
}

function normalizeDB(input: Partial<VisibilityDB> | null | undefined): VisibilityDB {
  return {
    providers:
      input?.providers && typeof input.providers === "object" ? { ...input.providers } : {},
    tours: input?.tours && typeof input.tours === "object" ? { ...input.tours } : {},
    overrides:
      input?.overrides && typeof input.overrides === "object" ? { ...input.overrides } : {},
    updatedAt:
      typeof input?.updatedAt === "string" && input.updatedAt
        ? input.updatedAt
        : new Date(0).toISOString(),
  };
}

function parseTimestamp(iso: string | undefined): number {
  const ts = Date.parse(String(iso || ""));
  return Number.isFinite(ts) ? ts : 0;
}

async function readFileDB(): Promise<VisibilityDB | null> {
  try {
    const raw = await fs.readFile(FILE, "utf8");
    const j = JSON.parse(raw);
    return normalizeDB(j);
  } catch {
    return null;
  }
}

async function readKVDB(): Promise<VisibilityDB | null> {
  try {
    const kv = await getKV();
    if (!kv) return null;
    const stored = await kv.get<VisibilityDB>(KV_KEY);
    return stored ? normalizeDB(stored) : null;
  } catch {
    return null;
  }
}

async function readDB(): Promise<VisibilityDB> {
  const [fileDb, kvDb] = await Promise.all([readFileDB(), readKVDB()]);
  const memDb = globalThis.__wtaVisibilityDB ? normalizeDB(globalThis.__wtaVisibilityDB) : null;

  const candidates = [fileDb, kvDb, memDb].filter((c): c is VisibilityDB => Boolean(c));
  if (!candidates.length) {
    return {
      providers: {},
      tours: {},
      overrides: {},
      updatedAt: new Date().toISOString(),
    };
  }

  candidates.sort((a, b) => parseTimestamp(b.updatedAt) - parseTimestamp(a.updatedAt));
  const newest = normalizeDB(candidates[0]);
  globalThis.__wtaVisibilityDB = newest;
  return newest;
}

async function writeDB(db: VisibilityDB) {
  db.updatedAt = new Date().toISOString();
  const normalized = normalizeDB(db);
  globalThis.__wtaVisibilityDB = normalized;

  // Persist to runtime KV (works on both serverless and local runtimes)
  try {
    const kv = await getKV();
    if (kv) {
      await kv.set(KV_KEY, normalized);
    }
  } catch {
    // Ignore KV errors if fallback file/memory is available
  }

  // Persist to data/visibility.json when filesystem is writable
  try {
    await fs.mkdir(path.dirname(FILE), { recursive: true });
    await fs.writeFile(FILE, JSON.stringify(normalized, null, 2) + "\n", "utf8");
  } catch {
    // Read-only serverless filesystem (EROFS) is expected in production; KV + memory handle runtime state
  }
}

export async function getVisibility(): Promise<VisibilityDB> {
  return readDB();
}

export async function setProviderHidden(company: string, hidden: boolean) {
  const db = await readDB();
  db.providers[String(company).trim().toLowerCase()] = !!hidden;
  await writeDB(db);
  return {
    company: String(company).trim().toLowerCase(),
    hidden: !!hidden,
    updatedAt: db.updatedAt,
  };
}

export async function setTourHidden(key: string, hidden: boolean) {
  const db = await readDB();
  const normalizedKey = String(key).trim().toLowerCase();
  db.tours[normalizedKey] = !!hidden;
  await writeDB(db);
  return { key: normalizedKey, hidden: !!hidden, updatedAt: db.updatedAt };
}

export async function setTourCatalogOverride(
  key: string,
  override: TourCatalogOverride | null,
) {
  const db = await readDB();
  const normalizedKey = String(key).trim().toLowerCase();
  if (!db.overrides) db.overrides = {};
  if (override === null) {
    delete db.overrides[normalizedKey];
  } else {
    db.overrides[normalizedKey] = {
      ...(db.overrides[normalizedKey] || {}),
      ...override,
    };
  }
  await writeDB(db);
  return {
    key: normalizedKey,
    override: db.overrides[normalizedKey] || null,
    updatedAt: db.updatedAt,
  };
}

export async function isProviderHidden(company: string): Promise<boolean> {
  const db = await readDB();
  return !!db.providers[String(company).trim().toLowerCase()];
}

export async function isTourHidden(company: string, itemPk: number): Promise<boolean> {
  const db = await readDB();
  const key = `${String(company).trim().toLowerCase()}:${itemPk}`;
  return !!db.tours[key];
}

export async function isTourBlocked(company: string, itemPk: number): Promise<boolean> {
  const [p, t] = await Promise.all([
    isProviderHidden(company),
    isTourHidden(company, itemPk),
  ]);
  return p || t;
}
