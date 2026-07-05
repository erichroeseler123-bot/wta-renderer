interface CacheConfig {
  alpha: number;  // Minimum TTL in seconds for imminent trips (e.g., 120 seconds / 2 mins)
  gamma: number;  // Maximum baseline TTL in seconds for far-out trips (e.g., 21600 seconds / 6 hours)
  beta: number;   // Decay constant controlling how fast the TTL scales out
}

const DEFAULT_CONFIG: CacheConfig = {
  alpha: 120,       // 2 minutes minimum for trips happening right now
  gamma: 21600,     // 6 hours maximum baseline for distant trips
  beta: 0.15,       // Smooth decay curve scaling over days
};

/**
 * Calculates the dynamic Cache TTL (Time-To-Live) in seconds for an availability date
 * using Exponential Proximity Decay: TTL(t) = gamma - (gamma - alpha) * e^(-beta * t)
 * @param targetDateStr The date being queried (Format: "YYYY-MM-DD")
 * @returns TTL in seconds to pass to Vercel KV / Upstash Redis
 */
export function getPredictiveCacheTTL(targetDateStr: string, config = DEFAULT_CONFIG): number {
  const now = new Date();
  
  let targetDate: Date;
  try {
    targetDate = new Date(targetDateStr);
    if (Number.isNaN(targetDate.getTime())) {
      return config.gamma; // Fallback to max TTL
    }
  } catch {
    return config.gamma; // Fallback to max TTL
  }

  // Calculate difference in days (t)
  const diffTime = targetDate.getTime() - now.getTime();
  const t = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));

  // If the target date has already passed, use a tiny baseline or don't cache
  if (diffTime < 0 && t === 0) {
    return 60; // 1 minute safety fallback
  }

  // Calculate exponential scaling
  // At t = 0 (Today/Tomorrow): TTL = alpha (2 mins)
  // At t -> infinity: TTL = gamma (6 hours)
  const dynamicTTL = Math.round(
    config.gamma - (config.gamma - config.alpha) * Math.exp(-config.beta * t)
  );

  return Math.max(config.alpha, Math.min(config.gamma, dynamicTTL));
}
