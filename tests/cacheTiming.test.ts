import { test } from "node:test";
import assert from "node:assert";
import { getPredictiveCacheTTL } from "../lib/cache-timing";

test("getPredictiveCacheTTL returns expected TTL values based on proximity", () => {
  const now = new Date();
  
  // Format helper to add days
  const addDays = (days: number) => {
    const d = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
    return d.toISOString().split("T")[0];
  };

  // 1. Imminent departures (within 48 hours: tomorrow t=1, 2 days out t=2)
  const ttlTomorrow = getPredictiveCacheTTL(addDays(1));
  const ttlTwoDays = getPredictiveCacheTTL(addDays(2));
  assert.strictEqual(ttlTomorrow, 120);
  assert.strictEqual(ttlTwoDays, 120);

  // 2. Medium proximity (t=5)
  const ttlIn5Days = getPredictiveCacheTTL(addDays(5));
  // TTL(5) = 21600 - 21480 * e^(-0.75) = ~11459
  assert.ok(ttlIn5Days > 120);
  assert.ok(ttlIn5Days < 20000);

  // 3. Far-out departure (t=30)
  const ttlIn30Days = getPredictiveCacheTTL(addDays(30));
  // TTL(30) = 21600 - 21480 * e^(-4.5) = ~21360
  assert.ok(ttlIn30Days > ttlIn5Days);
  assert.ok(ttlIn30Days <= 21600);
  assert.ok(ttlIn30Days > 21000);

  // 4. Past departure fallback
  const ttlPast = getPredictiveCacheTTL("2020-01-01");
  assert.strictEqual(ttlPast, 60);
});
