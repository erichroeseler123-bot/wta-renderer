import { NextRequest, NextResponse } from "next/server";
import { isAdminReq } from "@/lib/admin";
import { getKV } from "@/lib/kv";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  if (!isAdminReq(req)) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const kv = await getKV();
  if (!kv) {
    return NextResponse.json(
      { success: false, error: "KV not configured (need Redis/Upstash env vars)" },
      { status: 500 }
    );
  }

  await kv.del("stripe:connected_account");
  return NextResponse.json({ success: true });
}
