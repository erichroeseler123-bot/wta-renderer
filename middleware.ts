import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

function flagEnabled() {
  const value = String(process.env.WTA_HOME_REDIRECT_TO_FLIGHTS || "").trim().toLowerCase();
  return value === "1" || value === "true" || value === "yes" || value === "on";
}

export function middleware(req: NextRequest) {
  if (!flagEnabled()) return NextResponse.next();
  if (req.nextUrl.pathname !== "/") return NextResponse.next();

  const url = req.nextUrl.clone();
  url.pathname = "/home";
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/"],
};
