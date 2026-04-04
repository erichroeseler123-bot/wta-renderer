import { NextResponse } from "next/server";
import { getFareHarborNextAvailability } from "@/lib/fareharborAvailability";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const company = url.searchParams.get("company") || "";
    const itemPk = ((url.searchParams.get("item") ?? url.searchParams.get("itemPk")) || "").trim();

    if (!company || !itemPk) {
      return NextResponse.json(
        { startAt: null, error: "Missing company or item (or itemPk)" },
        { status: 400 }
      );
    }

    const startAt = await getFareHarborNextAvailability(company, itemPk);
    return NextResponse.json({ startAt }, { status: 200 });
  } catch (e: any) {
    return NextResponse.json(
      { startAt: null, error: "next-availability failed", detail: String(e?.message || e) },
      { status: 200 }
    );
  }
}
