export const WTA_SITE_CANONICAL_DOMAIN = "welcometoalaskatours.com" as const;
export const WTA_PARTNER_ID = "welcome-to-alaska" as const;
export const DEFAULT_DCC_BASE_URL = "https://www.destinationcommandcenter.com" as const;

export interface WtaDccReferralRequestInput {
  sourcePagePath?: string;
  fareharborShortname?: string;
  fareharborItemId?: string;
  productCode?: string;
  productTitle?: string;
  productDestinationUrl?: string;
  campaign?: string;
  intendedDate?: string;
  partySize?: number;
  quotedPriceAmount?: number;
  /** Preview-only override for targeting a specific DCC preview deployment URL */
  dccBaseUrlOverride?: string;
}

export function resolveWtaDccAffiliateConfig(options?: {
  dccBaseUrlOverride?: string;
}) {
  const vercelEnv = (process.env.VERCEL_ENV ?? "").trim();
  const nodeEnv = (process.env.NODE_ENV ?? "development").trim();
  const isProduction =
    vercelEnv === "production" ||
    (nodeEnv === "production" && vercelEnv !== "preview");

  const configuredBaseUrl = (
    process.env.DCC_API_BASE_URL || DEFAULT_DCC_BASE_URL
  )
    .trim()
    .replace(/\/+$/, "");

  const dccBaseUrl =
    !isProduction && options?.dccBaseUrlOverride?.trim()
      ? options.dccBaseUrlOverride.trim().replace(/\/+$/, "")
      : configuredBaseUrl;

  const liveKey = (process.env.DCC_WTA_AFFILIATE_LIVE_API_KEY ?? "").trim();
  const previewKey = (
    process.env.DCC_WTA_AFFILIATE_PREVIEW_API_KEY ?? ""
  ).trim();

  const apiKey = isProduction ? liveKey : previewKey || liveKey;
  const credentialTier = isProduction
    ? "live"
    : previewKey
      ? "preview"
      : liveKey
        ? "live"
        : "missing";

  return {
    isProduction,
    environment: isProduction
      ? "production"
      : vercelEnv === "preview"
        ? "preview"
        : nodeEnv,
    dccBaseUrl,
    hasConfiguredCredential: apiKey.length >= 24,
    credentialTier,
    apiKey,
  };
}

export async function createWtaTaggedReferralOnDcc(
  input?: WtaDccReferralRequestInput,
) {
  const config = resolveWtaDccAffiliateConfig({
    dccBaseUrlOverride: input?.dccBaseUrlOverride,
  });

  if (!config.hasConfiguredCredential) {
    return {
      ok: false as const,
      status: 503,
      site: WTA_SITE_CANONICAL_DOMAIN,
      partnerId: WTA_PARTNER_ID,
      environment: config.environment,
      credentialTier: config.credentialTier,
      dccBaseUrl: config.dccBaseUrl,
      error: {
        code: "WTA_DCC_CREDENTIAL_NOT_CONFIGURED",
        message: config.isProduction
          ? "DCC_WTA_AFFILIATE_LIVE_API_KEY is not configured on welcometoalaskatours.com."
          : "DCC_WTA_AFFILIATE_PREVIEW_API_KEY is not configured on wta-ui preview.",
      },
    };
  }

  const partySize =
    typeof input?.partySize === "number" && input.partySize > 0
      ? Math.round(input.partySize)
      : 2;
  const intendedDate = input?.intendedDate?.trim() || "2026-07-15";
  const fareharborShortname =
    input?.fareharborShortname?.trim() || "coastalhelicopters";
  const fareharborItemId = input?.fareharborItemId?.trim() || "413056";
  const productCode =
    input?.productCode?.trim() || "coastal-helicopters-icefield-excursion";
  const productTitle =
    input?.productTitle?.trim() ||
    "Icefield Excursion (Coastal Helicopters • Item 413056)";
  const quotedPriceAmount =
    typeof input?.quotedPriceAmount === "number" && input.quotedPriceAmount > 0
      ? input.quotedPriceAmount
      : partySize * 459;

  const endpoint = `${config.dccBaseUrl}/api/v1/commerce/affiliates/wta`;
  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${config.apiKey}`,
      "X-DCC-API-Key": config.apiKey,
      "X-WTA-Origin-Site": WTA_SITE_CANONICAL_DOMAIN,
    },
    body: JSON.stringify({
      action: "create_referral",
      originatingSite: WTA_SITE_CANONICAL_DOMAIN,
      sourcePagePath:
        input?.sourcePagePath?.trim() || "/ports/juneau/helicopter-tours",
      targetSite: "juneauflightdeck.com",
      fareharborShortname,
      fareharborItemId,
      productCode,
      productTitle,
      productDestinationUrl:
        input?.productDestinationUrl?.trim() ||
        `https://juneauflightdeck.com/helicopter?port=juneau-ak&operator=coastal-helicopters&item=${encodeURIComponent(fareharborItemId)}&date=${encodeURIComponent(intendedDate)}&partySize=${partySize}`,
      campaign:
        input?.campaign?.trim() || "wta-juneau-coastal-icefield-413056",
      intendedDate,
      partySize,
      quotedPriceAmount,
      quotedPriceCurrency: "USD",
      metadata: {
        wtaOriginSite: WTA_SITE_CANONICAL_DOMAIN,
        wtaCredentialTier: config.credentialTier,
        wtaEnvironment: config.environment,
      },
    }),
    cache: "no-store",
  });

  const payload = (await response.json().catch(() => ({}))) as Record<
    string,
    unknown
  >;

  return {
    ok: response.ok && Boolean(payload.ok),
    status: response.status,
    site: WTA_SITE_CANONICAL_DOMAIN,
    partnerId: WTA_PARTNER_ID,
    environment: config.environment,
    credentialTier: config.credentialTier,
    dccBaseUrl: config.dccBaseUrl,
    dccResponse: payload,
  };
}
