import { NextResponse } from "next/server";

function splitCompanies(v: string) {
  return v
    .split(/[,\s]+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

export async function GET() {
  const v =
    process.env.FAREHARBOR_COMPANY_SHORTNAME ??
    process.env.FAREHARBOR_COMPANY ??
    "";

  const companies = splitCompanies(v);

  return NextResponse.json({
    ok: true,
    count: companies.length,
    companies,
  });
}
