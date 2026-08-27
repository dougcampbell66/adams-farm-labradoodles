/**
 * Spam screening for the public forms.
 *
 * PORTED VERBATIM from puppy-therapy and school-dogs, which carry the same
 * file. It is a copy rather than a shared package because these are separate
 * deployments with no common dependency, and a copy that says so is better
 * than three that quietly drift. A fix here should be applied in all three.
 *
 * The governing constraint is that a real request must never be thrown away.
 * Everything else on this site is built so a submission survives a database
 * outage and an email outage; a filter that silently drops a genuine lead
 * would be worse than the spam it prevents.
 *
 * So there are two verdicts, not one:
 *
 *   block — only for things a human physically cannot do. Drop it silently,
 *           store nothing, send nothing.
 *   flag  — anything merely suspicious. Store and send it exactly as normal,
 *           with the reasons attached, and let a person decide.
 *
 * A single weak signal is never enough to block. Two independent ones are,
 * because the odds of a genuine request tripping two at once are small enough
 * to accept, and the reasons are logged either way.
 *
 * No CAPTCHA. It taxes every real visitor to stop a problem that a hidden
 * field and a clock stop for free, and it is worst for exactly the people
 * least able to work around it.
 */

/** The name of the decoy field. Tempting to a bot, meaningless to us. */
export const HONEYPOT_FIELD = "website";

/** When the form was first shown, as epoch milliseconds. */
export const STARTED_FIELD = "started_at";

/**
 * Nobody completes a form this fast by hand. Deliberately generous — password
 * managers and browser autofill can fill several fields at once, and the cost
 * of a false positive here is a lost customer.
 */
const MIN_FILL_MS = 2500;

export type SpamVerdict = "clean" | "flag" | "block";

export type Assessment = {
  verdict: SpamVerdict;
  /** Human-readable, in the order found. Goes into the log and the email. */
  reasons: string[];
};

export type Submission = {
  /** The decoy field's value, if the client sent one. */
  honeypot?: unknown;
  /** The value of STARTED_FIELD, if the client sent one. */
  startedAt?: unknown;
  /** Free-text fields — message, notes, anything a person types. */
  text?: string;
  /** Fields that should never contain a link: name, company, location. */
  identity?: string;
};

// Each alternative consumes the whole URL, not just its opening. An earlier
// version matched the scheme and the domain of the same link separately, so
// one perfectly ordinary "our office is at https://acme.com" counted as two
// links and tripped the threshold on its own.
const LINK =
  /\b(?:https?:\/\/\S+|www\.\S+|[a-z0-9-]+\.(?:com|net|org|ru|cn|top|xyz|io)\b)/gi;

/** Same pattern without /g. A global regex is stateful across .test() calls,
 *  which makes every other call return the wrong answer. */
const LINK_ONCE = new RegExp(LINK.source, "i");
const MARKUP = /\[url[=\]]|\[link[=\]]|<a\s+href/i;

/** Phrases that essentially only appear in contact-form spam. Kept short and
 *  specific: a broad keyword list is how real requests get eaten. */
const PITCHES = [
  "seo service",
  "backlink",
  "guest post",
  "rank #1",
  "rank your site",
  "increase your traffic",
  "crypto",
  "casino",
  "viagra",
  "web design services",
  "digital marketing agency",
];

export function assess(sub: Submission): Assessment {
  const reasons: string[] = [];

  // ---- the one hard rule -------------------------------------------------
  // The decoy is invisible, out of the tab order and hidden from assistive
  // technology. There is no way for a person to put something in it, so a
  // value here is conclusive on its own.
  if (typeof sub.honeypot === "string" && sub.honeypot.trim() !== "") {
    return { verdict: "block", reasons: ["honeypot field was filled"] };
  }

  // ---- weak signals ------------------------------------------------------
  const started = Number(sub.startedAt);
  if (Number.isFinite(started) && started > 0) {
    const elapsed = Date.now() - started;
    // Only a suspiciously *fast* submission counts. A slow one means someone
    // left the tab open, which is ordinary.
    if (elapsed >= 0 && elapsed < MIN_FILL_MS) {
      reasons.push(`submitted in ${elapsed}ms`);
    }
  }

  const text = (sub.text ?? "").toString();
  const identity = (sub.identity ?? "").toString();

  const links = text.match(LINK)?.length ?? 0;
  if (links >= 2) reasons.push(`${links} links in the message`);

  if (MARKUP.test(text)) reasons.push("link markup in the message");

  // A name, company or city never contains a URL. This one is close to
  // conclusive by itself, but it stays a weak signal so that two independent
  // things always have to agree before anything is dropped.
  if (LINK_ONCE.test(identity)) reasons.push("a link in the name or company field");

  const haystack = `${text} ${identity}`.toLowerCase();
  const pitch = PITCHES.find((p) => haystack.includes(p));
  if (pitch) reasons.push(`sales pitch wording ("${pitch}")`);

  if (reasons.length >= 2) return { verdict: "block", reasons };
  if (reasons.length === 1) return { verdict: "flag", reasons };
  return { verdict: "clean", reasons };
}
