// A dog's public address — pawsq DECISIONS-2026-11-05 R5. The same file on
// every breeder site (as lib/card-photo.ts is); change the ruling, then
// every copy.
//
//   /dogs/<registered-name>-MM-DD-YYYY     e.g. shadow-mountains-ginger-05-14-2019
//
// The registered name is ALAA's and never changes, and a puppy is given one
// before ALAA registers it. No birthdate on file: the name alone. No
// registered name yet: the dog's id, until one is entered. Two dogs that
// would share an address both keep their ids rather than one taking it.
//
// Every older address still resolves (resolveDogParam): the id, a
// registered name without its date, the old WordPress /dog/<slug>, and a
// call name that names exactly one dog. Those answer with a redirect to the
// current address, so a link that was ever shared keeps working.
//
// Pure: no database, no framework. Derived at render from the record.

export type DogUrlInput = {
  id: string;
  registered_name: string | null;
  call_name?: string | null;
  birthdate: string | null;
};

/** Lowercase, apostrophes dropped, every other non-alphanumeric run → "-". */
export function slugify(text: string): string {
  return text
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/['’‘`]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** Letters and digits only — how an old, differently-punctuated slug is matched. */
function compact(text: string): string {
  return slugify(text).replace(/-/g, "");
}

/** "2019-05-14" → "05-14-2019"; anything else → null. */
function mdy(iso: string | null): string | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso ?? "");
  return m ? `${m[2]}-${m[3]}-${m[1]}` : null;
}

/** The address this dog would have by the rule, before collisions; null without a registered name. */
export function dogSlugCandidate(dog: DogUrlInput): string | null {
  const name = slugify(dog.registered_name ?? "");
  if (!name) return null;
  const date = mdy(dog.birthdate);
  return date ? `${name}-${date}` : name;
}

export type DogUrlIndex = {
  /** dog id → its path segment (slug, or the id itself). */
  segmentById: Map<string, string>;
  /** slug → dog id, for the slugs that are actually in use. */
  idBySlug: Map<string, string>;
  dogs: Map<string, DogUrlInput>;
};

/** Every dog's segment, with collisions resolved to ids. Build once per render. */
export function buildDogUrlIndex(dogs: DogUrlInput[]): DogUrlIndex {
  const bySlug = new Map<string, string[]>();
  for (const d of dogs) {
    const s = dogSlugCandidate(d);
    if (!s) continue;
    bySlug.set(s, [...(bySlug.get(s) ?? []), d.id]);
  }
  const segmentById = new Map<string, string>();
  const idBySlug = new Map<string, string>();
  for (const d of dogs) {
    const s = dogSlugCandidate(d);
    if (s && bySlug.get(s)!.length === 1) {
      segmentById.set(d.id, s);
      idBySlug.set(s, d.id);
    } else {
      segmentById.set(d.id, d.id);
    }
  }
  return { segmentById, idBySlug, dogs: new Map(dogs.map((d) => [d.id, d])) };
}

/** The path segment for a dog: its slug, else its id. */
export function dogSegment(index: DogUrlIndex, id: string): string {
  return index.segmentById.get(id) ?? id;
}

export type DogResolution =
  | { kind: "found"; id: string }
  | { kind: "redirect"; id: string; segment: string }
  | { kind: "missing" };

/**
 * What a /dogs/<param> request means. "found" when param is the dog's current
 * segment; "redirect" when it is an older address of exactly one dog.
 */
export function resolveDogParam(index: DogUrlIndex, rawParam: string): DogResolution {
  let param = rawParam;
  try {
    param = decodeURIComponent(rawParam);
  } catch {
    // keep it as it came
  }
  param = param.trim().replace(/\/+$/, "");
  const lower = param.toLowerCase();

  const bySlug = index.idBySlug.get(lower);
  if (bySlug) {
    return lower === param ? { kind: "found", id: bySlug } : redirect(index, bySlug);
  }

  if (index.dogs.has(param)) {
    const seg = dogSegment(index, param);
    return seg === param ? { kind: "found", id: param } : redirect(index, param);
  }

  // Older forms: registered name without its date (any punctuation), then a
  // call name — each only when it names exactly one dog.
  const key = compact(param);
  if (!key) return { kind: "missing" };
  for (const field of ["registered_name", "call_name"] as const) {
    const hits = [...index.dogs.values()].filter((d) => {
      const v = d[field];
      return v ? compact(v) === key : false;
    });
    if (hits.length === 1) return redirect(index, hits[0].id);
    if (hits.length > 1) return { kind: "missing" };
  }
  return { kind: "missing" };
}

function redirect(index: DogUrlIndex, id: string): DogResolution {
  return { kind: "redirect", id, segment: dogSegment(index, id) };
}
