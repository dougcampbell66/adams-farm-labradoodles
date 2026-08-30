/**
 * The two decoy field names the form and its route agree on.
 *
 * These used to live in lib/spam.ts alongside the screening itself; the
 * screening moved to the pawsq platform on 2026-08-30 (the one copy now
 * lives in pawsq-app's lib/mail/spam.ts), but the field names stay a
 * contract between THIS site's form markup and THIS site's route, which
 * reads them out of the post body and hands their values to the platform.
 */

/** The name of the decoy field. Tempting to a bot, meaningless to us. */
export const HONEYPOT_FIELD = "website";

/** When the form was first shown, as epoch milliseconds. */
export const STARTED_FIELD = "started_at";
