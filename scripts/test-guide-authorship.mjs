import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const guides = [
  'alaska-nature-by-cruise-port',
  'best-alaska-cruise-ports-for-bird-watching',
  'best-shore-excursions-in-juneau',
  'best-things-to-do-in-skagway-4-6-hours',
  'cruise-ship-vs-independent-alaska-excursions',
  'easy-alaska-shore-excursions',
  'first-time-in-ketchikan-shore-excursions',
  'how-much-do-alaska-shore-excursions-cost',
  'how-to-get-to-mendenhall-glacier-from-cruise-port',
  'juneau-private-whale-watching-charters',
  'juneau-whale-watching-vs-mendenhall',
  'private-premium-alaska-shore-excursions',
  'what-happens-if-my-alaska-tour-runs-late',
];

for (const slug of guides) {
  test(`${slug}: company Article author agrees with visible attribution`, () => {
    const source = readFileSync(new URL(`../app/guides/${slug}/page.tsx`, import.meta.url), 'utf8');
    const article = source.match(/const articleSchema = \{([\s\S]*?)\n  \};/)?.[1];
    assert.ok(article, 'existing Article schema must remain present');
    assert.match(article, /"@type": "Article"/);
    assert.match(article, /author: \{ "@type": "Organization", name: "Welcome to Alaska Tours", url: "https:\/\/www\.welcometoalaskatours\.com" \}/);
    assert.equal((article.match(/\bauthor:/g) || []).length, 1);
    assert.match(article, /publisher:\s*\{/);
    assert.match(article, /datePublished: "\d{4}-\d{2}-\d{2}"/);
    assert.match(article, /dateModified: "\d{4}-\d{2}-\d{2}"/);
    assert.doesNotMatch(article, /author:\s*\{[^}]*"Person"/);
    const layout = readFileSync(new URL('../app/guides/layout.tsx', import.meta.url), 'utf8');
    assert.match(layout, /Published by Welcome to Alaska Tours/);
  });
}
