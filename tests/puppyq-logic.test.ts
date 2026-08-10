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
  pqPuppyStanding,
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
    row: { id, name: null, sire_name: null, whelp_date: whelp, organization_id: "org", notes: null, dam_id, sire_id },
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
  it("maps status to standing", () => {
    expect(pqPuppyStanding(dog({ id: "1", status: "placed" }))).toBe("placed");
    expect(pqPuppyStanding(dog({ id: "1", status: "active" }))).toBe("in-program");
    expect(pqPuppyStanding(dog({ id: "1", status: null }))).toBe("unknown");
  });
  it("counts a retained or reserved puppy as still in the program", () => {
    expect(pqPuppyStanding(dog({ id: "1", status: "retained" }))).toBe("in-program");
    expect(pqPuppyStanding(dog({ id: "1", status: "reserved" }))).toBe("in-program");
  });
  it("does not call a transferred dog placed", () => {
    expect(pqPuppyStanding(dog({ id: "1", status: "transferred" }))).toBe("unknown");
  });
});
