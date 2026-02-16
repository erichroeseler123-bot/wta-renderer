type UnsplashPhoto = {
  urls?: { regular?: string; small?: string };
};

const FALLBACK =
  "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?auto=format&fit=crop&w=1600&q=80";

export async function getUnsplashImage(query: string): Promise<string> {
  const key = process.env.UNSPLASH_ACCESS_KEY;

  // Fail-soft: no key (local/dev) => fallback
  if (!key) return FALLBACK;

  try {
    const res = await fetch(
      `https://api.unsplash.com/search/photos?query=${encodeURIComponent(
        query,
      )}&per_page=1&orientation=landscape`,
      {
        headers: { Authorization: `Client-ID ${key}` },
        // keep it from being weirdly cached in dev
        cache: "no-store",
      },
    );

    if (!res.ok) return FALLBACK;

    const data = (await res.json()) as { results?: UnsplashPhoto[] };
    const first = data?.results?.[0];
    return first?.urls?.regular || first?.urls?.small || FALLBACK;
  } catch {
    return FALLBACK;
  }
}
