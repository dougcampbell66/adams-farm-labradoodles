// Owner contact records for the internal "Forever Families" page.
//
// Server-only: reads the Supabase secret key.
//
// How ownership is actually modelled in PuppyQ (this is the part that isn't
// obvious): a family is NOT attributed to a breeder by `contacts.organization_id`
// — that column is null on essentially every migrated row. Ownership lives in the
// `relationships` join table:
//
//   relationships( contact_id → contacts, dog_id → dogs, type_id → relationship_types,
//                  start_date /* adoption date */, price, notes )
//
// with `relationship_types.name = 'owner'`. So an Adams Farm family is one that
// owns a dog whose `dogs.organization_id` is Adams Farm's — the org filter
// belongs on the *dog*, not on the contact.
//
// NOTE ON COVERAGE: as of this writing PuppyQ has only ~5 owner relationships
// recorded against Adams Farm dogs (2 distinct families), versus 120 for Legend
// Manor. The page is correct; the data is thin until the owner relationships are
// backfilled. An empty-ish page here is a data gap, not a bug.

import { getSupabase, supabaseKeyKind, supabaseUrl } from "@/lib/supabase";
import { ADAMS_FARM_ORG_ID } from "@/lib/adams-farm";

/**
 * One PostgREST round trip. `!inner` makes both embeds inner joins, so
 * `.eq('dogs.organization_id', …)` filters the relationship rows themselves
 * rather than merely nulling out the embedded dog.
 */
const OWNER_SELECT =
  "start_date," +
  "dogs!inner(id,call_name,registered_name,organization_id)," +
  "contacts!inner(id,first_name,last_name,email,phone,notes)";

interface OwnerRow {
  start_date: string | null;
  dogs: {
    id: string;
    call_name: string | null;
    registered_name: string | null;
    organization_id: string | null;
  };
  contacts: {
    id: string;
    first_name: string | null;
    last_name: string | null;
    email: string | null;
    phone: string | null;
    notes: string | null;
  };
}

/** A dog this family owns. */
export interface OwnedDog {
  id: string;
  name: string;
  /** Adoption date (`relationships.start_date`), when recorded. */
  since: string | null;
}

/** A contact reshaped for display — names resolved, phone links pre-built. */
export interface Family {
  id: string;
  name: string;
  email: string | null;
  /** Human-readable phone, e.g. `(336) 803-1023`. */
  phone: string | null;
  /** Dial-safe phone for `tel:` / `sms:`, e.g. `+13368031023`. */
  phoneHref: string | null;
  notes: string | null;
  dogs: OwnedDog[];
}

export interface FamiliesResult {
  families: Family[];
  /** Enough to debug an empty page without opening the source. */
  diagnostics: {
    keyKind: typeof supabaseKeyKind;
    url: string | null;
    orgId: string;
    query: string;
    totalRows: number;
    withEmail: number;
    withPhone: number;
    unreachable: number;
    errors: string[];
  };
}

// ---------------------------------------------------------------- formatting

/**
 * Digits-only form for `tel:` / `sms:` hrefs. US numbers get a `+1` so the link
 * dials correctly from a phone that isn't already on a US carrier; anything that
 * doesn't look like a phone number at all returns null so we render plain text
 * instead of a link that would fail silently on tap.
 */
export function phoneHref(raw: string | null): string | null {
  if (!raw) return null;
  const trimmed = raw.trim();
  const digits = trimmed.replace(/\D/g, "");
  if (digits.length < 7) return null;
  if (trimmed.startsWith("+")) return `+${digits}`;
  if (digits.length === 10) return `+1${digits}`;
  if (digits.length === 11 && digits.startsWith("1")) return `+${digits}`;
  return digits;
}

/** `(336) 803-1023` for US numbers; anything else is shown as entered. */
export function phoneDisplay(raw: string | null): string | null {
  if (!raw) return null;
  const trimmed = raw.trim();
  if (!trimmed) return null;
  const digits = trimmed.replace(/\D/g, "");
  const local = digits.length === 11 && digits.startsWith("1") ? digits.slice(1) : digits;
  if (local.length === 10 && !trimmed.startsWith("+")) {
    return `(${local.slice(0, 3)}) ${local.slice(3, 6)}-${local.slice(6)}`;
  }
  return trimmed;
}

/**
 * Best dog label. Most PuppyQ rows have a null `call_name`, so the registered
 * name is what we show — trimmed of the "Adams Farm" prefix, since every dog on
 * this page carries it. Also handles the `-- "Nickname"` placeholder shape used
 * when a dog has only a call name.
 */
function dogLabel(d: OwnerRow["dogs"]): string {
  const call = d.call_name?.trim();
  if (call) return call;

  const reg = d.registered_name?.trim();
  if (!reg) return "Unnamed dog";

  const stripped = reg.replace(/^Adams\s+Farm(?:'s|’s)?\s+/i, "").trim();
  if (!stripped) return reg;

  if (/^-{2,}/.test(stripped)) {
    const quoted = stripped.match(/["“](.+?)["”]/);
    if (quoted) return quoted[1];
    return stripped.replace(/^-{2,}\s*/, "") || reg;
  }
  return stripped;
}

// ------------------------------------------------------------------- fetch

export async function getForeverFamilies(): Promise<FamiliesResult> {
  const errors: string[] = [];
  const orgId = ADAMS_FARM_ORG_ID;
  const query =
    `from('relationships').select('${OWNER_SELECT}')` +
    `.eq('type_id', <relationship_types.name = 'owner'>).eq('dogs.organization_id', '${orgId}')`;

  const base = {
    keyKind: supabaseKeyKind,
    url: supabaseUrl,
    orgId,
    query,
    totalRows: 0,
    withEmail: 0,
    withPhone: 0,
    unreachable: 0,
    errors,
  };

  const supabase = getSupabase();
  if (!supabase) {
    errors.push(
      "Supabase is not configured — NEXT_PUBLIC_SUPABASE_URL and a Supabase key must be set.",
    );
    return {
      families: [],
      diagnostics: { ...base, query: "(not attempted — missing environment variables)" },
    };
  }

  // Look the type up by name rather than hardcoding its uuid — it's a small
  // lookup table and the id differs per environment.
  const { data: type, error: typeError } = await supabase
    .from("relationship_types")
    .select("id")
    .eq("name", "owner")
    .maybeSingle();

  if (typeError || !type) {
    errors.push(`relationship_types: ${typeError?.message ?? "no row named 'owner' found"}`);
    return { families: [], diagnostics: base };
  }

  const { data, error } = await supabase
    .from("relationships")
    .select(OWNER_SELECT)
    .eq("type_id", type.id)
    .eq("dogs.organization_id", orgId);

  if (error) {
    errors.push(`relationships: ${error.message}`);
    return { families: [], diagnostics: base };
  }

  const rows = (data ?? []) as unknown as OwnerRow[];

  // Belt and braces: `dogs` is shared across every PuppyQ tenant, so re-check the
  // org on the way out. Another breeder's client list must never render here,
  // even if the embedded filter above were dropped or quietly stopped matching.
  const mine = rows.filter((r) => r.dogs?.organization_id === orgId);
  if (mine.length !== rows.length) {
    errors.push(
      `Discarded ${rows.length - mine.length} relationship row(s) whose dog belongs to another organization.`,
    );
  }

  // One row per (contact, dog); fold into one entry per family.
  const byContact = new Map<string, Family>();
  for (const row of mine) {
    const c = row.contacts;
    if (!c) continue;

    let family = byContact.get(c.id);
    if (!family) {
      const name = [c.first_name, c.last_name]
        .map((p) => p?.trim())
        .filter(Boolean)
        .join(" ");
      family = {
        id: c.id,
        name: name || "Unnamed contact",
        email: c.email?.trim() || null,
        phone: phoneDisplay(c.phone),
        phoneHref: phoneHref(c.phone),
        notes: c.notes?.trim() || null,
        dogs: [],
      };
      byContact.set(c.id, family);
    }

    if (!family.dogs.some((d) => d.id === row.dogs.id)) {
      family.dogs.push({ id: row.dogs.id, name: dogLabel(row.dogs), since: row.start_date });
    }
  }

  const families = [...byContact.values()].sort((a, b) => {
    // Surname-ish sort: last word of the name, then the whole name.
    const last = (n: string) => n.trim().split(/\s+/).slice(-1)[0] ?? n;
    return last(a.name).localeCompare(last(b.name)) || a.name.localeCompare(b.name);
  });

  for (const f of families) f.dogs.sort((a, b) => a.name.localeCompare(b.name));

  if (families.length === 0 && supabaseKeyKind !== "secret") {
    errors.push(
      "The query succeeded but returned 0 rows using the publishable (anon) key. " +
        "PuppyQ's row-level security most likely hides these rows from anonymous " +
        "readers — set SUPABASE_SERVICE_ROLE_KEY.",
    );
  }

  return {
    families,
    diagnostics: {
      ...base,
      totalRows: families.length,
      withEmail: families.filter((f) => f.email).length,
      withPhone: families.filter((f) => f.phoneHref).length,
      unreachable: families.filter((f) => !f.email && !f.phoneHref).length,
    },
  };
}
