import assert from "node:assert/strict";
import { buildRecommendationShortlist } from "../lib/recommendationEngine";

type Candidate = { id: string; kind: "exact" | "fallback"; score: number };

const candidates: Candidate[] = [
  { id: "fallback-cheap", kind: "fallback", score: 80 },
  { id: "exact-b", kind: "exact", score: 95 },
  { id: "exact-a", kind: "exact", score: 95 },
  { id: "fallback-strong", kind: "fallback", score: 90 },
  { id: "exact-a", kind: "exact", score: 70 },
];

const result = buildRecommendationShortlist({
  candidates,
  limit: 4,
  evaluate: (candidate) => ({
    key: candidate.id,
    score: candidate.score,
    exactMatch: candidate.kind === "exact",
    reason: candidate.kind === "exact" ? "direct match" : "fallback",
  }),
  tieBreak: (a, b) => a.candidate.id.localeCompare(b.candidate.id),
});

assert.equal(result.exactCount, 3, "exactCount should describe scored exact rows before dedupe");
assert.deepEqual(
  result.recommendations.map((item) => item.key),
  ["exact-a", "exact-b", "fallback-strong", "fallback-cheap"],
  "shortlist should prefer exact matches, dedupe keys, then fill with strongest fallbacks"
);
assert.equal(result.recommendations.length, 4);
assert.ok(result.recommendations.every((item) => item.reason.length > 0));

const empty = buildRecommendationShortlist({
  candidates: [],
  evaluate: () => {
    throw new Error("evaluate should not run for empty candidates");
  },
});
assert.deepEqual(empty.recommendations, []);
assert.equal(empty.exactCount, 0);

const zeroLimit = buildRecommendationShortlist({
  candidates,
  limit: 0,
  evaluate: (candidate) => ({
    key: candidate.id,
    score: candidate.score,
    exactMatch: true,
    reason: "match",
  }),
});
assert.deepEqual(zeroLimit.recommendations, []);

console.log("recommendation engine regression: PASS");
