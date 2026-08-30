import { createClient } from "@supabase/supabase-js";
import { BRAND_KEY, type SourceForm } from "@/lib/brand";
import type { OptInPacket } from "@/lib/consent";

/**
 * The FALLBACK insert path into pawsq's shared `leads` table (named
 * `corporate_leads` until pawsq migration 53) — used only when the
 * platform intake endpoint is unreachable, so the enquiry still lands
 * unscreened rather than being lost. The primary path is lib/platform.ts.
 *
 * ─────────────────────────────────────────────────────────────────────
 * THE ANON KEY, AND ONLY THE ANON KEY
 * ─────────────────────────────────────────────────────────────────────
 * This module deliberately does NOT use `lib/supabase.ts`. That client
 * prefers `SUPABASE_SERVICE_ROLE_KEY`, which carries BYPASSRLS — it can
 * read and write every row in every table for every brand. It is correct
 * for the read-only server components that render /dams and /litters, and
 * it must never sit behind a form any visitor on the internet can submit.
 *
 * So the key is read here, separately, and the secret key is not consulted
 * even as a fallback. If only the secret key is configured this returns
 * false and the lead travels by email alone — degraded, and the right
 * failure. A form that silently escalated to a BYPASSRLS credential would
 * be the wrong one.
 *
 * ─────────────────────────────────────────────────────────────────────
 * WHAT THE ANON ROLE MAY ACTUALLY DO
 * ─────────────────────────────────────────────────────────────────────
 * pawsq migration 19 gave `corporate_leads` a single policy — INSERT, for
 * anon, and nothing else — and narrowed the underlying privilege to match,
 * so the published key cannot read a list of names, emails and phone
 * numbers back out. Migration 20 narrowed it further to a COLUMN-LEVEL
 * grant, so a submitter cannot post a lead that arrives already triaged.
 *
 * That makes the column list load-bearing: sending a key outside it fails
 * the whole insert. The row below is built explicitly, field by field —
 * client input is never spread into the payload. As of migrations 48 and
 * 56 the granted columns are:
 *
 *   id, created_at, name, first_name, last_name, company, district,
 *   email, phone, event_type, message, source_brand, source_form,
 *   location, preferred_date, preferred_time, event_name, event_dates,
 *   expected_attendance, enquirer_role, answers, marketing_opt_in
 *
 * This form sends eight of them. `status`, `contact_id`, `inquiry_id`,
 * `triaged_at` and `triage_notes` are ungranted on purpose and fall to
 * their defaults — a submission arrives `new` and a human triages it.
 *
 * Never throws: returns whether the row landed, so the caller can fall
 * back to the email safety net.
 */
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

  const row = {
    name: lead.name,
    first_name: lead.first_name || null,
    last_name: lead.last_name || null,
    email: lead.email,
    phone: lead.phone || null,
    message: lead.message || null,
    // Written server-side, never from a client value. The brand answers
    // "whose visitor was this", the form "what were they doing".
    source_brand: BRAND_KEY,
    source_form: lead.source_form,
    marketing_opt_in: lead.marketing_opt_in ?? null,
  };

  try {
    const supabase = createClient(url, anonKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const { error } = await supabase.from("leads").insert(row);
    if (error) {
      console.error("[leads] insert failed", {
        ...leadsConfig,
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint,
      });
      return false;
    }
    return true;
  } catch (thrown) {
    // A transport-level failure (DNS, TLS, connection reset) rejects rather
    // than returning an error object.
    console.error("[leads] insert threw", {
      ...leadsConfig,
      message: (thrown as Error)?.message,
    });
    return false;
  }
}
