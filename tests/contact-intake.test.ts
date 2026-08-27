// The pure logic behind the contact form's intake: how a name is composed,
// and how a submission is screened.
//
// Both are worth guarding here rather than only in review, because they sit
// on either side of the one rule this form must never break: a real enquiry
// is never thrown away. The screener can only *block* what a human could not
// physically have done; everything merely suspicious is flagged, delivered
// as normal, and left for a person to judge.

import { describe, it, expect } from "vitest";
import { fullName } from "@/lib/name";
import { assess, HONEYPOT_FIELD, STARTED_FIELD } from "@/lib/spam";

/** A submission that finished a comfortable while after the form appeared. */
const unhurried = () => Date.now() - 30_000;

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

describe("assess — what must never be blocked", () => {
  it("passes an ordinary enquiry", () => {
    const v = assess({
      startedAt: unhurried(),
      text: "Hi! We're hoping for a puppy this spring. Do you have a waiting list?",
      identity: "Ada Lovelace",
    });
    expect(v.verdict).toBe("clean");
    expect(v.reasons).toEqual([]);
  });

  it("passes an enquiry that mentions one website", () => {
    // The regression the screener's own comment records: an earlier version
    // matched the scheme and the domain of the SAME link separately, so one
    // ordinary sentence counted as two links and tripped the threshold.
    const v = assess({
      startedAt: unhurried(),
      text: "We found you through https://alaa-labradoodles.org — is that current?",
      identity: "Ada Lovelace",
    });
    expect(v.verdict).toBe("clean");
  });

  it("does not block on speed alone", () => {
    // One weak signal is never enough. Autofill and password managers fill
    // several fields at once, and the cost of a false positive is a customer.
    const v = assess({
      startedAt: Date.now() - 100,
      text: "Do you have puppies available?",
      identity: "Ada Lovelace",
    });
    expect(v.verdict).toBe("flag");
  });

  it("does not block on a sales phrase alone", () => {
    const v = assess({
      startedAt: unhurried(),
      text: "I noticed you don't rank #1 for labradoodles in your area.",
      identity: "Ada Lovelace",
    });
    expect(v.verdict).toBe("flag");
  });

  it("treats a missing clock as no signal rather than as suspicion", () => {
    // No JavaScript, or a page that never hydrated. Ordinary, not hostile.
    const v = assess({ text: "Are you taking deposits?", identity: "Ada Lovelace" });
    expect(v.verdict).toBe("clean");
  });

  it("treats a stale tab as no signal — only fast is suspicious", () => {
    const v = assess({
      startedAt: Date.now() - 3 * 60 * 60 * 1000,
      text: "Sorry, left this open — are you taking deposits?",
      identity: "Ada Lovelace",
    });
    expect(v.verdict).toBe("clean");
  });
});

describe("assess — what is blocked", () => {
  it("blocks on the honeypot alone, since no person can reach it", () => {
    const v = assess({
      honeypot: "http://spam.example",
      startedAt: unhurried(),
      text: "Do you have puppies available?",
      identity: "Ada Lovelace",
    });
    expect(v.verdict).toBe("block");
    expect(v.reasons).toEqual(["honeypot field was filled"]);
  });

  it("ignores an empty honeypot, which is what every real visitor sends", () => {
    const v = assess({
      honeypot: "   ",
      startedAt: unhurried(),
      text: "Do you have puppies available?",
      identity: "Ada Lovelace",
    });
    expect(v.verdict).toBe("clean");
  });

  it("blocks when two independent signals agree", () => {
    const v = assess({
      startedAt: unhurried(),
      text: "Cheap backlink packages: https://a.example and https://b.example",
      identity: "SEO Team",
    });
    expect(v.verdict).toBe("block");
    expect(v.reasons.length).toBeGreaterThanOrEqual(2);
  });

  it("blocks a link hidden in the name field alongside a pitch", () => {
    const v = assess({
      startedAt: unhurried(),
      text: "We provide digital marketing agency services.",
      identity: "promo-deals.xyz",
    });
    expect(v.verdict).toBe("block");
  });

  it("only recognises a fixed list of TLDs — a stated limit, not a bug", () => {
    // The link pattern matches a bare domain only on a known TLD
    // (com|net|org|ru|cn|top|xyz|io), so `promo.example` reads as ordinary
    // text. That is the deliberate trade: a pattern loose enough to catch
    // every TLD also catches "Adams Farm Labradoodles. Contact us" and eats
    // real enquiries. This test exists so the limit is a decision on record
    // rather than a surprise to whoever next reads a spam report.
    const v = assess({
      startedAt: unhurried(),
      text: "We provide digital marketing agency services.",
      identity: "promo.example",
    });
    expect(v.verdict).toBe("flag");
    expect(v.reasons).toHaveLength(1);
  });

  it("names its reasons, so the log and the email can say why", () => {
    const v = assess({
      startedAt: Date.now() - 100,
      text: "crypto casino https://x.example https://y.example",
      identity: "Bot",
    });
    expect(v.verdict).toBe("block");
    expect(v.reasons.join(" ")).toMatch(/link|crypto|submitted in/);
  });
});

describe("the field names are the contract", () => {
  // The form renders these and the route reads them. If either constant
  // changes without the other, the decoy silently stops being read and every
  // bot submission looks clean.
  it("are what the honeypot component and the route agree on", () => {
    expect(HONEYPOT_FIELD).toBe("website");
    expect(STARTED_FIELD).toBe("started_at");
  });
});
