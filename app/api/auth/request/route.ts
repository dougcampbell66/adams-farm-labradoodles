// POST /api/auth/request — email a magic link to an allowlisted address.
//
// Two properties this endpoint must keep:
//
//  1. It must not reveal who has access. Allowlisted and non-allowlisted
//     addresses get an identical "check your email" redirect.
//  2. It must not become a way to flood an inbox. Hence the rate limit —
//     applied BEFORE the allowlist check and keyed on the submitted address,
//     so being rate-limited says nothing about being allowlisted. Reversing
//     that order would leak the list through the difference between a 429
//     and a 303.

import { NextResponse, type NextRequest } from "next/server";
import { createLoginToken, isAllowed, isConfigured, normalizeEmail } from "@/lib/auth";
import { isMailerConfigured, remedy, sendMagicLink } from "@/lib/send-email";
import { EMAIL_RULES, IP_RULES, check, clientIp } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const gateUrl = (params: Record<string, string>) => {
    const url = new URL("/forever-families", request.url);
    for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
    return url;
  };

  // Uniform success response — identical for every address.
  const respond = () => NextResponse.redirect(gateUrl({ sent: "1" }), { status: 303 });

  if (!isConfigured()) {
    return new NextResponse("Sign-in is not configured.", {
      status: 503,
      headers: { "Cache-Control": "no-store" },
    });
  }

  const form = await request.formData();
  const email = normalizeEmail(String(form.get("email") ?? ""));

  if (!email) return respond();

  const limit = check([
    { key: `email:${email}`, rules: EMAIL_RULES },
    { key: `ip:${clientIp(request.headers)}`, rules: IP_RULES },
  ]);

  if (!limit.ok) {
    const response = NextResponse.redirect(
      gateUrl({ error: "rate", retry: String(limit.retryAfter) }),
      { status: 303 },
    );
    response.headers.set("Retry-After", String(limit.retryAfter));
    response.headers.set("Cache-Control", "no-store");
    return response;
  }

  if (!isAllowed(email)) return respond();

  const token = await createLoginToken(email);
  const link = new URL("/api/auth/verify", request.url);
  link.searchParams.set("token", token);

  // Local convenience: with no Hostinger credentials set, print the link to
  // the terminal so dev sign-in still works without wiring up email.
  if (!isMailerConfigured() && process.env.NODE_ENV !== "production") {
    console.log(`\n[auth] dev sign-in link for ${email}:\n${link.toString()}\n`);
    return respond();
  }

  const result = await sendMagicLink(email, link.toString());
  if (!result.ok) {
    console.error(
      `[auth] MAGIC LINK NOT SENT (${result.cause}): ${result.error}\n` +
        `[auth] fix: ${remedy(result.cause ?? "other")}`,
    );
  }

  return respond();
}
