import { NextResponse } from "next/server";
import { getFareHarborCredentials } from "@/lib/fareharbor";

export async function GET() {
  let appKey = "";
  let userKey = "";
  let credentialsOk = true;

  try {
    const creds = getFareHarborCredentials();
    appKey = creds.appKey;
    userKey = creds.userKey;
  } catch {
    credentialsOk = false;
  }

  return NextResponse.json({
    ok: credentialsOk,
    hasFAREHARBOR_APP_KEY: !!process.env.FAREHARBOR_APP_KEY,
    hasFAREHARBOR_USER_KEY: !!process.env.FAREHARBOR_USER_KEY,
    hasFH_APP_NAME: !!process.env.FH_APP_NAME,
    hasFH_API_KEY: !!process.env.FH_API_KEY,
    hasFH_APP_KEY: !!process.env.FH_APP_KEY,
    hasFH_USER_KEY: !!process.env.FH_USER_KEY,
    hasFH_APP: !!process.env.FH_APP,
    hasFH_USER: !!process.env.FH_USER,
    hasFAREHARBOR_APP: !!process.env.FAREHARBOR_APP,
    hasFAREHARBOR_USER: !!process.env.FAREHARBOR_USER,
    effectiveAppKeyLen: appKey.length,
    effectiveUserKeyLen: userKey.length,
    nodeEnv: process.env.NODE_ENV,
    vercelEnv: process.env.VERCEL_ENV, // "production" | "preview" | "development"
  });
}
