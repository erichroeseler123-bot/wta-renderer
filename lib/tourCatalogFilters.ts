import type { HelicopterTour } from "@/lib/helicopterTours";

export type TourCatalogFilterState = {
  port: string;
  category: string;
};

export type TourFilterOption = {
  value: string;
  label: string;
  count: number;
};

export const PORT_FILTER_DEFINITIONS: ReadonlyArray<{ value: string; label: string }> = [
  { value: "all", label: "All Ports" },
  { value: "juneau", label: "Juneau" },
  { value: "skagway", label: "Skagway" },
  { value: "ketchikan", label: "Ketchikan" },
];

export const CATEGORY_FILTER_DEFINITIONS: ReadonlyArray<{ value: string; label: string }> = [
  { value: "all", label: "All Categories" },
  { value: "Air Tours", label: "Air Tours" },
  { value: "Whale Watching", label: "Whale Watching" },
  { value: "Hiking & Glaciers", label: "Hiking & Glaciers" },
  { value: "Dog Sledding", label: "Dog Sledding" },
  { value: "Fishing", label: "Fishing" },
  { value: "Adventures", label: "Adventures" },
];

function firstString(value?: string | string[] | null): string {
  if (Array.isArray(value)) return String(value[0] || "").trim();
  return String(value || "").trim();
}

export function normalizePortFilter(value?: string | string[] | null): string {
  const raw = firstString(value).toLowerCase();
  if (!raw || raw === "all" || raw === "all-ports" || raw === "all ports") {
    return "all";
  }
  return raw;
}

export function normalizeCategoryFilter(value?: string | string[] | null): string {
  const raw = firstString(value);
  const key = raw.toLowerCase().replace(/\s+/g, " ");
  const slug = key.replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  if (
    !slug ||
    slug === "all" ||
    slug === "all-categories" ||
    slug === "all-experiences" ||
    slug === "shore-excursion" ||
    slug === "shore-excursions"
  ) {
    return "all";
  }

  if (
    slug === "air-tours" ||
    slug === "air" ||
    slug === "flightseeing" ||
    slug === "helicopter" ||
    slug === "helicopter-tours" ||
    slug === "juneau-helicopter-tours"
  ) {
    return "Air Tours";
  }

  if (
    slug === "whale-watching" ||
    slug === "whales" ||
    slug === "whale" ||
    slug === "wildlife" ||
    slug === "wildlife-tours" ||
    slug === "wildlife-whales"
  ) {
    return "Whale Watching";
  }

  if (
    slug === "hiking-glaciers" ||
    slug === "hiking-and-glaciers" ||
    slug === "glacier-tours" ||
    slug === "glaciers" ||
    slug === "glacier" ||
    slug === "mendenhall-glacier"
  ) {
    return "Hiking & Glaciers";
  }

  if (slug === "dog-sledding" || slug === "dogsledding" || slug === "dog-sled") {
    return "Dog Sledding";
  }

  if (slug === "fishing" || slug === "fishing-charters") {
    return "Fishing";
  }

  if (
    slug === "adventures" ||
    slug === "adventure" ||
    slug === "adventure-tours" ||
    slug === "city-tour" ||
    slug === "city-tours" ||
    slug === "sightseeing"
  ) {
    return "Adventures";
  }

  return raw;
}

export function buildCatalogOutboundSearchParams(
  searchString: string,
  handoffCategory?: string | null,
): URLSearchParams {
  const params = new URLSearchParams(searchString);
  params.delete("port");
  params.delete("category");
  if (handoffCategory && handoffCategory.trim()) {
    params.set("category", handoffCategory.trim());
  }
  return params;
}

export function formatPortFilterLabel(port?: string | null): string {
  const normalized = normalizePortFilter(port);
  const match = PORT_FILTER_DEFINITIONS.find((item) => item.value === normalized);
  if (match) return match.label;
  return normalized.charAt(0).toUpperCase() + normalized.slice(1);
}

export function formatCategoryFilterLabel(category?: string | null): string {
  const normalized = normalizeCategoryFilter(category);
  const match = CATEGORY_FILTER_DEFINITIONS.find((item) => item.value === normalized);
  if (match) return match.label;
  return normalized;
}

export function isTourFilterActive(filters: {
  port?: string | string[] | null;
  category?: string | string[] | null;
}): boolean {
  return (
    normalizePortFilter(filters.port) !== "all" ||
    normalizeCategoryFilter(filters.category) !== "all"
  );
}

export function resetTourCatalogFilters(): TourCatalogFilterState {
  return {
    port: "all",
    category: "all",
  };
}

export function filterCatalogTours<
  T extends Pick<HelicopterTour, "port" | "category">,
>(
  tours: readonly T[],
  filters: {
    port?: string | string[] | null;
    category?: string | string[] | null;
  },
): T[] {
  const normalizedPort = normalizePortFilter(filters.port);
  const normalizedCategory = normalizeCategoryFilter(filters.category);

  return tours.filter((tour) => {
    if (normalizedPort !== "all") {
      const tourPort = normalizePortFilter(tour.port);
      if (tourPort !== normalizedPort) return false;
    }

    if (normalizedCategory !== "all") {
      const tourCategory = normalizeCategoryFilter(tour.category || "Adventures");
      if (tourCategory !== normalizedCategory) return false;
    }

    return true;
  });
}

export function buildTourFilterStatusMessage({
  filteredCount,
  totalCount,
  port,
  category,
}: {
  filteredCount: number;
  totalCount: number;
  port?: string | string[] | null;
  category?: string | string[] | null;
}): string {
  const normalizedPort = normalizePortFilter(port);
  const normalizedCategory = normalizeCategoryFilter(category);
  const portLabel = formatPortFilterLabel(normalizedPort);
  const categoryLabel = formatCategoryFilterLabel(normalizedCategory);
  const noun = filteredCount === 1 ? "tour" : "tours";

  if (!isTourFilterActive({ port: normalizedPort, category: normalizedCategory })) {
    return `Showing ${filteredCount} ${noun} (${totalCount} total) · All Ports · All Categories`;
  }

  if (filteredCount === 0) {
    return `Showing 0 tours of ${totalCount} matching ${portLabel} · ${categoryLabel}. Use Reset filters to view all ${totalCount} tours.`;
  }

  return `Showing ${filteredCount} ${noun} of ${totalCount} matching ${portLabel} · ${categoryLabel}`;
}

export function getPortFilterOptions(
  tours: ReadonlyArray<Pick<HelicopterTour, "port" | "category">>,
  activeCategory?: string | null,
): TourFilterOption[] {
  const normalizedCategory = normalizeCategoryFilter(activeCategory);
  const scopedTours =
    normalizedCategory === "all"
      ? tours
      : tours.filter(
          (tour) => normalizeCategoryFilter(tour.category || "Adventures") === normalizedCategory,
        );

  return PORT_FILTER_DEFINITIONS.map((definition) => ({
    value: definition.value,
    label: definition.label,
    count:
      definition.value === "all"
        ? scopedTours.length
        : scopedTours.filter((tour) => normalizePortFilter(tour.port) === definition.value).length,
  }));
}

export function getCategoryFilterOptions(
  tours: ReadonlyArray<Pick<HelicopterTour, "port" | "category">>,
  activePort?: string | null,
): TourFilterOption[] {
  const normalizedPort = normalizePortFilter(activePort);
  const scopedTours =
    normalizedPort === "all"
      ? tours
      : tours.filter((tour) => normalizePortFilter(tour.port) === normalizedPort);

  const knownValues = new Set(CATEGORY_FILTER_DEFINITIONS.map((item) => item.value));
  const extraCategories = Array.from(
    new Set(
      tours
        .map((tour) => normalizeCategoryFilter(tour.category || "Adventures"))
        .filter((category) => category !== "all" && !knownValues.has(category)),
    ),
  ).sort((a, b) => a.localeCompare(b));

  const allDefinitions = [
    ...CATEGORY_FILTER_DEFINITIONS,
    ...extraCategories.map((value) => ({ value, label: value })),
  ];

  return allDefinitions.map((definition) => ({
    value: definition.value,
    label: definition.label,
    count:
      definition.value === "all"
        ? scopedTours.length
        : scopedTours.filter(
            (tour) => normalizeCategoryFilter(tour.category || "Adventures") === definition.value,
          ).length,
  }));
}
