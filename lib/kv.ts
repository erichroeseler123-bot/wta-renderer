// lib/kv.ts
export async function getKV() {
  // Vercel KV / Upstash envs (common)
  const hasKV =
    !!process.env.KV_REST_API_URL &&
    !!process.env.KV_REST_API_TOKEN;

  if (!hasKV) return null;

  const mod = await import("@vercel/kv");
  return mod.kv;
}
