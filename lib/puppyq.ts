// PuppyQ data layer for Adams Farm Labradoodles.
//
// Mirrors the pattern in Legend Manor's src/lib/puppyq.ts — fetches the whole
// PuppyQ record once per render (deduped by React cache), then derives the
// Adams Farm slice by organization_id. Server-only.
//
// Schema notes (same as Legend Manor):
//   • No `puppies` table — a puppy is a `dogs` row with a litter_id.
//   • `status` is free-form. Observed live: 'active', 'placed', 'retired',
//     'reserved', 'retained', 'transferred'. Never assume the set is closed —
//     branch on the values you care about and let the rest fall through.
//   • `sex` is null on most rows — inferred from litter parentage.

import { cache } from "react";
import { getSupabase, supabaseKeyKind, supabaseUrl } from "@/lib/supabase";
import { pqDogPhoto } from "@/lib/images-pq";

// ─── Types ───────────────────────────────────────────────────────────────────

export interface PqDog {
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
  sire_id: string | null;
  dam_id: string | null;
  sire_name: string | null;
  dam_name: string | null;
  litter_id: string | null;
}

export interface PqLitterRow {
  id: string;
  name: string | null;
  sire_name: string | null;
  whelp_date: string | null;
  organization_id: string | null;
  notes: string | null;
  dam_id: string | null;
  sire_id: string | null;
}

export interface PqOrg {
  id: string;
  name: string | null;
  kennel_name: string | null;
}

export interface PqLitter {
  row: PqLitterRow;
  id: string;
  type: "solo" | "co-litter";
  coProgram: string | null;
  year: number | null;
  birthdate: string | null;
  dam: PqDog | null;
  sire: PqDog | null;
  sireName: string | null;
  damName: string | null;
  puppies: PqDog[];
}

export interface PuppyQ {
  orgId: string | null;
  dogs: PqDog[];
  allDogs: PqDog[];
  litters: PqLitter[];
  diagnostics: {
    keyKind: string;
    url: string | null;
    orgId: string | null;
    orgName: string | null;
    dogRows: number;
    litterRows: number;
    errors: string[];
  };
}

// ─── Naming helpers ───────────────────────────────────────────────────────────

export function pqName(dog: PqDog): string {
  return dog.call_name?.trim() || dog.registered_name?.trim() || "Unnamed dog";
}

/**
 * The distinctive part of a registered name: "Adams Farm's Silas" → "Silas".
 * The live record writes most of our own dogs without the possessive
 * ("Adams Farm Madison"), so that form is stripped too — otherwise every name
 * in a litter grid opens with the same two words.
 */
export function pqShortName(dog: PqDog): string {
  const call = dog.call_name?.trim();
  if (call) return call;
  const reg = dog.registered_name?.trim();
  if (!reg) return "Unnamed dog";
  const apostrophe = reg.match(/^.*?['']s\s+(.+)$/);
  if (apostrophe) return apostrophe[1];
  const kennel = reg.match(/^adams\s+farm\s+(.+)$/i);
  return kennel ? kennel[1] : reg;
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/['']/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

/** Returns the best available photo URL for a dog, checking call name then registered name. */
export function pqPhoto(dog: PqDog): string | null {
  const candidates: string[] = [];
  if (dog.call_name) candidates.push(slugify(dog.call_name));
  if (dog.registered_name) {
    candidates.push(slugify(dog.registered_name));
    const words = dog.registered_name.trim().split(/\s+/);
    if (words.length > 1) candidates.push(slugify(words[words.length - 1]));
  }
  for (const slug of candidates) {
    const url = pqDogPhoto(slug);
    if (url) return url;
  }
  return null;
}

// ─── Sex / role derivation ────────────────────────────────────────────────────

export function pqSex(dog: PqDog, litters: PqLitter[]): "female" | "male" | null {
  const explicit = (dog.sex ?? "").toLowerCase();
  if (explicit.startsWith("f")) return "female";
  if (explicit.startsWith("m")) return "male";
  if (litters.some((l) => l.row.dam_id === dog.id)) return "female";
  if (litters.some((l) => l.row.sire_id === dog.id)) return "male";
  return null;
}

export function pqRole(dog: PqDog, litters: PqLitter[]): string {
  const sex = pqSex(dog, litters);
  if (sex === "female") return "Dam";
  if (sex === "male") return "Sire";
  return "On record";
}

// ─── Dog helpers ──────────────────────────────────────────────────────────────

/** The registered name, when it says something the heading does not. */
export function pqRegisteredName(dog: PqDog): string | null {
  const reg = dog.registered_name?.trim();
  if (!reg || reg === dog.call_name?.trim()) return null;
  return reg;
}

/** Every litter this dog is recorded as a parent of. */
export function pqLittersProduced(dog: PqDog, litters: PqLitter[]): PqLitter[] {
  return litters.filter((l) => l.row.dam_id === dog.id || l.row.sire_id === dog.id);
}

/** Every puppy out of this dog's litters. */
export function pqOffspring(dog: PqDog, litters: PqLitter[]): PqDog[] {
  return pqLittersProduced(dog, litters).flatMap((l) => l.puppies);
}

// ─── Breeding lines (Dams / Sires) ────────────────────────────────────────────

/**
 * Statuses that mean a parent's breeding days here are over. Everything else
 * ('active', 'retained', 'reserved') is still in the program.
 *
 * Legend Manor splits its tiers on `status === 'active'` alone. That rule reads
 * wrong against the Adams Farm slice, where the record marks the dam of the
 * newest litter and the sire of four of five litters as 'retained': it would
 * empty the active tier and file the program's busiest sire under "retired",
 * while promoting a once-hired outside stud into it. Naming the finished
 * statuses instead keeps the same intent honest against the data we have.
 */
const RETIRED_STATUSES = new Set(["retired", "placed", "transferred", "deceased"]);

/**
 * One parent on the /dams or /sires page: the dog row when the record has one,
 * the name the litter recorded otherwise, plus how many litters they produced.
 */
export interface PqParentEntry {
  dog: PqDog | null;
  name: string;
  litterCount: number;
  /** True when the dog row belongs to another program — a partner's dam or a hired stud. */
  outside: boolean;
}

/**
 * THE MEMBERSHIP RULE for the public Dams and Sires pages, same as Legend
 * Manor's: a dog appears only after producing a litter that is on the Adams
 * Farm record. Prospects wait for their first litter; nothing here is
 * aspirational.
 *
 * One deliberate difference from Legend Manor, which counts only litters its
 * own org owns: Adams Farm's record already scopes `pq.litters` to litters the
 * farm owns *or* co-bred, and /litters shows every one of them. Counting the
 * same set here keeps the two pages telling one story — the parents of a
 * co-litter show up, flagged as belonging to the partner program.
 */
export function pqBreedingLines(pq: PuppyQ) {
  const ours = new Set(pq.dogs.map((d) => d.id));

  const collect = (side: "dam" | "sire") => {
    const done = (dog: PqDog) => RETIRED_STATUSES.has((dog.status ?? "").toLowerCase());
    const m = new Map<string, PqParentEntry>();
    for (const l of pq.litters) {
      const dog = side === "dam" ? l.dam : l.sire;
      const recordedName = side === "dam" ? l.damName : l.sireName;
      const key = dog ? dog.id : `name:${(recordedName ?? "?").toLowerCase()}`;
      const entry = m.get(key) ?? {
        dog: dog ?? null,
        name: dog ? pqName(dog) : (recordedName ?? "Unrecorded"),
        litterCount: 0,
        outside: dog ? !ours.has(dog.id) : true,
      };
      entry.litterCount += 1;
      m.set(key, entry);
    }
    const all = [...m.values()].sort(
      (a, b) => b.litterCount - a.litterCount || a.name.localeCompare(b.name),
    );
    return {
      // "Producing" vs "retired" is whatever the record claims via status;
      // membership never depends on it.
      producing: all.filter((e) => e.dog && !done(e.dog)),
      retired: all.filter((e) => e.dog && done(e.dog)),
      // Parents the record knows only by name — outside studs with no dog row.
      nameOnly: all.filter((e) => !e.dog),
    };
  };

  return { dams: collect("dam"), sires: collect("sire") };
}

// ─── Puppy helpers ────────────────────────────────────────────────────────────

export type PqPuppyStanding = "placed" | "in-program" | "unknown";

/**
 * A puppy's standing in the record. PuppyQ tracks placement, not availability —
 * there is no 'available' — so the labels stop at what's true.
 *
 * 'retained' and 'reserved' count as in-program: the record uses them for
 * puppies the farm kept and puppies not yet gone to their family, and reading
 * them as "unknown" left every litter looking finished the moment its first
 * puppies were placed. 'transferred' stays unknown — that dog left for another
 * program, which is neither a placement with a family nor a puppy still here.
 */
export function pqPuppyStanding(puppy: PqDog): PqPuppyStanding {
  const status = (puppy.status ?? "").toLowerCase();
  if (status === "placed") return "placed";
  if (status === "active" || status === "retained" || status === "reserved") return "in-program";
  return "unknown";
}

function monthsAgo(iso: string | null, now: Date): number {
  if (!iso) return Number.POSITIVE_INFINITY;
  const then = new Date(`${iso}T00:00:00Z`);
  if (Number.isNaN(then.getTime())) return Number.POSITIVE_INFINITY;
  return (now.getFullYear() - then.getFullYear()) * 12 + (now.getMonth() - then.getMonth());
}

const CURRENT_WINDOW_MONTHS = 12;

export function pqCurrentLitters(pq: PuppyQ, now = new Date()): PqLitter[] {
  return pq.litters.filter(
    (l) =>
      monthsAgo(l.birthdate, now) <= CURRENT_WINDOW_MONTHS &&
      l.puppies.some((p) => pqPuppyStanding(p) === "in-program"),
  );
}

export function pqPastLitters(pq: PuppyQ, now = new Date()): PqLitter[] {
  const current = new Set(pqCurrentLitters(pq, now).map((l) => l.id));
  return pq.litters.filter((l) => !current.has(l.id));
}

export function pqLittersByYear(litters: PqLitter[]): { year: number; litters: PqLitter[] }[] {
  const groups = new Map<number, PqLitter[]>();
  for (const litter of litters) {
    const year = litter.year ?? 0;
    (groups.get(year) ?? (groups.set(year, []), groups.get(year)!)).push(litter);
  }
  return [...groups.entries()]
    .sort((a, b) => b[0] - a[0])
    .map(([year, ls]) => ({ year, litters: ls }));
}

// ─── Org resolution ───────────────────────────────────────────────────────────

const ADAMS_FARM_NAME = "adams farm labradoodles";

async function resolveOrg(
  supabase: NonNullable<ReturnType<typeof getSupabase>>,
  errors: string[],
): Promise<{ id: string | null; name: string | null; candidates: PqOrg[] }> {
  const override = process.env.ADAMS_FARM_ORG_ID;
  if (override) return { id: override, name: "(from ADAMS_FARM_ORG_ID)", candidates: [] };

  const { data, error } = await supabase.from("organizations").select("id,name,kennel_name");
  if (error) {
    errors.push(`organizations: ${error.message}`);
    return { id: null, name: null, candidates: [] };
  }

  const orgs = (data ?? []) as PqOrg[];
  const norm = (s: string | null) => (s ?? "").trim().toLowerCase();

  const match =
    orgs.find((o) => norm(o.name) === ADAMS_FARM_NAME) ??
    orgs.find((o) => /^adams\s+farm\b/i.test((o.name ?? "").trim()));

  if (!match) {
    errors.push(
      `No organization named "Adams Farm Labradoodles" found. Set ADAMS_FARM_ORG_ID to pin the id.`,
    );
  }

  return { id: match?.id ?? null, name: match?.name ?? null, candidates: orgs };
}

// ─── Main fetch ───────────────────────────────────────────────────────────────

const DOG_COLS =
  "id,call_name,registered_name,organization_id,sex,status,breed,color,birthdate,notes,sire_id,dam_id,sire_name,dam_name,litter_id";
const LITTER_COLS = "id,name,sire_name,whelp_date,organization_id,notes,dam_id,sire_id";

/**
 * Fetch the Adams Farm slice of PuppyQ. `cache()` dedupes across a single render
 * so multiple page sections make exactly one round trip.
 */
export const getPuppyQ = cache(async function getPuppyQ(): Promise<PuppyQ> {
  const errors: string[] = [];

  const empty = (extra: Partial<PuppyQ["diagnostics"]> = {}): PuppyQ => ({
    orgId: null,
    dogs: [],
    allDogs: [],
    litters: [],
    diagnostics: {
      keyKind: supabaseKeyKind,
      url: supabaseUrl,
      orgId: null,
      orgName: null,
      dogRows: 0,
      litterRows: 0,
      errors,
      ...extra,
    },
  });

  const supabase = getSupabase();
  if (!supabase) {
    errors.push("Supabase not configured — set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.");
    return empty();
  }

  const org = await resolveOrg(supabase, errors);
  if (!org.id) {
    return empty({ orgId: null, orgName: null });
  }

  const [dogsRes, littersRes] = await Promise.all([
    supabase.from("dogs").select(DOG_COLS),
    supabase.from("litters").select(LITTER_COLS),
  ]);

  if (dogsRes.error) errors.push(`dogs: ${dogsRes.error.message}`);
  if (littersRes.error) errors.push(`litters: ${littersRes.error.message}`);

  const allDogs = (dogsRes.data ?? []) as unknown as PqDog[];
  const litterRows = (littersRes.data ?? []) as unknown as PqLitterRow[];

  const orgId = org.id;
  const dogs = allDogs.filter((d) => d.organization_id === orgId);
  const byId = new Map(allDogs.map((d) => [d.id, d]));
  const ours = new Set(dogs.map((d) => d.id));

  // A litter belongs to Adams Farm when the org owns it OR one of its parents is ours
  // (the latter captures co-litters, e.g. the Spring 2026 litter with Legend Manor).
  const litters: PqLitter[] = litterRows
    .filter(
      (l) =>
        l.organization_id === orgId ||
        (l.dam_id != null && ours.has(l.dam_id)) ||
        (l.sire_id != null && ours.has(l.sire_id)),
    )
    .map((row) => {
      const dam = row.dam_id ? (byId.get(row.dam_id) ?? null) : null;
      const sire = row.sire_id ? (byId.get(row.sire_id) ?? null) : null;
      const solo = row.organization_id === orgId;
      return {
        row,
        id: row.id,
        type: solo ? ("solo" as const) : ("co-litter" as const),
        coProgram: solo ? null : null, // partner name not resolved for now
        year: row.whelp_date ? Number(row.whelp_date.slice(0, 4)) : null,
        birthdate: row.whelp_date,
        dam,
        sire,
        sireName: sire ? pqName(sire) : row.sire_name,
        damName: dam ? pqName(dam) : (row.name ?? null),
        puppies: allDogs.filter((d) => d.litter_id === row.id),
      };
    })
    .sort((a, b) => (b.birthdate ?? "").localeCompare(a.birthdate ?? ""));

  return {
    orgId,
    dogs,
    allDogs,
    litters,
    diagnostics: {
      keyKind: supabaseKeyKind,
      url: supabaseUrl,
      orgId,
      orgName: org.name,
      dogRows: dogs.length,
      litterRows: litters.length,
      errors,
    },
  };
});
