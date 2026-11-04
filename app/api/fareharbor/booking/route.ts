import { NextRequest, NextResponse } from "next/server";
import {
  extractDccHandoffIdFromFareHarborRecord,
  getAuthorizedFareHarborBooking,
  getFareHarborCredentials,
} from "@/lib/fareharbor";
import { getOrder, saveOrder } from "@/lib/orders";
import { runFareHarborBookingsForOrder } from "@/lib/bookingRunner";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function verifyAuthorizedFareHarborHeaders(req: NextRequest) {
  const providedApp = (req.headers.get("x-fareharbor-api-app") || "").trim();
  const providedUser = (req.headers.get("x-fareharbor-api-user") || "").trim();
  const dccKey = (
    req.headers.get("x-dcc-api-key") ||
    req.headers.get("authorization") ||
    ""
  ).trim();

  const wtaPreviewKey = (process.env.DCC_WTA_AFFILIATE_PREVIEW_API_KEY || "").trim();
  const wtaLiveKey = (process.env.DCC_WTA_AFFILIATE_LIVE_API_KEY || "").trim();
  if (
    dccKey &&
    ((wtaPreviewKey && dccKey.includes(wtaPreviewKey)) ||
      (wtaLiveKey && dccKey.includes(wtaLiveKey)))
  ) {
    return {
      ok: false as const,
      status: 403,
      code: "WTA_REFERRAL_KEY_FORBIDDEN",
      message:
        "WTA referral credential cannot read or create authorized FareHarbor booking records.",
    };
  }

  const { appKey, userKey } = getFareHarborCredentials();
  if (!providedApp || !providedUser || providedApp !== appKey || providedUser !== userKey) {
    return {
      ok: false as const,
      status: 401,
      code: "FAREHARBOR_AUTH_REQUIRED",
      message:
        "Valid X-FareHarbor-API-App and X-FareHarbor-API-User headers are required.",
    };
  }

  return { ok: true as const };
}

export async function GET(req: NextRequest) {
  try {
    const auth = verifyAuthorizedFareHarborHeaders(req);
    if (!auth.ok) {
      return NextResponse.json(
        { ok: false, error: { code: auth.code, message: auth.message } },
        { status: auth.status },
      );
    }

    const { searchParams } = new URL(req.url);
    const company = (
      searchParams.get("company") ||
      searchParams.get("shortname") ||
      "coastalhelicopters"
    ).trim();
    const bookingUuid = (
      searchParams.get("uuid") ||
      searchParams.get("booking_uuid") ||
      searchParams.get("bookingUuid") ||
      ""
    ).trim();

    if (!bookingUuid) {
      return NextResponse.json(
        {
          ok: false,
          error: {
            code: "MISSING_BOOKING_UUID",
            message: "Query parameter uuid is required.",
          },
        },
        { status: 400 },
      );
    }

    const result = await getAuthorizedFareHarborBooking({ company, bookingUuid });
    const bookingObj = result.booking as Record<string, unknown>;
    const extractedDccHandoffId = extractDccHandoffIdFromFareHarborRecord(bookingObj);

    return NextResponse.json(
      {
        ok: true,
        source: result.source,
        company,
        booking: result.booking,
        extractedDccHandoffId,
      },
      { status: 200 },
    );
  } catch (error: unknown) {
    const status =
      error instanceof Error &&
      typeof (error as Error & { status?: number }).status === "number"
        ? (error as Error & { status: number }).status
        : 500;
    return NextResponse.json(
      {
        ok: false,
        error: {
          code: status === 404 ? "BOOKING_NOT_FOUND" : "FAREHARBOR_LOOKUP_FAILED",
          message: error instanceof Error ? error.message : String(error),
        },
      },
      { status },
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const vercelEnv = (process.env.VERCEL_ENV || "").trim();
    const isProduction = vercelEnv === "production";
    if (isProduction) {
      return NextResponse.json(
        {
          ok: false,
          error: {
            code: "PREVIEW_ONLY_ENDPOINT",
            message:
              "Direct order-to-FareHarbor validated booking execution is restricted to non-production while WTA terms are unsigned.",
          },
        },
        { status: 403 },
      );
    }

    const auth = verifyAuthorizedFareHarborHeaders(req);
    if (!auth.ok) {
      return NextResponse.json(
        { ok: false, error: { code: auth.code, message: auth.message } },
        { status: auth.status },
      );
    }

    const body = (await req.json().catch(() => ({}))) as {
      orderId?: string;
      order_id?: string;
      paymentIntentId?: string;
      payment_intent_id?: string;
      orderSnapshot?: Parameters<typeof saveOrder>[0];
      order_snapshot?: Parameters<typeof saveOrder>[0];
    };

    const orderId = String(body.orderId || body.order_id || "").trim();
    if (!orderId) {
      return NextResponse.json(
        {
          ok: false,
          error: { code: "MISSING_ORDER_ID", message: "orderId is required." },
        },
        { status: 400 },
      );
    }

    let order = await getOrder(orderId);
    if (!order && (body.orderSnapshot || body.order_snapshot)) {
      const providedSnapshot = (body.orderSnapshot || body.order_snapshot)!;
      if (providedSnapshot.order_id === orderId) {
        await saveOrder(providedSnapshot);
        order = providedSnapshot;
      }
    }
    if (!order) {
      return NextResponse.json(
        {
          ok: false,
          error: { code: "ORDER_NOT_FOUND", message: `Order ${orderId} not found.` },
        },
        { status: 404 },
      );
    }

    const paymentIntentId = String(
      body.paymentIntentId ||
        body.payment_intent_id ||
        order.payment_intent_id ||
        `pi_validated_${orderId}`,
    ).trim();

    const runResult = await runFareHarborBookingsForOrder(order, paymentIntentId, {
      useValidatedBookingWhenDisabled: true,
    });

    const updatedOrder = {
      ...order,
      status: runResult.allOk ? ("booked" as const) : ("booking_failed" as const),
      fareharbor: {
        results: runResult.results,
        bookedAt: runResult.allOk ? new Date().toISOString() : undefined,
        lastError: runResult.allOk ? undefined : "One or more bookings failed",
      },
    };
    await saveOrder(updatedOrder);

    const firstBookingResult = runResult.results[0] as
      | { rawBooking?: Record<string, unknown>; booking?: Record<string, unknown> }
      | undefined;
    const bookingRecord = firstBookingResult?.rawBooking || firstBookingResult?.booking || null;

    return NextResponse.json(
      {
        ok: runResult.allOk,
        orderId: order.order_id,
        paymentIntentId,
        handoffId: order.attribution?.handoffId ?? null,
        attribution: order.attribution ?? null,
        booking: bookingRecord,
        extractedDccHandoffId: extractDccHandoffIdFromFareHarborRecord(bookingRecord),
        results: runResult.results,
      },
      { status: runResult.allOk ? 200 : 409 },
    );
  } catch (error: unknown) {
    return NextResponse.json(
      {
        ok: false,
        error: {
          code: "FAREHARBOR_BOOKING_EXECUTION_FAILED",
          message: error instanceof Error ? error.message : String(error),
        },
      },
      { status: 500 },
    );
  }
}
