import { describe, it, expect } from "vitest";
import { cardPhotoMode } from "@/lib/card-photo";

describe("cardPhotoMode — fill or fit a card photo", () => {
  it("fills a portrait photo", () => {
    expect(cardPhotoMode({ width: 1500, height: 2000 })).toBe("fill");
  });
  it("fills a square photo", () => {
    expect(cardPhotoMode({ width: 1000, height: 1000 })).toBe("fill");
  });
  it("fits a wide shot, like a newborn lying down", () => {
    expect(cardPhotoMode({ width: 2048, height: 1536 })).toBe("fit");
  });
  it("fills until the size is known", () => {
    expect(cardPhotoMode({})).toBe("fill");
  });
  it("lets a person's choice win over the shape", () => {
    expect(cardPhotoMode({ width: 2048, height: 1536, override: "fill" })).toBe("fill");
  });
});
