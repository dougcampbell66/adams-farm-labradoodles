// Magic-link email, sent through the same Hostinger mailbox as the contact
// form notification (lib/mailer.ts). Previously went through Resend — a
// second paid email service that existed only to send this one message —
// which meant a login link couldn't reach anyone until a domain was also
// verified with Resend. The mailbox used here needs no such verification.

import { mailerTransport, isMailerConfigured } from "@/lib/mailer";
import { LOGIN_TTL_MINUTES, SESSION_TTL_DAYS } from "@/lib/auth";

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
      return "Set SMTP_EMAIL and SMTP_PASSWORD (the Hostinger mailbox's address and password).";
    case "auth":
      return "SMTP_EMAIL / SMTP_PASSWORD were rejected by Hostinger — check the password hasn't changed.";
    default:
      return "See the SMTP error above.";
  }
}

export async function sendMagicLink(to: string, url: string): Promise<SendResult> {
  if (!isMailerConfigured()) {
    return { ok: false, cause: "unconfigured", error: "SMTP_EMAIL / SMTP_PASSWORD are not set" };
  }

  const text = [
    "Here is your sign-in link for the Adams Farm Forever Families page:",
    "",
    url,
    "",
    `This link expires in ${LOGIN_TTL_MINUTES} minutes and signs you in for ${SESSION_TTL_DAYS} days.`,
    "If you didn't ask for it, you can ignore this email.",
  ].join("\n");

  const html = `
<div style="font-family:Georgia,serif;color:#1a2535;line-height:1.6;max-width:520px">
  <p style="font-family:ui-monospace,monospace;font-size:11px;letter-spacing:.18em;text-transform:uppercase;color:#e8734a;margin:0 0 14px">
    Adams Farm Labradoodles
  </p>
  <p style="margin:0 0 20px;font-size:16px">Here is your sign-in link for the Forever Families page.</p>
  <p style="margin:0 0 24px">
    <a href="${url}" style="display:inline-block;background:#142033;color:#f5f0e8;padding:12px 22px;text-decoration:none;font-family:ui-monospace,monospace;font-size:12px;letter-spacing:.12em;text-transform:uppercase">
      Sign in
    </a>
  </p>
  <p style="margin:0 0 8px;font-size:13px;color:#4a5568">
    This link expires in ${LOGIN_TTL_MINUTES} minutes and signs you in for ${SESSION_TTL_DAYS} days.
    If you didn't ask for it, you can ignore this email.
  </p>
  <p style="margin:18px 0 0;font-size:11px;color:#718096;word-break:break-all">${url}</p>
</div>`.trim();

  try {
    await mailerTransport().sendMail({
      from: `"Adams Farm Labradoodles" <${process.env.SMTP_EMAIL}>`,
      to,
      subject: "Your Adams Farm sign-in link",
      text,
      html,
    });
    return { ok: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    const cause: FailureCause = /auth|invalid login|credentials/i.test(message)
      ? "auth"
      : "other";
    return { ok: false, cause, error: message };
  }
}
