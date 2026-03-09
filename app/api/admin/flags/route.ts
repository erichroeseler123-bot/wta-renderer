import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { requireAdmin } from "../_lib/auth";

const FLAGS_PATH = path.join(process.cwd(), ".admin-flags.json");

function readLocalFlags(): { bookingsEnabled?: number } {
  try {
    const raw = fs.readFileSync(FLAGS_PATH, "utf8");
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

function writeLocalFlags(next: { bookingsEnabled?: number }) {
  fs.writeFileSync(FLAGS_PATH, JSON.stringify(next, null, 2));
}

export async function GET() {
  const a = await requireAdmin();
  if (!a.ok) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 403 });
  }

  const master = String(process.env.FH_BOOKINGS_ENABLED || "0") === "1" ? 1 : 0;
  const isProd = process.env.NODE_ENV === "production";
  const envOwner = String(process.env.OWNER_BOOKINGS_ENABLED || "0") === "1" ? 1 : 0;
  const fileOwner = readLocalFlags().bookingsEnabled ? 1 : 0;
  const owner = isProd ? envOwner : fileOwner;

  return NextResponse.json({
    success: true,
    bookingsEnabled: owner,
    masterEnabled: master,
    mode: isProd ? "prod_env" : "dev_file",
  });
}

export async function POST(req: Request) {
  const a = await requireAdmin();
  if (!a.ok) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 403 });
  }

  const body = await req.json().catch(() => ({}));
  const desired = body?.bookingsEnabled === true ? 1 : 0;

  const isProd = process.env.NODE_ENV === "production";
  if (isProd) {
    return NextResponse.json(
      {
        success: false,
        error: "Prod toggle requires persistent storage (Redis/DB) or flipping OWNER_BOOKINGS_ENABLED in Vercel env.",
      },
      { status: 409 },
    );
  }

  writeLocalFlags({ bookingsEnabled: desired });
  return NextResponse.json({ success: true, bookingsEnabled: desired });
}
