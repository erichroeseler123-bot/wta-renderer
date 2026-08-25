export type RecommendationEvaluation<TMeta = unknown> = {
  key: string;
  score: number;
  exactMatch: boolean;
  reason: string;
  tradeoff?: string;
  meta?: TMeta;
};

export type RankedRecommendation<TCandidate, TMeta = unknown> =
  RecommendationEvaluation<TMeta> & {
    candidate: TCandidate;
  };

export type BuildShortlistOptions<TCandidate, TMeta = unknown> = {
  candidates: readonly TCandidate[];
  evaluate: (candidate: TCandidate) => RecommendationEvaluation<TMeta>;
  limit?: number;
  tieBreak?: (
    a: RankedRecommendation<TCandidate, TMeta>,
    b: RankedRecommendation<TCandidate, TMeta>
  ) => number;
};

export type RecommendationShortlist<TCandidate, TMeta = unknown> = {
  recommendations: RankedRecommendation<TCandidate, TMeta>[];
  exactCount: number;
  scored: RankedRecommendation<TCandidate, TMeta>[];
};

/**
 * Shared deterministic recommendation mechanics for portfolio specialist sites.
 *
 * Destination code owns all facts, tags, weights, reasons and tradeoffs. This
 * engine only owns the repeatable mechanics: evaluate, rank, prefer exact
 * matches, de-duplicate and fill a bounded shortlist with transparent fallbacks.
 */
export function buildRecommendationShortlist<TCandidate, TMeta = unknown>({
  candidates,
  evaluate,
  limit = 4,
  tieBreak,
}: BuildShortlistOptions<TCandidate, TMeta>): RecommendationShortlist<TCandidate, TMeta> {
  const safeLimit = Number.isFinite(limit) ? Math.max(0, Math.floor(limit)) : 4;

  const scored = candidates
    .map((candidate) => ({ candidate, ...evaluate(candidate) }))
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return tieBreak ? tieBreak(a, b) : a.key.localeCompare(b.key);
    });

  const exact = scored.filter((item) => item.exactMatch);
  const recommendations: RankedRecommendation<TCandidate, TMeta>[] = [];
  const selectedKeys = new Set<string>();

  for (const item of [...exact, ...scored]) {
    if (selectedKeys.has(item.key)) continue;
    selectedKeys.add(item.key);
    recommendations.push(item);
    if (recommendations.length >= safeLimit) break;
  }

  return {
    recommendations,
    exactCount: exact.length,
    scored,
  };
}
