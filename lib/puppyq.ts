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
  /**
   * Dogs Adams Farm holds a recorded right to breed (pawsq `breeding_rights`,
   * migration 37) — breeding-program membership itself, by Douglas's ruling of
   * 2026-08-17. Distinct from `dogs`: a shared stud like Gate or Silas is bred
   * of record elsewhere and breeds for both programs, so his home row is not
   * ours but his right is.
   */
  breedingRightDogIds: Set<string>;
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

// ─── Media (the database's photos) ───────────────────────────────────────────

/** One media row, as fetched for photo resolution. */
interface PqMediaRow {
  dog_id: string | null;
  bucket: string;
  storage_path: string;
  kind: string;
  label: string | null;
  sort: number;
}

/**
 * Best photo per dog from the media table — the same Supabase Storage rows
 * Legend Manor's site reads, so one upload (through that site's dashboard)
 * shows on both. Rebuilt on every fetch; module-level so the synchronous
 * pqPuppyPhoto() call sites in server components stay simple.
 */
let mediaPhotoByDogId: Record<string, string> = {};

function storageUrl(bucket: string, path: string): string {
  return `${supabaseUrl}/storage/v1/object/public/${bucket}/${path}`;
}

/**
 * Preference mirrors Legend Manor's reader: portraits before gallery shots,
 * then the highest label (numeric-aware, so "molly-8wk" < "molly-10wk" and
 * the latest age wins). On any error the map is emptied and puppies render
 * without photos — visible, never papered over.
 */
async function fetchMediaPhotoMap(
  supabase: NonNullable<ReturnType<typeof getSupabase>>,
): Promise<string | null> {
  const { data, error } = await supabase
    .from("media")
    .select("dog_id,bucket,storage_path,kind,label,sort");
  if (error || !data) {
    mediaPhotoByDogId = {};
    return error ? `media: ${error.message}` : null;
  }
  const score = (m: PqMediaRow) => (m.kind === "portrait" ? 0 : 1);
  const best: Record<string, PqMediaRow> = {};
  for (const row of data as unknown as PqMediaRow[]) {
    if (!row.dog_id) continue;
    const cur = best[row.dog_id];
    if (
      !cur ||
      score(row) < score(cur) ||
      (score(row) === score(cur) &&
        (row.label ?? "").localeCompare(cur.label ?? "", undefined, { numeric: true }) > 0)
    ) {
      best[row.dog_id] = row;
    }
  }
  mediaPhotoByDogId = Object.fromEntries(
    Object.entries(best).map(([id, m]) => [id, storageUrl(m.bucket, m.storage_path)]),
  );
  return null;
}

/** The database's photo for a dog id, if the media table holds one. */
export function pqMediaPhoto(dogId: string): string | null {
  return mediaPhotoByDogId[dogId] ?? null;
}

/**
 * A puppy's photo comes from the media table and nowhere else. No file in
 * this repo stands in for it: a puppy without an upload shows a placeholder,
 * so a missing photo is visible rather than quietly papered over.
 */
export function pqPuppyPhoto(puppy: PqDog): string | null {
  return pqMediaPhoto(puppy.id);
}

/**
 * Photo for a grown dog: the media table first, then the photos bundled in
 * public/images/dogs by call name then registered name.
 */
export function pqPhoto(dog: PqDog): string | null {
  const fromMedia = pqMediaPhoto(dog.id);
  if (fromMedia) return fromMedia;
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
  // In the program: a dog of ours, or one we hold a breeding right on. A shared
  // stud is not "outside" just because his home row is another program's.
  const ours = new Set([...pq.dogs.map((d) => d.id), ...pq.breedingRightDogIds]);

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

export type PqPuppyStanding =
  | "available"
  | "reserved"
  | "retained"
  | "placed"
  | "in-program"
  | "unknown";

/**
 * A puppy's standing, read from the free-form `status` column. The record
 * writes 'available', 'reserved', 'retained', 'placed', 'transferred' and
 * 'active'; each that says something about placement gets its own standing
 * so a card can say exactly that. Anything else, null included, is unknown.
 * 'transferred' stays unknown — that dog left for another program, which is
 * neither a placement with a family nor a puppy still here.
 */
export function pqPuppyStanding(puppy: PqDog): PqPuppyStanding {
  const status = (puppy.status ?? "").toLowerCase().trim();
  if (status === "available") return "available";
  if (status === "reserved") return "reserved";
  if (status === "retained") return "retained";
  if (status === "placed") return "placed";
  if (status === "active") return "in-program";
  return "unknown";
}

/** True unless the record says this puppy has gone home. */
export function pqPuppyNotPlaced(puppy: PqDog): boolean {
  return pqPuppyStanding(puppy) !== "placed";
}

/**
 * True when the record says a family can ask about this puppy: available,
 * reserved (a place may open), or simply active in the program. A retained
 * puppy is staying, a placed one has gone, and an unmapped status says
 * nothing — none of those belongs under an "Available Puppies" heading.
 */
export function pqPuppyOffered(puppy: PqDog): boolean {
  const s = pqPuppyStanding(puppy);
  return s === "available" || s === "reserved" || s === "in-program";
}

function monthsAgo(iso: string | null, now: Date): number {
  if (!iso) return Number.POSITIVE_INFINITY;
  const then = new Date(`${iso}T00:00:00Z`);
  if (Number.isNaN(then.getTime())) return Number.POSITIVE_INFINITY;
  return (now.getFullYear() - then.getFullYear()) * 12 + (now.getMonth() - then.getMonth());
}

const CURRENT_WINDOW_MONTHS = 12;

/** Whelped within the window and still holding a puppy not marked placed. */
export function pqCurrentLitters(pq: PuppyQ, now = new Date()): PqLitter[] {
  return pq.litters.filter(
    (l) =>
      monthsAgo(l.birthdate, now) <= CURRENT_WINDOW_MONTHS &&
      l.puppies.some(pqPuppyNotPlaced),
  );
}

/**
 * Puppies the record offers from current litters, newest litter first —
 * the home page's Available Puppies. Each carries its litter so a card can
 * say where it comes from. Offered puppies first within a litter, by name.
 */
export function pqAvailablePuppies(
  pq: PuppyQ,
  now = new Date(),
): { puppy: PqDog; litter: PqLitter }[] {
  return pqCurrentLitters(pq, now).flatMap((litter) =>
    [...litter.puppies]
      .filter(pqPuppyOffered)
      .sort((a, b) => pqShortName(a).localeCompare(pqShortName(b)))
      .map((puppy) => ({ puppy, litter })),
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
const BREEDING_RIGHT_COLS = "organization_id,dog_id";

/**
 * WHICH LITTERS ARE ON THE ADAMS FARM RECORD. A litter is ours when the farm
 * registered it, OR a parent is in our breeding program — a dog of ours, or a
 * dog we hold a breeding right on. The second clause is how co-litters with a
 * partner program appear, and the breeding right is what makes it work for a
 * shared stud: Holly × Gate is registered to Legend Manor, and Gate's home row
 * is not ours, but Adams Farm holds the right to breed him, so the litter
 * belongs on this record too. (Legend Manor's site applies the same rule.)
 */
export function pqLitterIsOurs(
  l: Pick<PqLitterRow, "organization_id" | "dam_id" | "sire_id">,
  orgId: string,
  ourDogIds: Set<string>,
  breedingRightDogIds: Set<string>,
): boolean {
  const inProgram = (id: string | null) =>
    id != null && (ourDogIds.has(id) || breedingRightDogIds.has(id));
  return l.organization_id === orgId || inProgram(l.dam_id) || inProgram(l.sire_id);
}

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
    breedingRightDogIds: new Set(),
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

  // The media map rides along so puppy photos come from the database.
  const [dogsRes, littersRes, rightsRes, mediaError] = await Promise.all([
    supabase.from("dogs").select(DOG_COLS),
    supabase.from("litters").select(LITTER_COLS),
    supabase.from("breeding_rights").select(BREEDING_RIGHT_COLS),
    fetchMediaPhotoMap(supabase),
  ]);

  if (dogsRes.error) errors.push(`dogs: ${dogsRes.error.message}`);
  if (littersRes.error) errors.push(`litters: ${littersRes.error.message}`);
  if (rightsRes.error) errors.push(`breeding_rights: ${rightsRes.error.message}`);
  if (mediaError) errors.push(mediaError);

  const allDogs = (dogsRes.data ?? []) as unknown as PqDog[];
  const litterRows = (littersRes.data ?? []) as unknown as PqLitterRow[];

  const orgId = org.id;
  const dogs = allDogs.filter((d) => d.organization_id === orgId);
  const byId = new Map(allDogs.map((d) => [d.id, d]));
  const ours = new Set(dogs.map((d) => d.id));

  const breedingRightDogIds = new Set(
    ((rightsRes.data ?? []) as { organization_id: string; dog_id: string }[])
      .filter((r) => r.organization_id === orgId)
      .map((r) => r.dog_id),
  );

  const litters: PqLitter[] = litterRows
    .filter((l) => pqLitterIsOurs(l, orgId, ours, breedingRightDogIds))
    .map((row) => {
      const dam = row.dam_id ? (byId.get(row.dam_id) ?? null) : null;
      const sire = row.sire_id ? (byId.get(row.sire_id) ?? null) : null;
      const solo = row.organization_id === orgId;
      const partner = org.candidates.find((o) => o.id === row.organization_id);
      return {
        row,
        id: row.id,
        type: solo ? ("solo" as const) : ("co-litter" as const),
        coProgram: solo ? null : (partner?.name ?? null),
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
    breedingRightDogIds,
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
