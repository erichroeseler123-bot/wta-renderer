type KVGetOptions = {
  ex?: number;
  nx?: boolean;
};

type KVClient = {
  get<T = unknown>(key: string): Promise<T | null>;
  set(key: string, value: unknown, opts?: KVGetOptions): Promise<unknown>;
  del(key: string): Promise<number>;
};

type LocalEntry = {
  value: unknown;
  expiresAt?: number;
};

const localStore = new Map<string, LocalEntry>();

function nowMs() {
  return Date.now();
}

function isPlaceholder(v: string) {
  return /(put_yours_here|change_me_to_long_random|_or_test_xxx)$/i.test(v.trim());
}

function readEnv(name: string) {
  const v = String(process.env[name] || "").trim();
  if (!v || isPlaceholder(v)) return "";
  return v;
}

function cleanExpiredLocal(key: string) {
  const entry = localStore.get(key);
  if (!entry) return;
  if (entry.expiresAt && entry.expiresAt <= nowMs()) {
    localStore.delete(key);
  }
}

const localKV: KVClient = {
  async get<T = unknown>(key: string) {
    cleanExpiredLocal(key);
    const entry = localStore.get(key);
    return (entry ? (entry.value as T) : null);
  },
  async set(key: string, value: unknown, opts?: KVGetOptions) {
    cleanExpiredLocal(key);
    const ex = Number(opts?.ex || 0);
    const expiresAt = ex > 0 ? nowMs() + ex * 1000 : undefined;
    if (opts?.nx && localStore.has(key)) return null;
    localStore.set(key, { value, expiresAt });
    return "OK";
  },
  async del(key: string) {
    return localStore.delete(key) ? 1 : 0;
  },
};

export async function getKV(): Promise<KVClient | null> {
  const vercelUrl = readEnv("KV_REST_API_URL");
  const vercelToken = readEnv("KV_REST_API_TOKEN");
  if (vercelUrl && vercelToken) {
    const mod = await import("@vercel/kv");
    return mod.kv as unknown as KVClient;
  }

  const upstashUrl = readEnv("UPSTASH_REDIS_REST_URL");
  const upstashToken = readEnv("UPSTASH_REDIS_REST_TOKEN");
  if (upstashUrl && upstashToken) {
    const mod = await import("@upstash/redis");
    return mod.Redis.fromEnv() as unknown as KVClient;
  }

  if (process.env.NODE_ENV !== "production") {
    return localKV;
  }

  return null;
}
