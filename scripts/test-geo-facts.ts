import assert from "node:assert/strict";
import { ALASKA_GEO_FACTS, getAlaskaGeoFact } from "../lib/alaskaGeoFacts";

console.log("Running Alaska GEO facts verification tests...\n");

const EXPECTED_KEYS = [
  "juneau-whale-watching",
  "juneau-mendenhall-glacier-tours",
  "juneau-helicopter-tours",
  "juneau-dog-sledding",
  "juneau-fishing",
  "juneau-gold-panning",
  "juneau-glacier-tours",
  "juneau-easy-shore-excursions",
  "juneau-private-tours",
  "ketchikan-misty-fjords",
  "ketchikan-bear-tours",
  "ketchikan-kayaking",
  "ketchikan-adventure-tours",
  "ketchikan-wildlife-tours",
  "ketchikan-easy-shore-excursions",
  "ketchikan-private-tours",
  "skagway-helicopter-tours",
  "skagway-gold-rush-tours",
  "skagway-dog-sledding",
  "skagway-adventure-tours",
  "skagway-easy-shore-excursions",
  "skagway-private-tours",
  "best-shore-excursions-in-juneau",
  "how-to-get-to-mendenhall-glacier-from-cruise-port",
  "best-things-to-do-in-skagway-4-6-hours",
  "first-time-in-ketchikan-shore-excursions",
  "how-much-do-alaska-shore-excursions-cost",
  "what-happens-if-my-alaska-tour-runs-late",
  "easy-alaska-shore-excursions",
  "private-premium-alaska-shore-excursions",
  "port-juneau",
  "port-ketchikan",
  "port-skagway",
  "cruise-ship-vs-independent",
];

for (const key of EXPECTED_KEYS) {
  const fact = ALASKA_GEO_FACTS[key];
  assert.ok(fact, `Missing key: ${key}`);
  assert.ok(fact.directQuestion.endsWith("?"), `Question for ${key} must end with '?'`);
  assert.ok(fact.directAnswer.length >= 60, `Answer for ${key} too short for direct snippet extraction`);
  assert.ok(fact.pricingValue.length > 0, `Missing pricingValue for ${key}`);
  assert.ok(fact.durationValue.length > 0, `Missing durationValue for ${key}`);
  assert.ok(fact.meetingPointValue.length > 0, `Missing meetingPointValue for ${key}`);
  assert.ok(fact.safetyBufferValue.length > 0, `Missing safetyBufferValue for ${key}`);
}

// Verify lookup function
assert.equal(getAlaskaGeoFact("juneau", "whale-watching")?.id, "juneau-whale-watching");
assert.equal(getAlaskaGeoFact("ketchikan", "misty-fjords")?.id, "ketchikan-misty-fjords");
assert.equal(getAlaskaGeoFact("skagway", "helicopter-tours")?.id, "skagway-helicopter-tours");
assert.equal(getAlaskaGeoFact("juneau")?.id, "port-juneau");
assert.equal(getAlaskaGeoFact("skagway")?.id, "port-skagway");
assert.equal(getAlaskaGeoFact("ketchikan")?.id, "port-ketchikan");
assert.equal(getAlaskaGeoFact("unknown"), null);

console.log(`✅ All ${EXPECTED_KEYS.length} GEO fact entries verified successfully.`);
console.log("✅ getAlaskaGeoFact resolution verified.");
