/**
 * Which brand this site is, for anything it hands to the shared pawsq
 * database.
 *
 * pawsq serves several brands from one database, so a submission that does
 * not say where it came from cannot be attributed later — and "is Adams Farm
 * or Puppy Therapy actually pulling?" is unanswerable retroactively. Every
 * site in the family sends its own key.
 *
 * The key is the contract and must not change: it is what rows are stored
 * under. The label is copy and may.
 *
 * NOTE FOR TRIAGE: this is a brand NAME, not an organizations.id. Resolving
 * it to an operation happens during triage in the Hub, not at submission
 * time — a public site has no business knowing the database's primary keys.
 * pawsq migration 19 records the reasoning.
 */
export const BRAND_KEY = "adams_farm";
export const BRAND_LABEL = "Adams Farm Labradoodles";

/**
 * Which form on this site a submission came from. Distinct from the brand:
 * the brand answers "whose visitor was this", the form answers "what were
 * they doing". Both are needed to read the numbers.
 */
export const SOURCE = {
  contact: "contact_form",
} as const;

export type SourceForm = (typeof SOURCE)[keyof typeof SOURCE];

/** The two lines that head every notification email, so the brand is visible
 *  in the inbox as well as in the database. */
export function provenance(form: SourceForm): string {
  return `Brand: ${BRAND_LABEL} (${BRAND_KEY})\nForm: ${form}`;
}
