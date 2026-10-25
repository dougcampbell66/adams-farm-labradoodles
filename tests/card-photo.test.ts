import { describe, it, expect } from "vitest";
import { cardFillLoss, cardPhotoMode } from "@/lib/card-photo";

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
