import { createClient } from "@supabase/supabase-js";
import { BRAND_KEY, type SourceForm } from "@/lib/brand";
import type { OptInPacket } from "@/lib/consent";

/**
 * The FALLBACK write path into pawsq's shared people record — used only
 * when the platform intake endpoint is unreachable, so the enquiry still
 * lands unscreened rather than being lost. The primary path is
 * lib/platform.ts.
 *
 * Since pawsq migration 66 (Douglas's ruling of 2026-09-08: leads and
 * contacts are not separate tables) there is no `leads` table to insert
 * into. A submission is recorded by calling the SECURITY DEFINER function
 * `record_form_submission(...)`, which creates the person (`contacts`),
 * the enquiry (`inquiries`, at status `new`) and the Adams Farm link
 * (`contact_organizations`, at stage `lead`) in one transaction — or, when
 * exactly one existing contact already holds that email, reuses the person
 * and adds the enquiry to them. It returns the inquiry id and nothing else.
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
 * false and the submission survives in the log alone — degraded, and the
 * right failure. A form that silently escalated to a BYPASSRLS credential
 * would be the wrong one.
 *
 * ─────────────────────────────────────────────────────────────────────
 * WHAT THE ANON ROLE MAY ACTUALLY DO
 * ─────────────────────────────────────────────────────────────────────
 * Nothing to a table. Migration 66 dropped `leads` together with the
 * INSERT grant migrations 19, 20 and 48 had narrowed, and gave anon no
 * privilege on `contacts`, `inquiries` or `contact_organizations` in its
 * place. The published key holds EXECUTE on one function and that is the
 * whole of its power: it can hand a submission over, and it cannot read a
 * list of names, emails and phone numbers back out — not through the
 * function, which returns only the new inquiry's id, and not around it,
 * because there is no table grant to go around.
 *
 * The function's parameters are the contract, so the call below names
 * them explicitly, one by one — client input is never spread into the
 * payload. `p_brand` and `p_form` are written server-side, never from a
 * client value: the brand answers "whose visitor was this", the form "what
 * were they doing". This form sends the person's name (composed, and its
 * two parts as given), email, phone, message and the opt-in packet;
 * everything else in the signature is for the event brands and defaults
 * to null.
 *
 * The stage is not a parameter. A submission arrives at stage `lead` on
 * the Adams Farm link and a human moves it in the Hub; nothing that can
 * be posted from the internet can arrive already triaged.
 *
 * Never throws: returns whether the submission was recorded, so the
 * caller can decide what to tell the visitor.
 */
export type FormSubmission = {
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
   * (pawsq migration 56's shape, now held on `inquiries.marketing_opt_in`
   * since migration 66). NULL is the meaningful value here — not false,
   * not an empty object — so it is passed as an explicit null rather than
   * omitted, keeping the call shape the same either way.
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
export const fallbackConfig = {
  url: url ?? "(unset)",
  anonKeySet: Boolean(anonKey),
};

export async function recordFormSubmission(submission: FormSubmission): Promise<boolean> {
  if (!url || !anonKey) {
    console.error(
      "[leads] no anon key configured — set NEXT_PUBLIC_SUPABASE_ANON_KEY. " +
        "The service-role key is NOT used here by design.",
      fallbackConfig,
    );
    return false;
  }

  // The function's own parameter names, in its own order. Anything the
  // signature has that this form does not carry is left to its default.
  const args = {
    p_brand: BRAND_KEY,
    p_form: submission.source_form,
    p_name: submission.name,
    p_first_name: submission.first_name || null,
    p_last_name: submission.last_name || null,
    p_email: submission.email,
    p_phone: submission.phone || null,
    p_message: submission.message || null,
    p_marketing_opt_in: submission.marketing_opt_in ?? null,
  };

  try {
    const supabase = createClient(url, anonKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const { error } = await supabase.rpc("record_form_submission", args);
    if (error) {
      console.error("[leads] record_form_submission failed", {
        ...fallbackConfig,
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
    console.error("[leads] record_form_submission threw", {
      ...fallbackConfig,
      message: (thrown as Error)?.message,
    });
    return false;
  }
}
