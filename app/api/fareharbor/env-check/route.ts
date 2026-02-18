import { NextResponse } from "next/server";

export async function GET() {
  const appKey = process.env.FAREHARBOR_APP_KEY ?? process.env.FH_APP_NAME ?? "";
  const userKey = process.env.FAREHARBOR_USER_KEY ?? process.env.FH_API_KEY ?? "";

  return NextResponse.json({
    ok: true,
    hasFAREHARBOR_APP_KEY: !!process.env.FAREHARBOR_APP_KEY,
    hasFAREHARBOR_USER_KEY: !!process.env.FAREHARBOR_USER_KEY,
    hasFH_APP_NAME: !!process.env.FH_APP_NAME,
    hasFH_API_KEY: !!process.env.FH_API_KEY,
    effectiveAppKeyLen: appKey.length,
    effectiveUserKeyLen: userKey.length,
    nodeEnv: process.env.NODE_ENV,
    vercelEnv: process.env.VERCEL_ENV, // "production" | "preview" | "development"
  });
}
