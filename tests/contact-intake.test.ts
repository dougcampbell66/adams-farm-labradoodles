// The pure logic this site still owns behind the contact form: how a name
// is composed, and the decoy field-name contract between the form markup
// and the route.
//
// The spam screening itself — and its tests — moved to the pawsq platform
// on 2026-08-30 (pawsq-app: lib/mail/spam.ts, tests/spam.test.ts). This
// site no longer screens; it forwards the decoy values to the platform and
// the one shared screener decides.

import { describe, it, expect } from "vitest";
import { fullName } from "@/lib/name";
import { HONEYPOT_FIELD, STARTED_FIELD } from "@/lib/decoy";

describe("fullName", () => {
  it("composes the two parts", () => {
    expect(fullName("Mary Jo", "Van Der Berg")).toBe("Mary Jo Van Der Berg");
  });

  it("keeps a multi-word surname whole", () => {
    expect(fullName("Ada", "Van Der Berg")).toBe("Ada Van Der Berg");
  });

  it("does not pad a mononym with a trailing space", () => {
    expect(fullName("Prince", "")).toBe("Prince");
    expect(fullName("", "Prince")).toBe("Prince");
  });

  it("trims each part", () => {
    expect(fullName("  Ada  ", "  Lovelace ")).toBe("Ada Lovelace");
  });

  it("is empty when nothing was given, so the route can reject it", () => {
    expect(fullName("", "")).toBe("");
    expect(fullName("   ", "  ")).toBe("");
  });
});

describe("the field names are the contract", () => {
  // The form renders these and the route reads them. If either constant
  // changes without the other, the decoy silently stops being read and every
  // bot submission looks clean to the platform.
  it("are what the honeypot component and the route agree on", () => {
    expect(HONEYPOT_FIELD).toBe("website");
    expect(STARTED_FIELD).toBe("started_at");
  });
});
