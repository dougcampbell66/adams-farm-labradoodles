import { describe, it, expect } from "vitest";
import { cardFillLoss, cardPhotoFrame, cardPhotoMode, pickCardPhoto, scaleSizes } from "@/lib/card-photo";

describe("cardPhotoMode — fill only when it costs almost nothing", () => {
  it("fills a phone portrait (3:4), cutting nothing", () => {
    expect(cardFillLoss(1500, 2000)).toBe(0);
    expect(cardPhotoMode({ width: 1500, height: 2000 })).toBe("fill");
  });
  it("fills a 4:5 portrait, which loses about 6%", () => {
    expect(cardPhotoMode({ width: 1600, height: 2000 })).toBe("fill");
  });
  it("shows a wide newborn shot whole", () => {
    expect(cardPhotoMode({ width: 2048, height: 1536 })).toBe("fit");
  });
  it("shows a square photo whole", () => {
    expect(cardPhotoMode({ width: 1000, height: 1000 })).toBe("fit");
  });
  it("shows a very tall portrait whole rather than cut its head or feet", () => {
    expect(cardPhotoMode({ width: 675, height: 1200 })).toBe("fit");
  });
  it("fills until the size is known", () => {
    expect(cardPhotoMode({})).toBe("fill");
  });
  it("lets a person's choice win over the shape", () => {
    expect(cardPhotoMode({ width: 2048, height: 1536, override: "fill" })).toBe("fill");
  });
});

// Render a frame the way a browser does — object-fit: cover at the given
// object-position, then the transform about its origin — and report where
// the focal box lands, in card units (the card is 1 wide, 4/3 tall).
function land(width: number, height: number, focal: { x: number; y: number; w: number; h: number }) {
  const f = cardPhotoFrame({ width, height, focal });
  const cardH = 4 / 3;
  const r = width / height;
  const cover = Math.max(1, cardH * r);
  const coverH = cover / r;
  const [px, py] = f.objectPosition.split(" ").map((v) => parseFloat(v) / 100);
  const l0 = px * (1 - cover);
  const t0 = py * (cardH - coverH);
  const z = f.transform ? parseFloat(f.transform.slice(6)) : 1;
  const [ox, oy] = f.transformOrigin
    ? f.transformOrigin.split(" ").map((v, i) => (parseFloat(v) / 100) * (i ? cardH : 1))
    : [0, 0];
  const left = ox + z * (l0 - ox);
  const top = oy + z * (t0 - oy);
  const drawnW = cover * z;
  const drawnH = coverH * z;
  return {
    mode: f.mode,
    left,
    top,
    right: left + drawnW,
    bottom: top + drawnH,
    boxCx: left + (focal.x + focal.w / 2) * drawnW,
    boxCy: top + (focal.y + focal.h / 2) * drawnH,
    boxW: focal.w * drawnW,
    boxH: focal.h * drawnH,
  };
}

describe("cardPhotoFrame — a focal box zooms to the puppy", () => {
  it("a small puppy in the middle of a wide shot fills three quarters of the card, centred", () => {
    const l = land(4032, 3024, { x: 0.45, y: 0.4, w: 0.12, h: 0.16 });
    expect(l.mode).toBe("zoom");
    expect(l.boxCx).toBeCloseTo(0.5, 3);
    expect(l.boxCy).toBeCloseTo(2 / 3, 3);
    expect(Math.max(l.boxW, l.boxH / (4 / 3))).toBeCloseTo(0.75, 3);
  });
  it("scales only pixels object-fit kept: origin and aim stay inside the image element", () => {
    // object-fit clips the picture to the img element's box before the
    // transform runs; an origin outside it would zoom into pixels already cut.
    for (const focal of [
      { x: 0.632, y: 0.446, w: 0.188, h: 0.276 },
      { x: 0, y: 0, w: 0.1, h: 0.1 },
      { x: 0.9, y: 0.85, w: 0.1, h: 0.15 },
    ]) {
      for (const [w, h] of [[4032, 3024], [3024, 4032], [2000, 2000]]) {
        const f = cardPhotoFrame({ width: w, height: h, focal });
        for (const v of [...f.objectPosition.split(" "), ...(f.transformOrigin?.split(" ") ?? [])]) {
          expect(parseFloat(v)).toBeGreaterThanOrEqual(-1e-6);
          expect(parseFloat(v)).toBeLessThanOrEqual(100 + 1e-6);
        }
      }
    }
  });
  it("never leaves background showing: the image always covers the card", () => {
    for (const focal of [
      { x: 0, y: 0, w: 0.1, h: 0.1 },
      { x: 0.9, y: 0.85, w: 0.1, h: 0.15 },
      { x: 0.02, y: 0.6, w: 0.2, h: 0.35 },
    ]) {
      for (const [w, h] of [[4032, 3024], [3024, 4032], [2000, 2000]]) {
        const l = land(w, h, focal);
        expect(l.left).toBeLessThanOrEqual(1e-6);
        expect(l.top).toBeLessThanOrEqual(1e-6);
        expect(l.right).toBeGreaterThanOrEqual(1 - 1e-6);
        expect(l.bottom).toBeGreaterThanOrEqual(4 / 3 - 1e-6);
      }
    }
  });
  it("a puppy at the edge is pulled as far toward centre as the photo allows", () => {
    const l = land(4032, 3024, { x: 0.0, y: 0.4, w: 0.12, h: 0.16 });
    expect(l.left).toBeCloseTo(0, 6);
    expect(l.boxCx).toBeLessThan(0.5);
  });
  it("a puppy that already fills the photo is simply filled, aimed at the box", () => {
    const l = land(3000, 4000, { x: 0.05, y: 0.05, w: 0.9, h: 0.9 });
    expect(l.mode).toBe("zoom");
    expect(l.right - l.left).toBeCloseTo(1, 3);
  });
  it("a speck is not zoomed past four times cover", () => {
    const l = land(4000, 3000, { x: 0.5, y: 0.5, w: 0.01, h: 0.01 });
    const cover = (4 / 3) * (4000 / 3000);
    expect((l.right - l.left) / cover).toBeCloseTo(4, 3);
  });
  it("without a box, today's rule stands", () => {
    expect(cardPhotoFrame({ width: 2048, height: 1536 }).mode).toBe("fit");
    expect(cardPhotoFrame({ width: 1500, height: 2000 }).mode).toBe("fill");
    expect(cardPhotoFrame({ width: 1500, height: 2000 }).objectPosition).toBe("50% 40%");
  });
  it("with a box but no size yet, fills until measured", () => {
    expect(cardPhotoFrame({ focal: { x: 0.4, y: 0.4, w: 0.2, h: 0.2 } }).mode).toBe("fill");
  });
});

describe("pickCardPhoto — the pin, else the newest by the day taken", () => {
  const row = (id: string, o: Partial<{ published: boolean; pinned_at: string | null; taken_on: string | null; kind: string }>) => ({
    id,
    published: true,
    pinned_at: null,
    taken_on: null,
    kind: "gallery",
    ...o,
  });
  it("a pin wins over a newer photo", () => {
    const rows = [row("old", { taken_on: "2026-10-01", pinned_at: "2026-10-02T00:00:00Z" }), row("new", { taken_on: "2026-10-20" })];
    expect(pickCardPhoto(rows)?.id).toBe("old");
  });
  it("without a pin, the newest day taken wins, and undated rows sort behind", () => {
    const rows = [row("undated", {}), row("a", { taken_on: "2026-10-01" }), row("b", { taken_on: "2026-10-20" })];
    expect(pickCardPhoto(rows)?.id).toBe("b");
  });
  it("an unpublished photo never stands on a card", () => {
    expect(pickCardPhoto([row("hidden", { published: false, taken_on: "2026-10-30" }), row("shown", { taken_on: "2026-01-01" })])?.id).toBe("shown");
  });
  it("among undated rows the site's former order decides", () => {
    const rows = [row("g", {}), row("p", { kind: "portrait" })];
    expect(pickCardPhoto(rows, (a, b) => (a.kind === "portrait" ? 0 : 1) - (b.kind === "portrait" ? 0 : 1))?.id).toBe("p");
  });
});

describe("scaleSizes — a zoomed photo asks for more pixels", () => {
  it("multiplies every width", () => {
    expect(scaleSizes("(max-width: 640px) 100vw, (max-width: 1024px) 33vw, 300px", 2.5)).toBe(
      "(max-width: 640px) 250vw, (max-width: 1024px) 83vw, 750px",
    );
  });
  it("leaves an unzoomed hint alone", () => {
    expect(scaleSizes("100vw", 1)).toBe("100vw");
  });
});
