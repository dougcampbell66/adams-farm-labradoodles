/**
 * The marketing opt-in checkbox, as this site renders it.
 *
 * pawsq docs/EMAIL.md ruling 6 (Douglas, 2026-08-30), and the wording he
 * chose the same day.
 *
 * ── THIS WORDING MUST MATCH THE PLATFORM'S ──────────────────────────
 *
 * The canonical template lives in pawsq-app's `lib/mail/consent.ts`,
 * with `{brand}` replaced by this brand's display name. This site cannot
 * import it — separate deployments — so it carries the rendered string,
 * and the platform compares what we send against its own copy and
 * WARNS LOUDLY in the log when the two differ.
 *
 * A mismatch is never fatal. What the visitor actually read is what they
 * consented to, so the platform stores our string rather than its own,
 * and a real person's answer is never discarded over our copy-paste.
 * The warning is there so somebody fixes this file.
 *
 * Changing this string changes what future consents are consent TO. That
 * is a ruling, not a copy edit; past packets keep the wording they were
 * captured with.
 *
 * ── UNCHECKED BY DEFAULT, ALWAYS ────────────────────────────────────
 *
 * The input that renders this must never carry `defaultChecked`. A
 * pre-ticked box is not express consent, and nothing downstream can
 * repair a box that was ticked for the person.
 */

/** The form field name, a contract between this site's form and its routes. */
export const MARKETING_OPT_IN_FIELD = "marketing_opt_in";

/** The exact words shown beside the checkbox. */
export const MARKETING_OPT_IN_WORDING =
  "Yes — Adams Farm Labradoodles may email me occasional news and updates. " +
  "This is optional, it is not needed for a reply, and I can " +
  "unsubscribe from any message.";

/**
 * Whether a raw checkbox value means "ticked".
 *
 * The forms post JSON and send a real boolean, but these routes also
 * accept a NATIVE form submit — the no-JS path — where a checkbox
 * arrives as a string: "yes" from an explicit value attribute, or "on",
 * which is what a browser posts for a checkbox with no value. An
 * unticked box is absent from the body entirely in every encoding.
 *
 * Normalizing here rather than in the platform is deliberate: the
 * platform's contract is a real boolean and it stays strict about it
 * (pawsq-app lib/mail/consent.ts refuses "on" and "true"), so each site
 * converts its own form encoding once, at the edge.
 */
export function isOptInAffirmative(raw: unknown): boolean {
  if (raw === true) return true;
  if (typeof raw !== "string") return false;
  const v = raw.trim().toLowerCase();
  return v === "yes" || v === "on" || v === "true";
}

/** The packet shape `leads.marketing_opt_in` holds (pawsq migration 56). */
export interface OptInPacket {
  checked_at: string;
  wording: string;
  form_url?: string;
  ip?: string;
}

/**
 * Build the packet for the FALLBACK write only.
 *
 * On the normal path the platform builds this itself, from the same
 * fields, so there is one authority. This exists because the fallback
 * runs precisely when the platform is unreachable — there is nobody
 * else to ask — and an enquiry that carried a real opt-in should not
 * silently lose it just because our own endpoint was down.
 *
 * Returns null unless the box was genuinely ticked and we can say what
 * the person was shown. Null is what the column stores to mean "no
 * opt-in was given". Optional facts are omitted rather than written
 * empty: an empty `ip` would claim we captured one and it was blank.
 */
export function optInPacket(input: {
  checked: boolean;
  wording: string;
  formUrl?: string | null;
  ip?: string | null;
}): OptInPacket | null {
  if (input.checked !== true) return null;
  const wording = (input.wording ?? "").trim();
  if (!wording) return null;

  const packet: OptInPacket = {
    checked_at: new Date().toISOString(),
    wording,
  };
  const formUrl = (input.formUrl ?? "").trim();
  if (formUrl) packet.form_url = formUrl;
  const ip = (input.ip ?? "").trim();
  if (ip) packet.ip = ip;
  return packet;
}

/**
 * The visitor's IP, from the proxy headers Vercel sets.
 *
 * `x-forwarded-for` is a list, client first. Taking [0] is right here
 * and would be wrong on an untrusted edge — on Vercel the platform
 * rewrites this header, so the first entry is the real client rather
 * than something a caller appended. Returns null rather than a guess.
 */
export function visitorIp(request: Request): string | null {
  const fwd = request.headers.get("x-forwarded-for");
  if (fwd) {
    const first = fwd.split(",")[0]?.trim();
    if (first) return first;
  }
  return request.headers.get("x-real-ip")?.trim() || null;
}
