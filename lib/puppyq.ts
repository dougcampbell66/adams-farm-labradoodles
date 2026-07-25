// PuppyQ data layer for Adams Farm Labradoodles.
//
// Mirrors the pattern in Legend Manor's src/lib/puppyq.ts — fetches the whole
// PuppyQ record once per render (deduped by React cache), then derives the
// Adams Farm slice by organization_id. Server-only.
//
// Schema notes (same as Legend Manor):
//   • No `puppies` table — a puppy is a `dogs` row with a litter_id.
//   • `status` values: 'active' | 'placed'. Nothing else.
//   • `sex` is null on most rows — inferred from litter parentage.

import { cache } from "react";
import { getSupabase, supabaseKeyKind, supabaseUrl } from "@/lib/supabase";
import { pqDogPhoto, pqDogGallery } from "@/lib/images-pq";

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

/** The distinctive part of a registered name: "Adams Farm's Silas" → "Silas". */
export function pqShortName(dog: PqDog): string {
  const call = dog.call_name?.trim();
  if (call) return call;
  const reg = dog.registered_name?.trim();
  if (!reg) return "Unnamed dog";
  const apostrophe = reg.match(/^.*?['']s\s+(.+)$/);
  return apostrophe ? apostrophe[1] : reg;
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

export function pqGallery(dog: PqDog): string[] {
  const candidates: string[] = [];
  if (dog.call_name) candidates.push(slugify(dog.call_name));
  if (dog.registered_name) candidates.push(slugify(dog.registered_name));
  for (const slug of candidates) {
    const g = pqDogGallery(slug);
    if (g.length) return g;
  }
  return [];
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

// ─── Dog tiers ────────────────────────────────────────────────────────────────

function pqIsProducer(dog: PqDog, litters: PqLitter[]): boolean {
  return litters.some((l) => l.row.dam_id === dog.id || l.row.sire_id === dog.id);
}

/** Split our dogs into active (producing), retired (past producer), retained (young stock). */
export function pqDogTiers(pq: PuppyQ) {
  const { dogs, litters } = pq;
  const isActive = (d: PqDog) => (d.status ?? "").toLowerCase() === "active";
  const active: PqDog[] = [];
  const retired: PqDog[] = [];
  const retained: PqDog[] = [];
  for (const dog of dogs) {
    const producer = pqIsProducer(dog, litters);
    if (isActive(dog) && producer) active.push(dog);
    else if (producer) retired.push(dog);
    else if (isActive(dog)) retained.push(dog);
  }
  const byAge = (a: PqDog, b: PqDog) =>
    (a.birthdate ?? "9999").localeCompare(b.birthdate ?? "9999") ||
    pqName(a).localeCompare(pqName(b));
  return {
    active: active.sort(byAge),
    retired: retired.sort(byAge),
    retained: retained.sort(byAge),
  };
}

// ─── Puppy helpers ────────────────────────────────────────────────────────────

export type PqPuppyStanding = "placed" | "in-program" | "unknown";

export function pqPuppyStanding(puppy: PqDog): PqPuppyStanding {
  const status = (puppy.status ?? "").toLowerCase();
  if (status === "placed") return "placed";
  if (status === "active") return "in-program";
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
