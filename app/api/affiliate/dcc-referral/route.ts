import { NextResponse } from "next/server";
import {
  createWtaTaggedReferralOnDcc,
  resolveWtaDccAffiliateConfig,
  WTA_PARTNER_ID,
  WTA_SITE_CANONICAL_DOMAIN,
} from "@/lib/dccAffiliateReferral";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const dccBaseUrlOverride =
    url.searchParams.get("dccBaseUrl")?.trim() || undefined;
  const config = resolveWtaDccAffiliateConfig({ dccBaseUrlOverride });

  return NextResponse.json(
    {
      ok: true,
      site: WTA_SITE_CANONICAL_DOMAIN,
      partnerId: WTA_PARTNER_ID,
      environment: config.environment,
      isProduction: config.isProduction,
      credentialTier: config.credentialTier,
      hasConfiguredCredential: config.hasConfiguredCredential,
      dccBaseUrl: config.dccBaseUrl,
      defaultTour: {
        operator: "Coastal Helicopters",
        fareharborShortname: "coastalhelicopters",
        fareharborItemId: "413056",
        productCode: "coastal-helicopters-icefield-excursion",
        productTitle: "Icefield Excursion (Coastal Helicopters • Item 413056)",
        unitPriceUsd: 459,
      },
    },
    {
      status: 200,
      headers: {
        "Cache-Control": "no-store",
      },
    },
  );
}

export async function POST(request: Request) {
  let body: Record<string, unknown> = {};
  try {
    const raw = await request.text();
    if (raw.trim()) {
      body = JSON.parse(raw) as Record<string, unknown>;
    }
  } catch {
    return NextResponse.json(
      {
        ok: false,
        error: {
          code: "INVALID_JSON_BODY",
          message: "Request body must be valid JSON.",
        },
      },
      { status: 400, headers: { "Cache-Control": "no-store" } },
    );
  }

  const result = await createWtaTaggedReferralOnDcc({
    sourcePagePath:
      typeof body.sourcePagePath === "string" ? body.sourcePagePath : undefined,
    fareharborShortname:
      typeof body.fareharborShortname === "string"
        ? body.fareharborShortname
        : undefined,
    fareharborItemId:
      typeof body.fareharborItemId === "string"
        ? body.fareharborItemId
        : undefined,
    productCode:
      typeof body.productCode === "string" ? body.productCode : undefined,
    productTitle:
      typeof body.productTitle === "string" ? body.productTitle : undefined,
    productDestinationUrl:
      typeof body.productDestinationUrl === "string"
        ? body.productDestinationUrl
        : undefined,
    campaign: typeof body.campaign === "string" ? body.campaign : undefined,
    intendedDate:
      typeof body.intendedDate === "string" ? body.intendedDate : undefined,
    partySize: typeof body.partySize === "number" ? body.partySize : undefined,
    quotedPriceAmount:
      typeof body.quotedPriceAmount === "number"
        ? body.quotedPriceAmount
        : undefined,
    dccBaseUrlOverride:
      typeof body.dccBaseUrl === "string" ? body.dccBaseUrl : undefined,
  });

  return NextResponse.json(result, {
    status: result.status,
    headers: {
      "Cache-Control": "no-store",
    },
  });
}
