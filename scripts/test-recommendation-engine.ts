import assert from "node:assert/strict";
import { buildRecommendationShortlist } from "../lib/recommendationEngine";
import { finderReturnHref, readFinderChoices } from "../lib/finderChoices";

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

const diverseCandidates = Array.from({ length: 8 }, (_, index) => ({
  id: `tour-${index}`,
  operator: `operator-${index}`,
  score: 100 - index,
}));
for (const limit of [1, 2, 4]) {
  const diverse = buildRecommendationShortlist({
    candidates: diverseCandidates,
    limit,
    diversityKey: (candidate) => candidate.operator,
    evaluate: (candidate) => ({
      key: candidate.id,
      score: candidate.score,
      exactMatch: true,
      reason: "direct match",
    }),
  });
  assert.equal(diverse.recommendations.length, limit, "a full diversity pass must not append an extra recommendation");
  assert.deepEqual(diverse.recommendations.map((item) => item.key), diverseCandidates.slice(0, limit).map((item) => item.id));
}

const repeatedOperator = buildRecommendationShortlist({
  candidates: diverseCandidates.map((candidate) => ({ ...candidate, operator: "same-operator" })),
  limit: 4,
  diversityKey: (candidate) => candidate.operator,
  evaluate: (candidate) => ({ key: candidate.id, score: candidate.score, exactMatch: true, reason: "direct match" }),
});
assert.equal(repeatedOperator.recommendations.length, 4, "fallback pass should fill a partial diversity shortlist");

console.log("recommendation engine regression: PASS");


const originalChoices = { port: "ketchikan", topic: "adventure", date: "2027-07-15", _vercel_share: "private-token" };
const returnUrl = new URL(finderReturnHref(originalChoices), "https://example.invalid");
assert.equal(returnUrl.hash, "#find-your-port-day");
assert.deepEqual([...returnUrl.searchParams.keys()], ["port", "topic", "date"], "return links must allowlist form fields");
assert.deepEqual(readFinderChoices(Object.fromEntries(returnUrl.searchParams)), { port: "ketchikan", topic: "adventure", date: "2027-07-15" }, "editing a shortlist should restore the original finder values");
assert.deepEqual(readFinderChoices(), { port: "juneau", topic: "best-overall", date: "" });
assert.deepEqual(readFinderChoices({ port: ["SKAGWAY", "ketchikan"], topic: " fishing ", date: "2028-02-29" }), { port: "skagway", topic: "fishing", date: "2028-02-29" });
assert.deepEqual(readFinderChoices({ port: "unknown", topic: "unknown", date: "2027-02-29" }), { port: "juneau", topic: "best-overall", date: "" });
for (const date of ["2027-02-30", "2027-13-01", "2027-00-15", "2027-07-00", "07/15/2027", "<script>", ""]) {
  assert.equal(readFinderChoices({ date }).date, "", "invalid dates must not hydrate the native input");
}
assert.equal(new URL(finderReturnHref({ port: "skagway", topic: "easy-day" }), "https://example.invalid").searchParams.has("date"), false);
console.log("finder choice round-trip regression: PASS");
