// Live Adams Farm records from the PuppyQ database.
//
// Server-only: reads the Supabase secret key.
//
// PuppyQ's tables are shared by every organization on the platform, so every
// query here filters on the Adams Farm org id and then re-checks it on the way
// out. An empty page is the safe failure; another breeder's dogs appearing on
// this site is not.

import { getSupabase, supabaseKeyKind, supabaseUrl } from "@/lib/supabase";

export const ADAMS_FARM_ORG_ID =
  process.env.ADAMS_FARM_ORG_ID || "8dfe8cc2-3241-4768-94d8-7ac1e340a39d";

const DOG_COLUMNS =
  "id,call_name,registered_name,organization_id,sex,status,breed,color,birthdate,notes,sire_name,dam_name,litter_id";

const LITTER_COLUMNS =
  "id,name,sire_name,whelp_date,organization_id,notes,dam_id,sire_id";

export interface Dog {
  id: string;
  call_name: string | null;
  registered_name: string | null;
  organization_id: string | null;
  sex: string | null;
  status: string | null;
  breed: string | null;
  color: string | null;
  birthdate: string | null;
  notes: string | null;
  sire_name: string | null;
  dam_name: string | null;
  litter_id: string | null;
}

export interface Litter {
  id: string;
  name: string | null;
  sire_name: string | null;
  whelp_date: string | null;
  organization_id: string | null;
  notes: string | null;
  dam_id: string | null;
  sire_id: string | null;
}

export interface Diagnostics {
  keyKind: typeof supabaseKeyKind;
  url: string | null;
  orgId: string;
  errors: string[];
}

// ---------------------------------------------------------------- naming

/**
 * Best human-facing name. Most PuppyQ rows have a null `call_name`, so the
 * registered name usually does the work — with the kennel prefix trimmed, since
 * every dog on this site carries it and repeating it is noise.
 */
export function dogName(dog: Dog): string {
  const call = dog.call_name?.trim();
  if (call) return call;

  const reg = dog.registered_name?.trim();
  if (!reg) return "Unnamed";

  const stripped = reg.replace(/^Adams\s+Farm(?:'s|’s)?\s+/i, "").trim();
  if (!stripped) return reg;

  // `Adams Farm -- "Nickname"` means there is no formal name, only a call name.
  if (/^-{2,}/.test(stripped)) {
    const quoted = stripped.match(/["“](.+?)["”]/);
    if (quoted) return quoted[1];
    return stripped.replace(/^-{2,}\s*/, "") || reg;
  }
  return stripped;
}

/** Registered name, but only when it adds something the heading doesn't show. */
export function registeredName(dog: Dog): string | null {
  const reg = dog.registered_name?.trim();
  if (!reg || reg === dogName(dog)) return null;
  return reg;
}

/** Dam / Sire from `sex` — `status` rarely carries it. */
export function roleLabel(dog: Dog): string {
  const sex = (dog.sex ?? "").toLowerCase();
  if (sex.startsWith("f")) return "Dam";
  if (sex.startsWith("m")) return "Sire";
  return "Breeding dog";
}

export function formatDate(iso: string | null): string | null {
  if (!iso) return null;
  const [y, m, d] = iso.split("-").map(Number);
  if (!y || !m || !d) return iso;
  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];
  return `${months[m - 1]} ${d}, ${y}`;
}

// ------------------------------------------------------------ classification

const isRetired = (s: string) => /retir|inactive|former|deceased|passed|rainbow/.test(s);
const isGuardian = (s: string) => /guardian/.test(s);

export interface DogsResult {
  active: Dog[];
  guardian: Dog[];
  retired: Dog[];
  diagnostics: Diagnostics;
}

/** Dams first, then sires, then alphabetical. */
function sortDogs(dogs: Dog[]): Dog[] {
  const rank = (d: Dog) => (roleLabel(d) === "Dam" ? 0 : roleLabel(d) === "Sire" ? 1 : 2);
  return [...dogs].sort((a, b) => rank(a) - rank(b) || dogName(a).localeCompare(dogName(b)));
}

// ------------------------------------------------------------------- fetch

function baseDiagnostics(errors: string[]): Diagnostics {
  return {
    keyKind: supabaseKeyKind,
    url: supabaseUrl,
    orgId: ADAMS_FARM_ORG_ID,
    errors,
  };
}

export async function getDogs(): Promise<DogsResult> {
  const errors: string[] = [];
  const empty: DogsResult = {
    active: [],
    guardian: [],
    retired: [],
    diagnostics: baseDiagnostics(errors),
  };

  const supabase = getSupabase();
  if (!supabase) {
    errors.push("Supabase is not configured — check NEXT_PUBLIC_SUPABASE_URL and the key.");
    return empty;
  }

  const { data, error } = await supabase
    .from("dogs")
    .select(DOG_COLUMNS)
    .eq("organization_id", ADAMS_FARM_ORG_ID);

  if (error) {
    errors.push(`dogs: ${error.message}`);
    return empty;
  }

  const rows = (data ?? []) as unknown as Dog[];
  const mine = rows.filter((d) => d.organization_id === ADAMS_FARM_ORG_ID);
  if (mine.length !== rows.length) {
    errors.push(`Discarded ${rows.length - mine.length} row(s) from another organization.`);
  }

  const active: Dog[] = [];
  const guardian: Dog[] = [];
  const retired: Dog[] = [];
  for (const dog of mine) {
    const status = (dog.status ?? "").toLowerCase().trim();
    if (isRetired(status)) retired.push(dog);
    else if (isGuardian(status)) guardian.push(dog);
    else active.push(dog);
  }

  if (mine.length === 0 && supabaseKeyKind !== "secret") {
    errors.push(
      "Query succeeded but returned 0 rows on the publishable key — PuppyQ's RLS " +
        "most likely hides these rows. Set SUPABASE_SERVICE_ROLE_KEY.",
    );
  }

  return {
    active: sortDogs(active),
    guardian: sortDogs(guardian),
    retired: sortDogs(retired),
    diagnostics: baseDiagnostics(errors),
  };
}

export interface LittersResult {
  litters: Litter[];
  diagnostics: Diagnostics;
}

export async function getLitters(): Promise<LittersResult> {
  const errors: string[] = [];
  const supabase = getSupabase();
  if (!supabase) {
    errors.push("Supabase is not configured.");
    return { litters: [], diagnostics: baseDiagnostics(errors) };
  }

  const { data, error } = await supabase
    .from("litters")
    .select(LITTER_COLUMNS)
    .eq("organization_id", ADAMS_FARM_ORG_ID);

  if (error) {
    errors.push(`litters: ${error.message}`);
    return { litters: [], diagnostics: baseDiagnostics(errors) };
  }

  const rows = (data ?? []) as unknown as Litter[];
  const mine = rows
    .filter((l) => l.organization_id === ADAMS_FARM_ORG_ID)
    // Newest first; undated litters sink to the bottom.
    .sort((a, b) => (b.whelp_date ?? "").localeCompare(a.whelp_date ?? ""));

  return { litters: mine, diagnostics: baseDiagnostics(errors) };
}

/** Headline counts for the trust strip, straight from the record. */
export async function getCounts(): Promise<{ dogs: number; litters: number }> {
  const supabase = getSupabase();
  if (!supabase) return { dogs: 0, litters: 0 };

  const [dogs, litters] = await Promise.all([
    supabase
      .from("dogs")
      .select("id", { count: "exact", head: true })
      .eq("organization_id", ADAMS_FARM_ORG_ID),
    supabase
      .from("litters")
      .select("id", { count: "exact", head: true })
      .eq("organization_id", ADAMS_FARM_ORG_ID),
  ]);

  return { dogs: dogs.count ?? 0, litters: litters.count ?? 0 };
}
