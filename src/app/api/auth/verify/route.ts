// GET /api/auth/verify?token=… — redeem a magic link for a session cookie.

import { NextResponse, type NextRequest } from "next/server";
import {
  SESSION_COOKIE,
  SESSION_MAX_AGE_SECONDS,
  createSessionToken,
  isConfigured,
  verifyLoginToken,
} from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  if (!isConfigured()) {
    return new NextResponse("Sign-in is not configured.", {
      status: 503,
      headers: { "Cache-Control": "no-store" },
    });
  }

  const token = request.nextUrl.searchParams.get("token") ?? undefined;
  const email = await verifyLoginToken(token);

  if (!email) {
    const back = new URL("/forever-families", request.url);
    back.searchParams.set("error", "expired");
    return NextResponse.redirect(back);
  }

  const response = NextResponse.redirect(new URL("/forever-families", request.url));
  response.cookies.set({
    name: SESSION_COOKIE,
    value: await createSessionToken(email),
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  });
  response.headers.set("Cache-Control", "no-store");
  return response;
}
