// Unit tests for the pure PuppyQ display logic (no network / no database).
//
// These guard the derivations that decide what shows on /our-dogs, /our-litters,
// and /our-puppies — e.g. that a dog which is BOTH a puppy (has a litter_id) and
// a parent still lands in the right tier. The live connection is covered
// separately by scripts/puppyq-smoke.mjs.

import { describe, it, expect } from "vitest";
import {
  pqName,
  pqShortName,
  pqSex,
  pqRole,
  pqDogTiers,
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

describe("pqDogTiers — active / retired / retained split", () => {
  const macy = dog({ id: "A", call_name: "Macy", status: "active" }); // active producer
  const oldDam = dog({ id: "D", call_name: "Old", status: "placed" }); // past producer
  const youngPup = dog({ id: "C", call_name: "Pup", status: "active", litter_id: "L1" }); // active, not a producer
  const litters = [
    litter("L1", "A", null, "2026-05-01"), // Macy's current litter
    litter("L0", "D", null, "2020-01-01"), // Old's past litter
  ];
  const tiers = pqDogTiers({
    orgId: "org",
    dogs: [macy, oldDam, youngPup],
    allDogs: [macy, oldDam, youngPup],
    litters,
    diagnostics: { keyKind: "secret", url: null, orgId: "org", orgName: null, dogRows: 3, litterRows: 2, errors: [] },
  });

  it("puts an active producer in 'active'", () => {
    expect(tiers.active.map((d) => d.id)).toContain("A");
  });
  it("puts a non-active producer in 'retired'", () => {
    expect(tiers.retired.map((d) => d.id)).toContain("D");
  });
  it("puts an active non-producer in 'retained' (young stock)", () => {
    expect(tiers.retained.map((d) => d.id)).toContain("C");
  });
  it("never double-counts a dog across tiers", () => {
    const all = [...tiers.active, ...tiers.retired, ...tiers.retained].map((d) => d.id);
    expect(new Set(all).size).toBe(all.length);
  });
});

describe("pqPuppyStanding", () => {
  it("maps status to standing", () => {
    expect(pqPuppyStanding(dog({ id: "1", status: "placed" }))).toBe("placed");
    expect(pqPuppyStanding(dog({ id: "1", status: "active" }))).toBe("in-program");
    expect(pqPuppyStanding(dog({ id: "1", status: null }))).toBe("unknown");
  });
});
