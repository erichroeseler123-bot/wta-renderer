import path from "path";
import { promises as fs } from "fs";
import { getDurableKV } from "@/lib/kv";

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

export class DurableStorageUnavailableError extends Error {
  readonly code = "durable_storage_unavailable";
  readonly status = 503;

  constructor(
    message = "Durable storage (Redis/KV) is not configured. Changes that exist only in memory or a local file cannot be saved.",
  ) {
    super(message);
    this.name = "DurableStorageUnavailableError";
  }
}

const FILE = path.join(process.cwd(), "data", "visibility.json");
const KV_KEY = "wta:visibility:v1";

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
    const kv = await getDurableKV();
    if (!kv) return null;
    const stored = await kv.get<VisibilityDB>(KV_KEY);
    return stored ? normalizeDB(stored) : null;
  } catch {
    return null;
  }
}

async function readDB(): Promise<VisibilityDB> {
  const [fileDb, kvDb] = await Promise.all([readFileDB(), readKVDB()]);

  if (fileDb && kvDb) {
    const base = parseTimestamp(kvDb.updatedAt) >= parseTimestamp(fileDb.updatedAt) ? kvDb : fileDb;
    return normalizeDB({
      providers: { ...fileDb.providers, ...kvDb.providers },
      tours: { ...fileDb.tours, ...kvDb.tours },
      overrides: { ...(fileDb.overrides || {}), ...(kvDb.overrides || {}) },
      updatedAt: base.updatedAt,
    });
  }

  if (kvDb) return normalizeDB(kvDb);
  if (fileDb) return normalizeDB(fileDb);

  return {
    providers: {},
    tours: {},
    overrides: {},
    updatedAt: new Date(0).toISOString(),
  };
}

async function writeDB(db: VisibilityDB): Promise<VisibilityDB> {
  const kv = await getDurableKV();
  if (!kv) {
    throw new DurableStorageUnavailableError();
  }

  db.updatedAt = new Date().toISOString();
  const normalized = normalizeDB(db);

  try {
    await kv.set(KV_KEY, normalized);
    const verified = await kv.get<VisibilityDB>(KV_KEY);
    if (!verified || verified.updatedAt !== normalized.updatedAt) {
      throw new DurableStorageUnavailableError("Durable storage write could not be verified.");
    }
  } catch (err) {
    if (err instanceof DurableStorageUnavailableError) throw err;
    throw new DurableStorageUnavailableError(
      `Durable storage write failed: ${err instanceof Error ? err.message : String(err)}`,
    );
  }

  return normalized;
}

export async function getVisibility(): Promise<VisibilityDB> {
  return readDB();
}

export async function setProviderHidden(company: string, hidden: boolean) {
  const db = await readDB();
  const normalizedCompany = String(company).trim().toLowerCase();
  db.providers[normalizedCompany] = !!hidden;
  const saved = await writeDB(db);
  return {
    company: normalizedCompany,
    hidden: !!hidden,
    updatedAt: saved.updatedAt,
  };
}

export async function setTourHidden(key: string, hidden: boolean) {
  const db = await readDB();
  const normalizedKey = String(key).trim().toLowerCase();
  db.tours[normalizedKey] = !!hidden;
  const saved = await writeDB(db);
  return { key: normalizedKey, hidden: !!hidden, updatedAt: saved.updatedAt };
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
  const saved = await writeDB(db);
  return {
    key: normalizedKey,
    override: saved.overrides?.[normalizedKey] || null,
    updatedAt: saved.updatedAt,
  };
}

export async function deleteIsolatedTestVisibilityRecord(key: string) {
  const normalizedKey = String(key).trim().toLowerCase();
  if (!normalizedKey.startsWith("__test_isolated__:")) {
    throw new Error("deleteIsolatedTestVisibilityRecord only allows __test_isolated__:* keys.");
  }
  const db = await readDB();
  delete db.tours[normalizedKey];
  if (db.overrides) {
    delete db.overrides[normalizedKey];
  }
  return writeDB(db);
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
