import { describe, expect, it } from "vitest";
import { buildDogUrlIndex, dogSegment, dogSlugCandidate, resolveDogParam, slugify } from "@/lib/dog-url";

// pawsq DECISIONS-2026-11-05 R5: /dogs/<registered-name>-MM-DD-YYYY.

const ginger = { id: "11111111-1111-4111-8111-111111111111", registered_name: "Shadow Mountain's Ginger", call_name: "Ginger", birthdate: "2019-05-14" };
const lia = { id: "22222222-2222-4222-8222-222222222222", registered_name: "Adams Farm Lia", call_name: "Lia", birthdate: null };
const unnamed = { id: "33333333-3333-4333-8333-333333333333", registered_name: null, call_name: "Max", birthdate: "2026-09-01" };
const twinA = { id: "44444444-4444-4444-8444-444444444444", registered_name: "Legend Manor Echo", call_name: null, birthdate: "2024-01-02" };
const twinB = { id: "55555555-5555-4555-8555-555555555555", registered_name: "Legend Manor Echo", call_name: null, birthdate: "2024-01-02" };

const index = buildDogUrlIndex([ginger, lia, unnamed, twinA, twinB]);

describe("the address", () => {
  it("is the registered name and the birthdate, month-day-year", () => {
    expect(dogSlugCandidate(ginger)).toBe("shadow-mountains-ginger-05-14-2019");
    expect(dogSegment(index, ginger.id)).toBe("shadow-mountains-ginger-05-14-2019");
  });
  it("is the name alone with no birthdate on file", () => {
    expect(dogSegment(index, lia.id)).toBe("adams-farm-lia");
  });
  it("is the id with no registered name yet", () => {
    expect(dogSegment(index, unnamed.id)).toBe(unnamed.id);
  });
  it("is the id for both dogs that would share one", () => {
    expect(dogSegment(index, twinA.id)).toBe(twinA.id);
    expect(dogSegment(index, twinB.id)).toBe(twinB.id);
  });
  it("drops apostrophes and accents", () => {
    expect(slugify("Belle’s Café  Noir")).toBe("belles-cafe-noir");
  });
});

describe("resolving a request", () => {
  it("finds the current address", () => {
    expect(resolveDogParam(index, "shadow-mountains-ginger-05-14-2019")).toEqual({ kind: "found", id: ginger.id });
  });
  it("forwards the id", () => {
    expect(resolveDogParam(index, ginger.id)).toEqual({ kind: "redirect", id: ginger.id, segment: "shadow-mountains-ginger-05-14-2019" });
  });
  it("forwards the old WordPress-style slug and the name without its date", () => {
    expect(resolveDogParam(index, "shadow-mountain-s-ginger")).toMatchObject({ kind: "redirect", id: ginger.id });
    expect(resolveDogParam(index, "shadow-mountains-ginger")).toMatchObject({ kind: "redirect", id: ginger.id });
  });
  it("forwards a call name that names exactly one dog", () => {
    expect(resolveDogParam(index, "ginger")).toMatchObject({ kind: "redirect", id: ginger.id });
  });
  it("forwards different capitals to the lowercase address", () => {
    expect(resolveDogParam(index, "Shadow-Mountains-Ginger-05-14-2019")).toMatchObject({ kind: "redirect", id: ginger.id });
  });
  it("serves a dog with no registered name at its id", () => {
    expect(resolveDogParam(index, unnamed.id)).toEqual({ kind: "found", id: unnamed.id });
  });
  it("refuses an ambiguous older name rather than guessing", () => {
    expect(resolveDogParam(index, "legend-manor-echo")).toEqual({ kind: "missing" });
  });
  it("misses what names no dog", () => {
    expect(resolveDogParam(index, "nobody")).toEqual({ kind: "missing" });
  });
});
