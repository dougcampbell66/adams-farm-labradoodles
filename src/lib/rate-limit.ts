// Rate limiting for the sign-in endpoint.
//
// IN-MEMORY, AND THEREFORE BEST-EFFORT. State lives in a module-level Map, so
// it is per-instance and evaporates on cold starts: a determined attacker who
// can spread requests across enough fresh lambdas will get through. It is here
// to stop the realistic case — a stuck retry loop, or someone hammering the
// form to flood an inbox — not a distributed attacker.
//
// What makes that acceptable here is the allowlist: only the handful of
// addresses in FOREVER_FAMILIES_ALLOWED_EMAILS can ever receive mail, so the
// worst case is one of our own inboxes filling up, not open-relay abuse.
//
// To make this authoritative, swap `hit()` for a shared store — @upstash/ratelimit
// over Redis is the usual choice. Nothing outside this file needs to change:
// keep the `check()` signature and callers are unaffected.

interface Rule {
  /** Max hits allowed inside the window. */
  limit: number;
  windowMs: number;
}

const SECOND = 1000;
const MINUTE = 60 * SECOND;
const HOUR = 60 * MINUTE;

/**
 * Per-address rules. The 60-second cooldown is the workhorse — it defuses the
 * common "mashed the button" case; the hourly cap is the backstop against a
 * slow, sustained loop.
 */
export const EMAIL_RULES: Rule[] = [
  { limit: 1, windowMs: 60 * SECOND },
  { limit: 5, windowMs: 1 * HOUR },
];

/** Per-IP, to catch one actor cycling many addresses. Looser than per-address. */
export const IP_RULES: Rule[] = [{ limit: 20, windowMs: 1 * HOUR }];

/** key → ascending hit timestamps, trimmed to the longest window on access. */
const hits = new Map<string, number[]>();

const LONGEST_WINDOW_MS = Math.max(
  ...EMAIL_RULES.map((r) => r.windowMs),
  ...IP_RULES.map((r) => r.windowMs),
);

/** Drop keys with nothing recent, so the Map can't grow without bound. */
function sweep(now: number): void {
  for (const [key, times] of hits) {
    const newest = times[times.length - 1];
    if (newest === undefined || now - newest > LONGEST_WINDOW_MS) hits.delete(key);
  }
}

let lastSweep = 0;

export interface RateLimitResult {
  ok: boolean;
  /** Seconds until the caller may retry. Only meaningful when `ok` is false. */
  retryAfter: number;
}

/**
 * Check every key against its rules and, only if all pass, record a hit for each.
 *
 * Denied attempts are deliberately NOT recorded: counting them would let a
 * spammer extend the lockout indefinitely and keep the legitimate owner of the
 * address locked out — turning a rate limit into a denial-of-service vector.
 */
export function check(entries: { key: string; rules: Rule[] }[]): RateLimitResult {
  const now = Date.now();

  if (now - lastSweep > 5 * MINUTE) {
    sweep(now);
    lastSweep = now;
  }

  let retryAfter = 0;

  for (const { key, rules } of entries) {
    const times = (hits.get(key) ?? []).filter((t) => now - t <= LONGEST_WINDOW_MS);
    hits.set(key, times);

    for (const rule of rules) {
      const inWindow = times.filter((t) => now - t < rule.windowMs);
      if (inWindow.length >= rule.limit) {
        // Oldest hit in this window is what has to age out before the next slot.
        const oldest = inWindow[0];
        const waitMs = rule.windowMs - (now - oldest);
        retryAfter = Math.max(retryAfter, Math.ceil(waitMs / 1000));
      }
    }
  }

  if (retryAfter > 0) return { ok: false, retryAfter };

  for (const { key } of entries) {
    const times = hits.get(key) ?? [];
    times.push(now);
    hits.set(key, times);
  }

  return { ok: true, retryAfter: 0 };
}

/**
 * Best-effort client IP. Vercel sets x-forwarded-for; the left-most entry is the
 * original client. Spoofable in general, which is another reason the per-address
 * limit above is the one doing the real work.
 */
export function clientIp(headers: Headers): string {
  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }
  return headers.get("x-real-ip")?.trim() || "unknown";
}

/** Test seam — clears all counters. */
export function reset(): void {
  hits.clear();
  lastSweep = 0;
}
