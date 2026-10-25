// How a photo sits in a puppy or dog card — the one place that decides it.
//
// Cards are 3:4 (pawsq DECISIONS-2026-10-24 P11, restated 2026-10-25): the
// shape of a phone portrait, of Instagram's tall post (1080 x 1440) and of the
// printed trading card (825 x 1125 with bleed), so one framing serves all
// three. Two ways to put a photo in that frame:
//
//   fill — crop to cover the card, centred across and a little above centre
//          down (40% from the top), since faces sit high in a portrait;
//   fit  — the whole photo, scaled to the card's width and centred, the space
//          above and below in the site's own background colour. A newborn
//          photographed lying down is a wide shot, and a 3:4 crop cuts it off.
//
// The rule today reads only the photo's shape: wider than tall → fit. The
// inputs already have room for what the photo-intake work will add — the
// focal box pawsq migration 78 stores on `media` (focal_x/y/w/h, nothing reads
// it yet) and a per-photo manual choice — so that work changes this function
// and nothing that calls it. No width or height is stored anywhere yet, so
// callers pass what the browser measures once the image has loaded.

export type CardPhotoMode = "fill" | "fit";

export interface CardPhotoInput {
  /** Pixel width and height, measured after load; null until known. */
  width?: number | null;
  height?: number | null;
  /** media.focal_x/y/w/h, as fractions of the image. Not used yet. */
  focal?: { x: number; y: number; w: number; h: number } | null;
  /** A person's choice for this photo. Not stored anywhere yet. */
  override?: CardPhotoMode | null;
}

/** The card's shape, width : height. */
export const CARD_ASPECT = { width: 3, height: 4 } as const;

/** Where a filled photo is anchored: centred across, 40% down. */
export const CARD_FILL_POSITION = "50% 40%";

/**
 * Widths to request for a card photo. 900 x 1200 fills a card on an ordinary
 * screen and 1800 x 2400 on a high-density one; the image service resizes by
 * width and keeps the photo's own shape, and the card crops or letterboxes it.
 */
export const CARD_IMAGE_SIZES = "(max-width: 640px) 100vw, (max-width: 1024px) 33vw, 300px";

export function cardPhotoMode({ width, height, override }: CardPhotoInput): CardPhotoMode {
  if (override) return override;
  if (width && height && width > height) return "fit";
  return "fill";
}
