// How a photo sits in a puppy or dog card — the one place that decides it.
//
// Cards are 3:4 (pawsq DECISIONS-2026-10-24 P11, restated 2026-10-25): the
// shape of a phone portrait, of Instagram's tall post (1080 x 1440) and of the
// printed trading card (825 x 1125 with bleed), so one framing serves all
// three. Three ways to put a photo in that frame:
//
//   zoom — the photo has a focal box (pawsq migration 78: where the puppy is,
//          as fractions of the image, detected at upload or dragged by the
//          breeder). The photo is scaled so the box fills about three
//          quarters of the card (CARD_SUBJECT_FILL), centred on the box and
//          never so little that the card shows background. A wide shot from
//          eight feet away reads like one taken from three. Douglas,
//          2026-09-14: "the puppy takes up about 70 to 80% of the frame".
//   fill — no box, and the photo is already close to 3:4: crop to cover,
//          centred across and a little above centre down (40% from the top),
//          since faces sit high in a portrait;
//   fit  — no box, and filling would cut away more than CARD_FILL_MAX_LOSS:
//          the whole photo, the space around it in the site's own background.
//
// Nobody resizes or crops a file by hand, and no file is changed: the box is
// a note on the media row and this is only how the card displays it. Width
// and height come from the database (pawsq migration 93) so the choice is
// made before the photo loads; a row not yet measured is measured by the
// browser on load and decided by this same function.

export type CardPhotoMode = "fill" | "fit" | "zoom";

export interface CardPhotoInput {
  /** Pixel width and height: media.width/height, or measured on load. */
  width?: number | null;
  height?: number | null;
  /** media.focal_x/y/w/h, as fractions of the image; null when unframed. */
  focal?: { x: number; y: number; w: number; h: number } | null;
  /** A person's choice of fill or fit for this photo. Not stored anywhere yet. */
  override?: "fill" | "fit" | null;
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

/** The most of a photo that filling may cut away; past this it is shown whole. */
export const CARD_FILL_MAX_LOSS = 0.12;

/** The share of a width x height photo that a 3:4 fill would cut away. */
export function cardFillLoss(width: number, height: number): number {
  const card = CARD_ASPECT.width / CARD_ASPECT.height;
  const photo = width / height;
  return photo > card ? 1 - card / photo : 1 - photo / card;
}

/** How much of the card the puppy's box should fill, along its tighter side. */
export const CARD_SUBJECT_FILL = 0.75;

/** The most a box may zoom past covering the card — a speck stays a speck. */
export const CARD_MAX_ZOOM = 4;

/** What the card component applies: the mode and the CSS that draws it. */
export interface CardPhotoFrame {
  mode: CardPhotoMode;
  /** CSS object-position for an object-fit: cover (fill, zoom) image. */
  objectPosition: string;
  /** zoom only: scale applied over the covered image, and its origin. */
  transform?: string;
  transformOrigin?: string;
}

const pct = (n: number) => `${Math.round(n * 10000) / 100}%`;

/**
 * The whole decision. The card is 1 wide and 4/3 tall; an image of ratio
 * r = width/height covering it is drawn `cover` = max(1, 4r/3) wide. A box
 * asks for a width D at which it fills CARD_SUBJECT_FILL of the card, never
 * less than cover and never more than CARD_MAX_ZOOM times it; the image is
 * then slid so the box's centre sits at the card's centre, as far as the
 * image's own edges allow. Drawn as cover, aimed by object-position and
 * scaled by D/cover about an origin inside the image element.
 */
export function cardPhotoFrame({ width, height, focal, override }: CardPhotoInput): CardPhotoFrame {
  const fill: CardPhotoFrame = { mode: "fill", objectPosition: CARD_FILL_POSITION };
  if (override === "fit") return { mode: "fit", objectPosition: "50% 50%" };
  if (override === "fill") return fill;
  if (!width || !height) return fill;
  if (!focal || !(focal.w > 0) || !(focal.h > 0)) {
    return cardFillLoss(width, height) <= CARD_FILL_MAX_LOSS ? fill : { mode: "fit", objectPosition: "50% 50%" };
  }

  const cardH = CARD_ASPECT.height / CARD_ASPECT.width; // 4/3, card widths
  const r = width / height;
  const cover = Math.max(1, cardH * r); // drawn width at cover
  // Width at which the box fills CARD_SUBJECT_FILL of the card's tighter side.
  // Drawn D wide, the box is w·D wide and h·D/r tall; it fills the card's
  // width at w·D = 1 and its height at h·D/r = cardH.
  const want = CARD_SUBJECT_FILL / Math.max(focal.w, focal.h / (r * cardH));
  const drawnW = Math.min(Math.max(want, cover), cover * CARD_MAX_ZOOM);
  const drawnH = drawnW / r;

  // Slide the box's centre to the card's centre, clamped to the image.
  const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));
  const left = clamp(0.5 - (focal.x + focal.w / 2) * drawnW, 1 - drawnW, 0);
  const top = clamp(cardH / 2 - (focal.y + focal.h / 2) * drawnH, cardH - drawnH, 0);

  const z = drawnW / cover;
  const coverH = cover / r;
  if (z < 1.001) {
    // Cover is already as close as the box asks: no scaling, just aim.
    const px = cover > 1.0001 ? left / (1 - cover) : 0.5;
    const py = coverH > cardH + 0.0001 ? top / (cardH - coverH) : 0.5;
    return { mode: "zoom", objectPosition: `${pct(px)} ${pct(py)}` };
  }
  // object-fit clips the picture to the img element's own box BEFORE the
  // transform scales it, so the scale's origin must lie inside that box or
  // the puppy is scaled from pixels already cut away. Per axis, with the
  // element E long and the covering picture C long: aim the cover at L0
  // (object-position), then scale by z about origin O, so the picture's
  // edge lands at O + z(L0 - O) = target. Any O in [0, E] whose L0 stays
  // within [E - C, 0] works; such an O always exists, and the middle of
  // the allowed span is taken.
  const axis = (target: number, e: number, c: number) => {
    const lo = Math.max(0, (z * (e - c) - target) / (z - 1));
    const hi = Math.min(e, -target / (z - 1));
    const o = Math.min(hi, Math.max(lo, (lo + hi) / 2));
    const l0 = (target + o * (z - 1)) / z;
    return { position: c > e + 0.0001 ? l0 / (e - c) : 0.5, origin: o / e };
  };
  const ax = axis(left, 1, cover);
  const ay = axis(top, cardH, coverH);
  return {
    mode: "zoom",
    objectPosition: `${pct(ax.position)} ${pct(ay.position)}`,
    transform: `scale(${Math.round(z * 10000) / 10000})`,
    transformOrigin: `${pct(ax.origin)} ${pct(ay.origin)}`,
  };
}

/**
 * The image-size hint for a zoomed photo: a photo drawn z times larger than
 * the card needs z times the pixels, or the puppy it zooms to comes out
 * soft. Every width in the hint is multiplied by z, rounded up; the screen
 * widths in its media conditions are not.
 */
export function scaleSizes(sizes: string, zoom: number): string {
  if (!(zoom > 1)) return sizes;
  // Each entry is "[media condition] width"; only the width at its end scales.
  return sizes
    .split(",")
    .map((part) =>
      part.replace(/(\d+(?:\.\d+)?)(vw|px)\s*$/, (_, n: string, unit: string) => `${Math.ceil(Number(n) * zoom)}${unit}`),
    )
    .join(",");
}

/** The zoom a frame applies, 1 when it applies none. */
export function frameZoom(frame: CardPhotoFrame): number {
  const m = frame.transform?.match(/scale\(([\d.]+)\)/);
  return m ? Number(m[1]) : 1;
}

/** Fill, fit or zoom — cardPhotoFrame's mode, for callers that need only that. */
export function cardPhotoMode(input: CardPhotoInput): CardPhotoMode {
  return cardPhotoFrame(input).mode;
}

/** The fields the card-photo choice reads from a media row. */
export interface CardPhotoCandidate {
  published: boolean;
  pinned_at?: string | null;
  taken_on?: string | null;
}

/**
 * Which photo stands on a dog's card — the same rule on every PawsQ site
 * (Douglas, 2026-10-25): the photo the breeder pinned, else the newest
 * published one by the day it was taken (media.taken_on, read from the
 * camera at upload). Rows with no date sort behind dated ones, and ties —
 * including every older row with no date — keep the order each site used
 * before, passed in as `tieBreak` (negative when a should win).
 */
export function pickCardPhoto<T extends CardPhotoCandidate>(
  rows: T[],
  tieBreak: (a: T, b: T) => number = () => 0,
): T | null {
  let best: T | null = null;
  for (const row of rows) {
    if (!row.published) continue;
    if (!best || compareCardPhotos(row, best, tieBreak) < 0) best = row;
  }
  return best;
}

function compareCardPhotos<T extends CardPhotoCandidate>(a: T, b: T, tieBreak: (a: T, b: T) => number): number {
  const pinA = a.pinned_at ? 1 : 0;
  const pinB = b.pinned_at ? 1 : 0;
  if (pinA !== pinB) return pinB - pinA;
  const ta = a.taken_on ?? "";
  const tb = b.taken_on ?? "";
  if (ta !== tb) return ta > tb ? -1 : 1; // newest first; "" (no date) last
  return tieBreak(a, b);
}

/** media's focal columns as a box, or null when the row is unframed. */
export function focalOf(row: {
  focal_x?: number | string | null;
  focal_y?: number | string | null;
  focal_w?: number | string | null;
  focal_h?: number | string | null;
}): CardPhotoInput["focal"] {
  if (row.focal_x == null || row.focal_y == null || row.focal_w == null || row.focal_h == null) return null;
  return { x: Number(row.focal_x), y: Number(row.focal_y), w: Number(row.focal_w), h: Number(row.focal_h) };
}
