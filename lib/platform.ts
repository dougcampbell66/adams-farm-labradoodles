/**
 * Client for the pawsq platform's server-to-server mail endpoints.
 *
 * Outbound email left this site on 2026-08-30 (pawsq docs/EMAIL.md): the
 * platform (pawsq-app) now runs the whole intake pipeline — spam
 * screening, the anon-key insert into `leads`, and the operator
 * notification — and sends the magic-link email from this brand's
 * @pawsq.com identity. This site keeps what is genuinely its own: the
 * form UX, validation, name composition, its sign-in logic, and a
 * direct-write FALLBACK so a lead survives even a platform outage
 * (lib/leads.ts).
 *
 * Server-only. PAWSQ_PLATFORM_URL is the platform deployment's origin;
 * PAWSQ_PLATFORM_KEY is the shared server-to-server secret, presented as
 * the x-pawsq-platform-key header. Neither ever reaches the browser.
 *
 * Every call returns null on transport failure rather than throwing —
 * the callers each have a stated degraded path, and a platform hiccup
 * must never be the reason a visitor sees an error their own submission
 * did not earn.
 */

export const BRAND = "adams_farm";

export function platformConfigured(): boolean {
  return Boolean(process.env.PAWSQ_PLATFORM_URL && process.env.PAWSQ_PLATFORM_KEY);
}

async function call(
  path: string,
  payload: Record<string, unknown>,
): Promise<Record<string, unknown> | null> {
  if (!platformConfigured()) {
    console.error(`[platform] ${path} not attempted — PAWSQ_PLATFORM_URL / PAWSQ_PLATFORM_KEY are not set`);
    return null;
  }
  try {
    const res = await fetch(`${process.env.PAWSQ_PLATFORM_URL}${path}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-pawsq-platform-key": process.env.PAWSQ_PLATFORM_KEY as string,
      },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(10_000),
    });
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      console.error(`[platform] ${path} responded ${res.status}: ${text}`);
      return null;
    }
    return (await res.json()) as Record<string, unknown>;
  } catch (error) {
    console.error(`[platform] ${path} unreachable:`, error);
    return null;
  }
}

export interface IntakeResult {
  verdict: "clean" | "flag" | "block";
  stored: boolean;
  emailed: boolean;
}

export interface IntakePayload {
  form: string;
  screen: {
    honeypot?: unknown;
    startedAt?: unknown;
    text?: string;
    identity?: string;
  };
  store: "leads" | "quiz_responses" | null;
  row: Record<string, unknown> | null;
  notification: {
    subject: string;
    fields: [string, string][];
    replyTo?: string;
  };
}

/** null = the platform could not be reached; the caller falls back. */
export async function platformIntake(
  payload: IntakePayload,
): Promise<IntakeResult | null> {
  const data = await call("/api/platform/intake", { brand: BRAND, ...payload });
  if (!data || typeof data.verdict !== "string") return null;
  return {
    verdict: data.verdict as IntakeResult["verdict"],
    stored: data.stored === true,
    emailed: data.emailed === true,
  };
}

export interface MagicLinkSend {
  ok: boolean;
  cause?: string;
  error?: string;
}

/** null = the platform could not be reached. */
export async function platformMagicLink(payload: {
  to: string;
  url: string;
  pageName: string;
  ttlMinutes: number;
  sessionDays: number;
}): Promise<MagicLinkSend | null> {
  const data = await call("/api/platform/magic-link", { brand: BRAND, ...payload });
  if (!data || typeof data.ok !== "boolean") return null;
  return data as unknown as MagicLinkSend;
}
