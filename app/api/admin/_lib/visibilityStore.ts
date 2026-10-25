import fs from "node:fs/promises";
import path from "node:path";

type Store = {
  providers: Record<string, boolean>;
  tours: Record<string, boolean>; // key = company:itemPk
  updatedAt: string;
};

const STORE_PATH = path.join(process.cwd(), "data", "visibility.json");

const EMPTY: Store = {
  providers: {},
  tours: {},
  updatedAt: new Date(0).toISOString(),
};

async function readStore(): Promise<Store> {
  try {
    const raw = await fs.readFile(STORE_PATH, "utf8");
    const j = JSON.parse(raw);
    return {
      providers: j?.providers || {},
      tours: j?.tours || {},
      updatedAt: j?.updatedAt || new Date().toISOString(),
    };
  } catch {
    return { ...EMPTY };
  }
}

async function writeStore(store: Store) {
  await fs.mkdir(path.dirname(STORE_PATH), { recursive: true });
  await fs.writeFile(STORE_PATH, JSON.stringify(store, null, 2) + "\n", "utf8");
}

export async function getVisibility() {
  const s = await readStore();
  return {
    providers: s.providers,
    tours: s.tours,
    updatedAt: s.updatedAt,
  };
}

export async function setProviderHidden(company: string, hidden: boolean) {
  const s = await readStore();
  s.providers[company] = hidden;
  s.updatedAt = new Date().toISOString();
  await writeStore(s);
  return { company, hidden };
}

export async function setTourHidden(key: string, hidden: boolean) {
  const s = await readStore();
  s.tours[key] = hidden;
  s.updatedAt = new Date().toISOString();
  await writeStore(s);
  return { key, hidden };
}
