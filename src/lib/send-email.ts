// Minimal Resend client — one POST, no SDK dependency.
//
// SENDING DOMAIN, and the one thing most likely to bite:
//
// With no verified domain, the only usable From address is the shared
// `onboarding@resend.dev`, and Resend restricts it to a single recipient —
// the address that owns the Resend account. Mail to anyone else is rejected
// 403 "You can only send testing emails to your own email address".
//
// So on the default configuration this delivers to exactly one inbox: the
// Resend account owner's. Getting a link to anyone else requires verifying a
// real domain at resend.com/domains and setting AUTH_EMAIL_FROM to an address
// on it — e.g. `Adams Farm <noreply@adamsfarmlabradoodles.com>`. Nothing else
// in the codebase changes when that happens.
//
// `classify()` below turns that 403 into a named cause, because the failure is
// otherwise invisible: the sign-in form deliberately shows the same "check your
// email" screen whether or not sending worked (see the enumeration note in
// api/auth/request), so a silently-rejected send looks exactly like success.

import { LOGIN_TTL_MINUTES, SESSION_TTL_DAYS } from "@/lib/auth";

/** Works without domain verification, but only to the account owner's address. */
export const DEFAULT_FROM = "Adams Farm <onboarding@resend.dev>";

export function fromAddress(): string {
  return process.env.AUTH_EMAIL_FROM || DEFAULT_FROM;
}

/** True when we're on the shared testing sender, i.e. one-recipient-only. */
export function usingTestSender(): boolean {
  return fromAddress().includes("resend.dev");
}

export type FailureCause =
  /** No RESEND_API_KEY — nothing was attempted. */
  | "unconfigured"
  /** The resend.dev one-recipient restriction. Needs a verified domain. */
  | "test-sender-recipient-blocked"
  /** Bad or revoked API key. */
  | "auth"
  | "other";

interface SendResult {
  ok: boolean;
  cause?: FailureCause;
  error?: string;
}

/** Map Resend's HTTP status + body onto something actionable in a log line. */
function classify(status: number, body: string): FailureCause {
  const text = body.toLowerCase();
  if (status === 403 && text.includes("your own email address")) {
    return "test-sender-recipient-blocked";
  }
  if (status === 401 || status === 403) return "auth";
  return "other";
}

/** Human-readable next step for each cause — printed to the server log. */
export function remedy(cause: FailureCause): string {
  switch (cause) {
    case "unconfigured":
      return "Set RESEND_API_KEY (create a key at resend.com/api-keys).";
    case "test-sender-recipient-blocked":
      return (
        "The shared onboarding@resend.dev sender only delivers to the Resend " +
        "account owner's own address. Verify a domain at resend.com/domains and " +
        "set AUTH_EMAIL_FROM to an address on it, or add the account owner's " +
        "address to FOREVER_FAMILIES_ALLOWED_EMAILS for now."
      );
    case "auth":
      return "RESEND_API_KEY was rejected — check it hasn't been revoked.";
    default:
      return "See the Resend response above.";
  }
}

export async function sendMagicLink(to: string, url: string): Promise<SendResult> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return { ok: false, cause: "unconfigured", error: "RESEND_API_KEY is not set" };

  const from = fromAddress();

  const text = [
    "Here is your sign-in link for the Adams Farm Forever Families page:",
    "",
    url,
    "",
    `This link expires in ${LOGIN_TTL_MINUTES} minutes and signs you in for ${SESSION_TTL_DAYS} days.`,
    "If you didn't ask for it, you can ignore this email.",
  ].join("\n");

  // Inline styles only — email clients strip <style> blocks. Navy/paper match
  // the site; the toe-pad row is the brand's recurring motif.
  const html = `
<div style="font-family:Georgia,serif;color:#22201C;line-height:1.6;max-width:520px">
  <div style="margin:0 0 16px">
    <span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:#5B8DBE;margin-right:6px"></span>
    <span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:#6FAE7F;margin-right:6px"></span>
    <span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:#F2C14E;margin-right:6px"></span>
    <span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:#E4634F"></span>
  </div>
  <p style="font-family:ui-monospace,monospace;font-size:11px;letter-spacing:.18em;text-transform:uppercase;color:#1B2A41;margin:0 0 14px">
    Adams Farm Labradoodles
  </p>
  <p style="margin:0 0 20px;font-size:16px">Here is your sign-in link for the Forever Families page.</p>
  <p style="margin:0 0 24px">
    <a href="${url}" style="display:inline-block;background:#1B2A41;color:#FBFAF7;padding:12px 22px;text-decoration:none;font-family:ui-monospace,monospace;font-size:12px;letter-spacing:.12em;text-transform:uppercase">
      Sign in
    </a>
  </p>
  <p style="margin:0 0 8px;font-size:13px;color:#4A5462">
    This link expires in ${LOGIN_TTL_MINUTES} minutes and signs you in for ${SESSION_TTL_DAYS} days.
    If you didn't ask for it, you can ignore this email.
  </p>
  <p style="margin:18px 0 0;font-size:11px;color:#6E7787;word-break:break-all">${url}</p>
</div>`.trim();

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ from, to: [to], subject: "Your Adams Farm sign-in link", text, html }),
    });

    if (!response.ok) {
      const body = await response.text();
      return {
        ok: false,
        cause: classify(response.status, body),
        error: `Resend responded ${response.status}: ${body}`,
      };
    }
    return { ok: true };
  } catch (error) {
    return {
      ok: false,
      cause: "other",
      error: error instanceof Error ? error.message : String(error),
    };
  }
}
