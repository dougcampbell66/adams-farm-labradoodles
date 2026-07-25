// POST /api/auth/logout — drop the session cookie. Useful on a shared device.

import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const response = NextResponse.redirect(new URL("/forever-families", request.url), {
    status: 303,
  });
  response.cookies.delete(SESSION_COOKIE);
  response.headers.set("Cache-Control", "no-store");
  return response;
}
