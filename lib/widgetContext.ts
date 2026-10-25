export type WidgetInitContext = {
  handoffId?: string;
  dccReturnUrl?: string;
  source?: string;
  sourceSlug?: string;
  sourcePage?: string;
  topicSlug?: string;
  portSlug?: string;
  productSlug?: string;
  eventDate?: string;
  embedDomain?: string;
  embedPath?: string;
  widgetPlacement?: string;
  widgetId?: string;
};

type WidgetEmbedContext = Pick<WidgetInitContext, "embedDomain" | "embedPath">;

type SearchLike =
  | URLSearchParams
  | Record<string, string | string[] | undefined>
  | Iterable<[string, string]>;

function cleanString(value: unknown) {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return trimmed || undefined;
}

function firstValue(input: SearchLike, key: string) {
  if (input instanceof URLSearchParams) {
    return cleanString(input.get(key) || undefined);
  }

  if (Symbol.iterator in Object(input)) {
    for (const [entryKey, entryValue] of input as Iterable<[string, string]>) {
      if (entryKey === key) return cleanString(entryValue);
    }
    return undefined;
  }

  const value = (input as Record<string, string | string[] | undefined>)[key];
  if (Array.isArray(value)) return cleanString(value[0]);
  return cleanString(value);
}

function readAny(input: SearchLike, keys: string[]) {
  for (const key of keys) {
    const value = firstValue(input, key);
    if (value) return value;
  }
  return undefined;
}

export function sanitizeEmbedDomain(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  if (!trimmed) return undefined;

  let candidate = trimmed;
  if (/^[a-z][a-z0-9+.-]*:\/\//i.test(candidate)) {
    try {
      const parsed = new URL(candidate);
      candidate = parsed.host || parsed.hostname;
    } catch {
      return undefined;
    }
  } else {
    candidate = candidate.split(/[/?#]/)[0] || "";
  }

  const normalized = candidate.trim().toLowerCase();
  if (!normalized || normalized.length > 128) return undefined;
  if (!/^[a-z0-9.-]+(?::\d{1,5})?$/.test(normalized)) return undefined;
  if (normalized.startsWith(".") || normalized.endsWith(".") || normalized.includes("..")) {
    return undefined;
  }
  return normalized;
}

function sanitizeEmbedPath(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  // Strip any query string or hash fragment so sensitive query params are never retained
  const withoutQuery = trimmed.split(/[?#]/)[0]?.trim() || "";
  if (!withoutQuery || !withoutQuery.startsWith("/")) return undefined;
  return withoutQuery.slice(0, 160);
}

export function parseWidgetInitContext(input: SearchLike): WidgetInitContext {
  return {
    handoffId: readAny(input, ["handoffId", "handoff_id", "dcc_handoff_id"]),
    dccReturnUrl: readAny(input, ["dcc_return", "dccReturn", "dccReturnUrl"]),
    source: readAny(input, ["source"]),
    sourceSlug: readAny(input, ["sourceSlug", "source_slug"]),
    sourcePage: readAny(input, ["sourcePage", "source_page", "referrerPath", "referrer_path"]),
    topicSlug: readAny(input, ["topicSlug", "topic", "authority_topic"]),
    portSlug: readAny(input, ["portSlug", "port_slug"]),
    productSlug: readAny(input, ["productSlug", "product_slug"]),
    eventDate: readAny(input, ["eventDate", "event_date", "date"]),
    embedDomain: sanitizeEmbedDomain(readAny(input, ["embedDomain", "embed_domain"])),
    embedPath: sanitizeEmbedPath(readAny(input, ["embedPath", "embed_path"])),
    widgetPlacement: readAny(input, ["widgetPlacement", "widget_placement", "placement"]),
    widgetId: readAny(input, ["widgetId", "widget_id"]),
  };
}

export function inferEmbedContextFromLocation(locationLike?: {
  hostname?: string;
  pathname?: string;
}): WidgetEmbedContext {
  return {
    embedDomain: sanitizeEmbedDomain(locationLike?.hostname),
  };
}

export function inferEmbedContextFromWindow(): WidgetEmbedContext {
  if (typeof window === "undefined") return {};

  try {
    if (window.top?.location?.host || window.top?.location?.hostname) {
      return {
        embedDomain: sanitizeEmbedDomain(
          window.top.location.host || window.top.location.hostname,
        ),
      };
    }
  } catch {
    // Cross-origin top access is expected for iframe embeds; fall back to document.referrer origin/host only.
    try {
      if (typeof document !== "undefined" && document.referrer) {
        const refUrl = new URL(document.referrer);
        return {
          embedDomain: sanitizeEmbedDomain(refUrl.host || refUrl.hostname),
        };
      }
    } catch {
      // Ignore invalid referrer URLs.
    }
  }

  return {
    embedDomain: sanitizeEmbedDomain(window.location.host || window.location.hostname),
  };
}

export function resolveWidgetInitContext(input: SearchLike): WidgetInitContext {
  const parsed = parseWidgetInitContext(input);
  const inferred = inferEmbedContextFromWindow();

  return {
    ...parsed,
    embedDomain: parsed.embedDomain || inferred.embedDomain,
  };
}

export function appendWidgetContextToSearchParams(
  params: URLSearchParams,
  context: WidgetInitContext,
) {
  const fields: Array<[string, string | undefined]> = [
    ["handoffId", context.handoffId],
    ["dcc_return", context.dccReturnUrl],
    ["source", context.source],
    ["sourceSlug", context.sourceSlug],
    ["sourcePage", context.sourcePage],
    ["topicSlug", context.topicSlug],
    ["portSlug", context.portSlug],
    ["productSlug", context.productSlug],
    ["eventDate", context.eventDate],
    ["embedDomain", context.embedDomain],
    ["embedPath", context.embedPath],
    ["widgetPlacement", context.widgetPlacement],
    ["widgetId", context.widgetId],
  ];

  for (const [key, value] of fields) {
    if (value) params.set(key, value);
  }

  return params;
}
