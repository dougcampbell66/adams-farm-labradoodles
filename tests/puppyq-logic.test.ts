// Unit tests for the pure PuppyQ display logic (no network / no database).
//
// These guard the derivations that decide what shows on /dams, /sires,
// /litters, and /our-puppies — who earns a place on a breeding-lines page,
// and which of the record's several statuses mean a dog or puppy is still in
// the program. The live connection is covered separately by
// scripts/puppyq-smoke.mjs.

import { describe, it, expect } from "vitest";
import {
  pqName,
  pqShortName,
  pqSex,
  pqRole,
  pqBreedingLines,
  pqLitterIsOurs,
  pqPuppyStanding,
  pqPuppyOffered,
  pqAvailablePuppies,
  pqCoBreeders,
  pqCurrentLitters,
  pqLitterTitle,
  pqOwnLitters,
  type PqDog,
  type PqLitter,
} from "@/lib/puppyq";

function dog(over: Partial<PqDog> & { id: string }): PqDog {
  return {
    call_name: null,
    registered_name: null,
    organization_id: "org",
    sex: null,
    status: "active",
    breed: null,
    color: null,
    birthdate: null,
    notes: null,
    sire_id: null,
    dam_id: null,
    sire_name: null,
    dam_name: null,
    litter_id: null,
    ...over,
  };
}

function litter(id: string, dam_id: string | null, sire_id: string | null, whelp: string): PqLitter {
  return {
    row: { id, name: null, sire_name: null, whelp_date: whelp, organization_id: "org", notes: null, dam_id, sire_id, theme: null, source: null },
    id,
    type: "solo",
    coProgram: null,
    year: Number(whelp.slice(0, 4)),
    birthdate: whelp,
    dam: null,
    sire: null,
    sireName: null,
    damName: null,
    puppies: [],
  };
}

describe("pqName / pqShortName", () => {
  it("prefers the call name", () => {
    expect(pqName(dog({ id: "1", call_name: "Macy", registered_name: "Adams Farm's Macy" }))).toBe("Macy");
  });
  it("falls back to registered name, and shortens it", () => {
    const d = dog({ id: "1", registered_name: "Adams Farm's Silas" });
    expect(pqName(d)).toBe("Adams Farm's Silas");
    expect(pqShortName(d)).toBe("Silas");
  });
  it("shortens the possessive-free kennel prefix the live record uses", () => {
    expect(pqShortName(dog({ id: "1", registered_name: "Adams Farm Madison" }))).toBe("Madison");
    expect(pqShortName(dog({ id: "1", registered_name: "Legend Manor Prancer" }))).toBe("Prancer");
  });
  it("leaves an unrelated registered name alone", () => {
    expect(pqShortName(dog({ id: "1", registered_name: "Tarheel's Knox" }))).toBe("Knox");
    expect(pqShortName(dog({ id: "1", registered_name: "Prancer" }))).toBe("Prancer");
  });
  it("handles a dog with no names", () => {
    expect(pqName(dog({ id: "1" }))).toBe("Unnamed dog");
  });
});

describe("pqSex — inferred from litter parentage when unset", () => {
  const macy = dog({ id: "A", call_name: "Macy" });
  const silas = dog({ id: "B", call_name: "Silas" });
  const litters = [litter("L1", "A", "B", "2026-05-01")];
  it("infers female from being a dam", () => {
    expect(pqSex(macy, litters)).toBe("female");
    expect(pqRole(macy, litters)).toBe("Dam");
  });
  it("infers male from being a sire", () => {
    expect(pqSex(silas, litters)).toBe("male");
    expect(pqRole(silas, litters)).toBe("Sire");
  });
  it("respects an explicit sex value", () => {
    expect(pqSex(dog({ id: "C", sex: "Female" }), [])).toBe("female");
  });
  it("returns null when unknown", () => {
    expect(pqSex(dog({ id: "C" }), [])).toBeNull();
  });
});

describe("pqBreedingLines — who earns a place on /dams and /sires", () => {
  // Statuses here mirror the live record, which uses more than 'active'/'placed'.
  const macy = dog({ id: "A", call_name: "Macy", status: "retained" }); // still in the program
  const winnie = dog({ id: "W", call_name: "Winnie", status: "retired" });
  const silas = dog({ id: "B", call_name: "Silas", status: "retained" });
  const holly = dog({ id: "H", call_name: "Holly", status: "active", organization_id: "other" });
  const prospect = dog({ id: "P", call_name: "Prospect", status: "active" }); // no litter yet

  const withParents = (
    l: PqLitter,
    dam: PqDog | null,
    sire: PqDog | null,
    sireName: string | null = null,
  ): PqLitter => ({
    ...l,
    dam,
    sire,
    damName: dam ? pqName(dam) : null,
    sireName: sire ? pqName(sire) : sireName,
  });

  const pq = {
    orgId: "org",
    dogs: [macy, winnie, silas, prospect],
    allDogs: [macy, winnie, silas, holly, prospect],
    litters: [
      withParents(litter("L1", "A", "B", "2026-02-04"), macy, silas),
      withParents(litter("L2", "W", "B", "2025-08-03"), winnie, silas),
      // Co-litter: the dam belongs to a partner program, the sire is name-only.
      withParents(litter("L3", "H", null, "2026-05-18"), holly, null, "Tarheel's Knox"),
    ],
    breedingRightDogIds: new Set<string>(),
    rightHoldersByDog: {},
    orgNames: {},
    diagnostics: { keyKind: "secret", url: null, orgId: "org", orgName: null, dogRows: 4, litterRows: 3, errors: [] },
  };

  const { dams, sires } = pqBreedingLines(pq);

  it("lists a dam once she has whelped a litter, whatever her status", () => {
    expect(dams.producing.map((e) => e.name)).toContain("Macy");
    expect(dams.retired.map((e) => e.name)).toContain("Winnie");
  });
  it("treats 'retained' as still in the program, not retired", () => {
    // The live record marks working parents 'retained'; filing them under
    // "Foundation & Retired" would misreport the program.
    expect(sires.producing.map((e) => e.name)).toContain("Silas");
    expect(sires.retired.map((e) => e.name)).not.toContain("Silas");
  });
  it("keeps a dog with no litter off both pages", () => {
    const everyone = [...dams.producing, ...dams.retired, ...sires.producing, ...sires.retired];
    expect(everyone.map((e) => e.name)).not.toContain("Prospect");
  });
  it("counts every litter a sire produced, without duplicating him", () => {
    const silasEntries = sires.producing.filter((e) => e.name === "Silas");
    expect(silasEntries).toHaveLength(1);
    expect(silasEntries[0].litterCount).toBe(2);
  });
  it("does not flag a shared stud we hold a breeding right on as outside", () => {
    // Gate: bred of record elsewhere, breeds for both programs. His home row is
    // another program's, but the recorded breeding right makes him ours.
    const gate = dog({ id: "G", call_name: "Gate", status: "active", organization_id: "other" });
    const withGate = {
      ...pq,
      allDogs: [...pq.allDogs, gate],
      litters: [...pq.litters, withParents(litter("L4", "A", "G", "2026-08-19"), macy, gate)],
      breedingRightDogIds: new Set(["G"]),
      rightHoldersByDog: {},
      orgNames: {},
    };
    const gateEntry = pqBreedingLines(withGate).sires.producing.find((e) => e.dog?.id === "G");
    expect(gateEntry?.outside).toBe(false);
  });

  it("flags a partner program's dam as outside", () => {
    const hollyEntry = dams.producing.find((e) => e.name === "Holly");
    expect(hollyEntry?.outside).toBe(true);
    expect(dams.producing.find((e) => e.name === "Macy")?.outside).toBe(false);
  });
  it("keeps a sire the record knows only by name in his own tier", () => {
    expect(sires.nameOnly.map((e) => e.name)).toEqual(["Tarheel's Knox"]);
    expect(sires.producing.map((e) => e.name)).not.toContain("Tarheel's Knox");
  });
});

describe("pqPuppyStanding", () => {
  it("maps each status the record writes to its own standing", () => {
    expect(pqPuppyStanding(dog({ id: "1", status: "placed" }))).toBe("placed");
    expect(pqPuppyStanding(dog({ id: "1", status: "active" }))).toBe("in-program");
    expect(pqPuppyStanding(dog({ id: "1", status: "available" }))).toBe("available");
    expect(pqPuppyStanding(dog({ id: "1", status: "reserved" }))).toBe("reserved");
    expect(pqPuppyStanding(dog({ id: "1", status: "retained" }))).toBe("retained");
    expect(pqPuppyStanding(dog({ id: "1", status: null }))).toBe("unknown");
  });
  it("does not call a transferred dog placed", () => {
    expect(pqPuppyStanding(dog({ id: "1", status: "transferred" }))).toBe("unknown");
  });
  it("offers available, reserved and active puppies — not retained, placed or unknown", () => {
    const offered = (status: string | null) => pqPuppyOffered(dog({ id: "1", status }));
    expect(offered("available")).toBe(true);
    expect(offered("reserved")).toBe(true);
    expect(offered("active")).toBe(true);
    expect(offered("retained")).toBe(false);
    expect(offered("placed")).toBe(false);
    expect(offered(null)).toBe(false);
  });
});

describe("pqAvailablePuppies — the home page's cards", () => {
  const now = new Date("2026-09-12T12:00:00Z");
  const pup = (id: string, litter_id: string, status: string | null, call_name: string) =>
    dog({ id, litter_id, status, call_name });
  const withPups = (l: PqLitter, puppies: PqDog[]): PqLitter => ({ ...l, puppies });
  const pq = {
    orgId: "org",
    dogs: [],
    allDogs: [],
    litters: [
      // A three-week-old litter whose puppies carry 'available', not 'active'.
      withPups(litter("L1", "A", "B", "2026-08-19"), [
        pup("p1", "L1", "available", "Max"),
        pup("p2", "L1", "retained", "Sadie"),
        pup("p3", "L1", "placed", "Rocky"),
      ]),
      // Last year's litter: outside the window, whatever its statuses say.
      withPups(litter("L2", "A", "B", "2025-01-08"), [pup("p4", "L2", "available", "Old")]),
      // Every puppy placed: not current.
      withPups(litter("L3", "A", "B", "2026-05-18"), [pup("p5", "L3", "placed", "Gone")]),
      // Only a retained puppy left: staying, not offered, so not current.
      withPups(litter("L4", "A", "B", "2026-02-24"), [pup("p6", "L4", "retained", "Kept")]),
      // Only a reserved puppy left: spoken for, not Available, so not current.
      withPups(litter("L5", "A", "B", "2026-07-01"), [pup("p7", "L5", "reserved", "Bea")]),
      // An older current litter than L1: it leads.
      withPups(litter("L6", "A", "B", "2026-06-10"), [pup("p8", "L6", "available", "Ada")]),
    ],
    breedingRightDogIds: new Set<string>(),
    rightHoldersByDog: {},
    orgNames: {},
    diagnostics: { keyKind: "secret", url: null, orgId: "org", orgName: null, dogRows: 0, litterRows: 6, errors: [] },
  };

  it("counts a recent litter as current only while it has an Available puppy, oldest first", () => {
    expect(pqCurrentLitters(pq, now).map((l) => l.id)).toEqual(["L6", "L1"]);
  });
  it("lists only the puppies listed Available, with their litter", () => {
    const names = pqAvailablePuppies(pq, now).map((e) => `${e.puppy.call_name}@${e.litter.id}`);
    expect(names).toEqual(["Ada@L6", "Max@L1"]);
  });
});

describe("pqLitterTitle — a litter's heading on the Puppies page", () => {
  const base = litter("L1", null, null, "2026-10-19");
  const withRow = (row: Partial<PqLitter["row"]>): PqLitter => ({
    ...base,
    damName: "Lia",
    sireName: "Gate",
    row: { ...base.row, ...row },
  });
  it("uses the naming theme first", () => {
    expect(pqLitterTitle(withRow({ theme: "Elf", name: "Other", source: "puppyq-app" }))).toBe("Elf");
  });
  it("uses the name a breeder typed in the app when no theme is set", () => {
    expect(pqLitterTitle(withRow({ name: "The White Album", source: "puppyq-app" }))).toBe("The White Album");
  });
  it("ignores an imported litter's generated name, falling back to dam × sire", () => {
    expect(pqLitterTitle(withRow({ name: "Legend Manor's Holly 2026-05-18", source: "alaa" }))).toBe("Lia × Gate");
  });
});

describe("pqCoBreeders — the partner program a litter is co-bred with", () => {
  const pq = {
    orgId: "AF",
    orgNames: { AF: "Adams Farm Labradoodles", LM: "Legend Manor Labradoodles", K: "Outside Kennel" },
    // Gate's right is held by both programs; Macy's by ours alone.
    rightHoldersByDog: { GATE: ["AF", "LM"], MACY: ["AF"] } as Record<string, string[]>,
  };
  const withOrg = (org: string, dam: string | null, sire: string | null): PqLitter => {
    const l = litter("L", dam, sire, "2026-08-19");
    return { ...l, row: { ...l.row, organization_id: org } };
  };
  it("names the partner holding a right on a parent of our own litter", () => {
    expect(pqCoBreeders(withOrg("AF", "MACY", "GATE"), pq)).toEqual(["Legend Manor Labradoodles"]);
  });
  it("names the program whose litter it is", () => {
    expect(pqCoBreeders(withOrg("LM", "LIA", "GATE"), pq)).toEqual(["Legend Manor Labradoodles"]);
  });
  it("names no one for our own litter with no shared parent", () => {
    expect(pqCoBreeders(withOrg("AF", "MACY", "KNOX"), pq)).toEqual([]);
  });
});

describe("pqOwnLitters — the litters the site counts", () => {
  const at = (id: string, org: string): PqLitter => {
    const l = litter(id, null, null, "2026-08-19");
    return { ...l, row: { ...l.row, organization_id: org } };
  };
  it("keeps only the litters registered to this breeder, not a partner's co-litter", () => {
    const pq = { orgId: "AF", litters: [at("A", "AF"), at("B", "LM"), at("C", "AF")] };
    expect(pqOwnLitters(pq).map((l) => l.id)).toEqual(["A", "C"]);
  });
  it("counts nothing when the breeder is not resolved", () => {
    expect(pqOwnLitters({ orgId: null, litters: [at("A", "AF")] })).toEqual([]);
  });
});

describe("pqLitterIsOurs — which litters are on the record", () => {
  const ours = new Set(["A", "B"]);
  const rights = new Set(["G"]);
  const row = (organization_id: string, dam_id: string | null, sire_id: string | null) => ({
    organization_id,
    dam_id,
    sire_id,
  });

  it("includes a litter the farm registered, whoever the parents are", () => {
    expect(pqLitterIsOurs(row("org", "X", "Y"), "org", ours, rights)).toBe(true);
  });

  it("includes a partner's litter when a dog of ours is a parent", () => {
    expect(pqLitterIsOurs(row("other", "A", null), "org", ours, rights)).toBe(true);
  });

  it("includes a partner's litter sired by a stud we hold a breeding right on", () => {
    // Holly × Gate: registered to Legend Manor, Gate breeds for both programs.
    expect(pqLitterIsOurs(row("other", "H", "G"), "org", ours, rights)).toBe(true);
  });

  it("leaves a partner's litter alone when no parent is in our program", () => {
    expect(pqLitterIsOurs(row("other", "H", "K"), "org", ours, rights)).toBe(false);
  });

  it("treats a missing parent as not ours rather than crashing", () => {
    expect(pqLitterIsOurs(row("other", null, null), "org", ours, rights)).toBe(false);
  });
});
