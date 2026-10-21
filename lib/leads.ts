import { createClient } from "@supabase/supabase-js";
import { BRAND_KEY, type SourceForm } from "@/lib/brand";
import type { OptInPacket } from "@/lib/consent";

/**
 * The FALLBACK recording — used only when the platform intake endpoint
 * (lib/platform.ts) is unreachable, so the enquiry still lands rather
 * than being lost. Since pawsq migration 85 (2026-10-18) there is no
 * `leads` table: a form submission IS a contact. The one thing anon may
 * do to a person is call `record_form_submission()`, which writes the
 * person, their relationship with this brand at lifecycle stage `lead`,
 * the enquiry and the opt-in consent row in one transaction, and reads
 * nothing back but the ids of what it wrote. That is what this calls,
 * with the same anon key the old INSERT used — the privilege a public
 * form always had, and no more.
 *
 * What the fallback cannot do: screen (the screener is the platform's),
 * notify (the platform's mailer), or send the receipt. An enquiry
 * recorded this way is complete in the database and visible in the Hub's
 * inbox as waiting; it is only the email legs that the outage costs.
 *
 * THE ANON KEY, AND ONLY THE ANON KEY
 *
 * This module deliberately does NOT use `lib/supabase.ts`. That client
 * prefers `SUPABASE_SERVICE_ROLE_KEY`, which carries BYPASSRLS — correct
 * for the read-only server components that render /dams and /litters,
 * and never to sit behind a form any visitor on the internet can submit.
 * The secret key is not consulted here even as a fallback. If only the
 * secret key is configured this returns false and the enquiry is lost to
 * the database — degraded, logged whole, and the right failure.
 *
 * Never throws: returns whether the person was recorded.
 */
/**
 * The door's named fields, as the `p_` parameters of
 * `record_form_submission` (pawsq migration 85). Built explicitly: the
 * function takes exactly these, and a stray key would fail the call.
 */
const DOOR_FIELDS = [
  "name", "first_name", "last_name", "email", "phone", "company", "district",
  "event_type", "message", "location", "preferred_date", "preferred_time",
  "event_name", "event_dates", "expected_attendance", "enquirer_role", "answers",
] as const;

export function doorArgs(
  row: Record<string, unknown>,
  form: string,
  optIn: unknown,
): Record<string, unknown> {
  const args: Record<string, unknown> = { p_brand: BRAND_KEY, p_form: form };
  for (const k of DOOR_FIELDS) {
    const v = row[k];
    if (v === undefined || v === null || v === "") continue;
    args[`p_${k}`] = k === "answers" ? v : String(v);
  }
  // The packet, or null: the door writes the form_opt_in consent row from
  // it in the same transaction (R11 step 5). Nothing else about consent is
  // this site's to say.
  args.p_marketing_opt_in = optIn && typeof optIn === "object" ? optIn : null;
  // Unscreened on purpose — this path runs only when the platform, which
  // holds the screener, is unreachable — and recorded rather than held: a
  // real enquiry must not wait 90 days on a human because our endpoint
  // was down. The notification is lost with the platform; the Hub's inbox
  // shows the enquiry as waiting.
  args.p_spam_reasons = null;
  return args;
}

export type CorporateLead = {
  /** Composed by the route from the two parts — never split. See lib/name.ts. */
  name: string;
  first_name?: string | null;
  last_name?: string | null;
  email: string;
  phone?: string | null;
  message?: string | null;
  source_form: SourceForm;
  /**
   * The opt-in evidence packet, or null when no opt-in was given
   * (pawsq migration 56). NULL is the meaningful value here — not
   * false, not an empty object — so it is written as an explicit null
   * rather than omitted, keeping the row shape the same either way.
   */
  marketing_opt_in?: OptInPacket | null;
};

const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL ?? null;

/** Publishable only. The secret key is deliberately absent from this list. */
const anonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
  null;

/** Presence only — never log a key itself. */
export const leadsConfig = {
  url: url ?? "(unset)",
  anonKeySet: Boolean(anonKey),
};

export async function insertCorporateLead(lead: CorporateLead): Promise<boolean> {
  if (!url || !anonKey) {
    console.error(
      "[leads] no anon key configured — set NEXT_PUBLIC_SUPABASE_ANON_KEY. " +
        "The service-role key is NOT used here by design.",
      leadsConfig,
    );
    return false;
  }

  const args = doorArgs(
    {
      name: lead.name,
      first_name: lead.first_name,
      last_name: lead.last_name,
      email: lead.email,
      phone: lead.phone,
      message: lead.message,
    },
    lead.source_form,
    lead.marketing_opt_in ?? null,
  );

  try {
    const supabase = createClient(url, anonKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const { data, error } = await supabase.rpc("record_form_submission", args);
    if (error) {
      console.error("[leads] fallback recording failed", {
        ...leadsConfig,
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint,
      });
      return false;
    }
    const outcome = (data as { outcome?: string } | null)?.outcome;
    if (outcome !== "recorded") {
      console.error("[leads] fallback recording answered unexpectedly", { ...leadsConfig, outcome });
      return false;
    }
    return true;
  } catch (thrown) {
    // A transport-level failure (DNS, TLS, connection reset) rejects rather
    // than returning an error object.
    console.error("[leads] fallback recording threw", {
      ...leadsConfig,
      message: (thrown as Error)?.message,
    });
    return false;
  }
}
