// Gate for the internal pages.
//
// /forever-families lists real owners' names, emails, and phone numbers, and
// the rest of the site is public — so the route needs its own gate. Access is
// passwordless: an allowlisted address receives a magic link by email, and
// clicking it sets the signed session cookie this checks for. See src/lib/auth.ts.
//
// DIVISION OF LABOUR, since there are two gates and that is worth being explicit
// about:
//
//   • The bare /forever-families path is handled by the page itself, which
//     renders the sign-in form in place of the roster. Middleware only sets
//     no-store/noindex headers on it — it must NOT redirect, or the form would
//     never be reachable.
//   • Any deeper /forever-families/* path has no such form, so middleware turns
//     an unauthenticated request away here.
//
// Both paths ultimately call the same verifySessionToken(), so there is one
// definition of "signed in" rather than two that can drift apart.

import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/auth";

const ROOT = "/forever-families";

const noStore = {
  "Cache-Control": "no-store",
  "X-Robots-Tag": "noindex, nofollow",
};

function withNoStore(response: NextResponse): NextResponse {
  for (const [k, v] of Object.entries(noStore)) response.headers.set(k, v);
  return response;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isProtected = pathname === ROOT || pathname.startsWith(`${ROOT}/`);
  if (!isProtected) return NextResponse.next();

  // The page renders its own sign-in form; let it decide what to show.
  if (pathname === ROOT) return withNoStore(NextResponse.next());

  const email = await verifySessionToken(request.cookies.get(SESSION_COOKIE)?.value);
  if (!email) {
    const redirect = NextResponse.redirect(new URL(ROOT, request.url));
    // Clear a cookie that failed to verify (expired, or signed with an old
    // secret) so the browser stops re-sending it on every request.
    if (request.cookies.has(SESSION_COOKIE)) redirect.cookies.delete(SESSION_COOKIE);
    return withNoStore(redirect);
  }

  return withNoStore(NextResponse.next());
}

// Both forms listed explicitly: `:path*` matching the bare path is a detail
// worth not depending on. The runtime check above is the real gate anyway.
export const config = {
  matcher: ["/forever-families", "/forever-families/:path*"],
};
