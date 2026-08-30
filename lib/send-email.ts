// Magic-link email, sent by the pawsq platform from this brand's
// @pawsq.com identity (2026-08-30; previously a Hostinger mailbox held by
// this site, and before that Resend). This site still mints and verifies
// the link, decides who may sign in, and owns the TTLs — only the send
// moved. The platform renders the same template this file used to carry.

import { LOGIN_TTL_MINUTES, SESSION_TTL_DAYS } from "@/lib/auth";
import { platformMagicLink, platformConfigured } from "@/lib/platform";

export type FailureCause = "unconfigured" | "auth" | "other";

interface SendResult {
  ok: boolean;
  cause?: FailureCause;
  error?: string;
}

/** Human-readable next step for each cause — printed to the server log. */
export function remedy(cause: FailureCause): string {
  switch (cause) {
    case "unconfigured":
      return "Set PAWSQ_PLATFORM_URL and PAWSQ_PLATFORM_KEY (the pawsq platform's origin and shared key).";
    case "auth":
      return "The platform's mailbox credentials were rejected — check SMTP_EMAIL / SMTP_PASSWORD on the pawsq-app deployment.";
    default:
      return "See the platform error above.";
  }
}

/** True when the platform client is configured — the auth route's dev-mode
 *  fallback (print the link to the terminal) keys off this. */
export function isMailerConfigured(): boolean {
  return platformConfigured();
}

export async function sendMagicLink(to: string, url: string): Promise<SendResult> {
  if (!platformConfigured()) {
    return {
      ok: false,
      cause: "unconfigured",
      error: "PAWSQ_PLATFORM_URL / PAWSQ_PLATFORM_KEY are not set",
    };
  }

  const result = await platformMagicLink({
    to,
    url,
    pageName: "the Forever Families page",
    ttlMinutes: LOGIN_TTL_MINUTES,
    sessionDays: SESSION_TTL_DAYS,
  });

  if (!result) {
    return { ok: false, cause: "other", error: "the platform could not be reached" };
  }
  const cause =
    result.cause === "unconfigured" || result.cause === "auth" ? result.cause : "other";
  return result.ok ? { ok: true } : { ok: false, cause, error: result.error };
}
