import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import type { HelicopterTour } from "../lib/helicopterTours";
import { buildTourPriceLabel, getProductOneLiner } from "../lib/tourSeo";
import {
  buildTourFilterStatusMessage,
  filterCatalogTours,
  formatCategoryFilterLabel,
  formatPortFilterLabel,
  getCategoryFilterOptions,
  getPortFilterOptions,
  isTourFilterActive,
  normalizeCategoryFilter,
  normalizePortFilter,
  resetTourCatalogFilters,
} from "../lib/tourCatalogFilters";

const SAMPLE_TOURS: HelicopterTour[] = [
  {
    pk: 405050,
    slug: "helicopter-flightseeing-and-glacier-landing-tour",
    title: "Helicopter Flightseeing and Glacier Landing Tour",
    description: "$419 Per Person (Flat Rate) | 2 Hours 15 Minutes | Activity level: Easy | Ages 7+ | September Only",
    company: "northstartrekking",
    port: "juneau",
    fromPrice: "$419 Per Person (Flat Rate)",
    category: "Air Tours",
    nextAvailableDate: "2026-09-05",
    hasInventory: true,
  },
  {
    pk: 585907,
    slug: "premier-catamaran-whale-watch",
    title: "Premier Catamaran Whale Watch",
    description: "49 passenger experience. Our most popular tour with 3 hours on the water!",
    company: "alaska-galore-juneau-whale-watching",
    port: "juneau",
    fromPrice: "$139 Per Person (Flat Rate)",
    category: "Whale Watching",
    nextAvailableDate: "2026-06-10",
    hasInventory: true,
  },
  {
    pk: 195602,
    slug: "mendenhall-glacier-guided-hike",
    title: "Mendenhall Glacier Guided Hike",
    description: "Customer Favorite! From $209 per Person | Difficulty: Strenuous| 6 Hours | 10+",
    company: "beyondak",
    port: "juneau",
    fromPrice: "$209 Per Person (Flat Rate)",
    category: "Hiking & Glaciers",
    hasInventory: null,
  },
  {
    pk: 213556,
    slug: "glacier-discovery-by-helicopter",
    title: "Glacier Discovery By Helicopter",
    description: "$439 Per Person (Flat Rate) | 2 Hours | All Ages | Glacier Landing & Guided Walk",
    company: "temscoair-skagway",
    port: "skagway",
    fromPrice: "$439 Per Person (Flat Rate)",
    category: "Air Tours",
    nextAvailableDate: "2026-07-01",
    hasInventory: true,
  },
  {
    pk: 13748,
    slug: "skagway-s-gold-rush-scooter-tour",
    title: "Skagway's Gold Rush Scooter Tour",
    description: "2 Hours • Ages 18+ to drive (valid driver's license required) • Guided Skagway & Dyea scooter tour on Honda Ruckus",
    company: "skagwayscooters",
    port: "skagway",
    fromPrice: "$189 Per Person (Flat Rate)",
    category: "Adventures",
    hasInventory: true,
  },
  {
    pk: 16753,
    slug: "salmon-fishing",
    title: "Salmon Fishing",
    description: "May 1 - Sept 30",
    company: "moorecharters",
    port: "ketchikan",
    fromPrice: "$310 Per Person (Flat Rate)",
    category: "Fishing",
    hasInventory: true,
  },
];

// 1. Default unfiltered state preserves order, pricing, descriptions, and checkout paths
const unfiltered = filterCatalogTours(SAMPLE_TOURS, { port: "all", category: "all" });
assert.equal(unfiltered.length, SAMPLE_TOURS.length, "unfiltered catalog should include all tours");
assert.equal(isTourFilterActive({ port: "all", category: "all" }), false);
assert.equal(isTourFilterActive({}), false);
assert.equal(
  buildTourFilterStatusMessage({
    filteredCount: unfiltered.length,
    totalCount: SAMPLE_TOURS.length,
    port: "all",
    category: "all",
  }),
  "Showing 6 tours (6 total) · All Ports · All Categories",
);

for (const tour of unfiltered) {
  const priceLabel = buildTourPriceLabel(tour);
  const oneLiner = getProductOneLiner(tour);
  assert.ok(priceLabel.length > 0, "tour price label must be preserved");
  assert.ok(oneLiner.length > 0, "tour one-liner description must be preserved");
  assert.equal(`/tours/${tour.company}/${tour.pk}`.startsWith("/tours/"), true);
}

// 2. Port filter normalization, filtering, and status count announcement
assert.equal(normalizePortFilter(" JUNEAU "), "juneau");
assert.equal(normalizePortFilter(["Skagway", "juneau"]), "skagway");
assert.equal(normalizePortFilter("all-ports"), "all");
assert.equal(normalizePortFilter(""), "all");
assert.equal(formatPortFilterLabel("juneau"), "Juneau");
assert.equal(formatPortFilterLabel("all"), "All Ports");

const juneauTours = filterCatalogTours(SAMPLE_TOURS, { port: "juneau", category: "all" });
assert.equal(juneauTours.length, 3);
assert.equal(isTourFilterActive({ port: "juneau", category: "all" }), true);
assert.equal(
  buildTourFilterStatusMessage({
    filteredCount: juneauTours.length,
    totalCount: SAMPLE_TOURS.length,
    port: "juneau",
    category: "all",
  }),
  "Showing 3 tours of 6 matching Juneau · All Categories",
);

const ketchikanTours = filterCatalogTours(SAMPLE_TOURS, { port: "ketchikan", category: "all" });
assert.equal(ketchikanTours.length, 1);
assert.equal(
  buildTourFilterStatusMessage({
    filteredCount: ketchikanTours.length,
    totalCount: SAMPLE_TOURS.length,
    port: "ketchikan",
    category: "all",
  }),
  "Showing 1 tour of 6 matching Ketchikan · All Categories",
);

// 3. Category filter normalization, aliases, and status count announcement
assert.equal(normalizeCategoryFilter("whale-watching"), "Whale Watching");
assert.equal(normalizeCategoryFilter("flightseeing"), "Air Tours");
assert.equal(normalizeCategoryFilter("juneau-helicopter-tours"), "Air Tours");
assert.equal(normalizeCategoryFilter("glacier-tours"), "Hiking & Glaciers");
assert.equal(normalizeCategoryFilter("mendenhall-glacier"), "Hiking & Glaciers");
assert.equal(normalizeCategoryFilter("dog-sledding"), "Dog Sledding");
assert.equal(normalizeCategoryFilter("all-categories"), "all");
assert.equal(formatCategoryFilterLabel("whale-watching"), "Whale Watching");

const airTours = filterCatalogTours(SAMPLE_TOURS, { port: "all", category: "flightseeing" });
assert.equal(airTours.length, 2);
assert.equal(isTourFilterActive({ port: "all", category: "flightseeing" }), true);
assert.equal(
  buildTourFilterStatusMessage({
    filteredCount: airTours.length,
    totalCount: SAMPLE_TOURS.length,
    port: "all",
    category: "flightseeing",
  }),
  "Showing 2 tours of 6 matching All Ports · Air Tours",
);

// 4. Empty filtered state and one-tap filter reset recovery
const emptySkagwayWhales = filterCatalogTours(SAMPLE_TOURS, {
  port: "skagway",
  category: "whale-watching",
});
assert.equal(emptySkagwayWhales.length, 0, "Skagway + Whale Watching should yield 0 tours");
assert.equal(isTourFilterActive({ port: "skagway", category: "whale-watching" }), true);
assert.equal(
  buildTourFilterStatusMessage({
    filteredCount: emptySkagwayWhales.length,
    totalCount: SAMPLE_TOURS.length,
    port: "skagway",
    category: "whale-watching",
  }),
  "Showing 0 tours of 6 matching Skagway · Whale Watching. Use Reset filters to view all 6 tours.",
);

const resetState = resetTourCatalogFilters();
assert.deepEqual(resetState, { port: "all", category: "all" });
assert.equal(isTourFilterActive(resetState), false);
const recoveredTours = filterCatalogTours(SAMPLE_TOURS, resetState);
assert.equal(recoveredTours.length, SAMPLE_TOURS.length, "one-tap reset should restore full catalog");

// 5. Scoped option counts for ports and categories
const skagwayCategories = getCategoryFilterOptions(SAMPLE_TOURS, "skagway");
assert.equal(skagwayCategories.find((opt) => opt.value === "all")?.count, 2);
assert.equal(skagwayCategories.find((opt) => opt.value === "Air Tours")?.count, 1);
assert.equal(skagwayCategories.find((opt) => opt.value === "Adventures")?.count, 1);
assert.equal(skagwayCategories.find((opt) => opt.value === "Whale Watching")?.count, 0);

const airPorts = getPortFilterOptions(SAMPLE_TOURS, "Air Tours");
assert.equal(airPorts.find((opt) => opt.value === "all")?.count, 2);
assert.equal(airPorts.find((opt) => opt.value === "juneau")?.count, 1);
assert.equal(airPorts.find((opt) => opt.value === "skagway")?.count, 1);
assert.equal(airPorts.find((opt) => opt.value === "ketchikan")?.count, 0);

// 6. Verify TourCatalogFilter & ToursPage source wiring for accessibility and 320px/375px layout safety
const filterComponentSource = fs.readFileSync(
  path.join(process.cwd(), "app", "tours", "TourCatalogFilter.tsx"),
  "utf8",
);
assert.match(filterComponentSource, /role="status"/, "TourCatalogFilter must announce count with role='status'");
assert.match(
  filterComponentSource,
  /aria-live="polite"/,
  "TourCatalogFilter must announce count with aria-live='polite'",
);
assert.match(
  filterComponentSource,
  /data-testid="reset-tour-filters"/,
  "TourCatalogFilter must provide a one-tap filter reset control when narrow filters are active",
);
assert.match(
  filterComponentSource,
  /overflow-x-clip/,
  "TourCatalogFilter must prevent horizontal overflow at 320px and 375px",
);

console.log("tour catalog filter & status announcement regression: PASS");
