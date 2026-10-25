import path from "path";
import { promises as fs } from "fs";

export type VisibilityDB = {
  providers: Record<string, boolean>; // company -> hidden
  tours: Record<string, boolean>;     // "company:itemPk" -> hidden
  updatedAt: string;
};

const FILE = path.join(process.cwd(), "data", "visibility.json");

async function readDB(): Promise<VisibilityDB> {
  try {
    const raw = await fs.readFile(FILE, "utf8");
    const j = JSON.parse(raw);
    return {
      providers: j?.providers || {},
      tours: j?.tours || {},
      updatedAt: j?.updatedAt || new Date().toISOString(),
    };
  } catch {
    return { providers: {}, tours: {}, updatedAt: new Date().toISOString() };
  }
}

async function writeDB(db: VisibilityDB) {
  await fs.mkdir(path.dirname(FILE), { recursive: true });
  db.updatedAt = new Date().toISOString();
  await fs.writeFile(FILE, JSON.stringify(db, null, 2), "utf8");
}

export async function getVisibility() {
  return readDB();
}

export async function setProviderHidden(company: string, hidden: boolean) {
  const db = await readDB();
  db.providers[String(company)] = !!hidden;
  await writeDB(db);
  return { company: String(company), hidden: !!hidden, updatedAt: db.updatedAt };
}

export async function setTourHidden(key: string, hidden: boolean) {
  const db = await readDB();
  db.tours[String(key)] = !!hidden;
  await writeDB(db);
  return { key: String(key), hidden: !!hidden, updatedAt: db.updatedAt };
}

export async function isProviderHidden(company: string): Promise<boolean> {
  const db = await readDB();
  return !!db.providers[String(company)];
}

export async function isTourHidden(company: string, itemPk: number): Promise<boolean> {
  const db = await readDB();
  const key = `${company}:${itemPk}`;
  return !!db.tours[key];
}

export async function isTourBlocked(company: string, itemPk: number): Promise<boolean> {
  const [p, t] = await Promise.all([
    isProviderHidden(company),
    isTourHidden(company, itemPk),
  ]);
  return p || t;
}
