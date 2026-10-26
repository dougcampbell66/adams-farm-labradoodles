"use client";

import Image from "next/image";
import { useState } from "react";
import {
  CARD_IMAGE_SIZES,
  cardPhotoFrame,
  frameZoom,
  scaleSizes,
  type CardPhotoInput,
} from "@/lib/card-photo";

/**
 * A card's photo inside its 3:4 frame (lib/card-photo.ts). The parent holds
 * the frame — `relative aspect-[3/4]` with the site's cream behind it — so
 * nothing moves when the photo arrives. The photo's stored size and focal box
 * (pawsq migrations 78, 93; `frame`, from pqPhotoFrame) decide fill, fit or
 * zoom before the first paint: with a box, the card zooms to the puppy. A
 * photo with no stored size is measured on load and decided by the same
 * function. A zoomed photo asks the image service for as many more pixels
 * as it is zoomed, so the puppy is sharp.
 */
export default function CardPhoto({
  src,
  alt,
  frame = null,
}: {
  src: string;
  alt: string;
  frame?: Pick<CardPhotoInput, "width" | "height" | "focal"> | null;
}) {
  const [measured, setMeasured] = useState<{ width: number; height: number } | null>(null);
  const size = frame?.width && frame?.height ? { width: frame.width, height: frame.height } : measured;
  const f = cardPhotoFrame({ ...(size ?? {}), focal: frame?.focal ?? null });
  return (
    <Image
      src={src}
      alt={alt}
      fill
      sizes={scaleSizes(CARD_IMAGE_SIZES, frameZoom(f))}
      className={f.mode === "fit" ? "object-contain object-center" : "object-cover"}
      style={{ objectPosition: f.objectPosition, transform: f.transform, transformOrigin: f.transformOrigin }}
      onLoad={(e) => {
        if (size) return;
        const img = e.currentTarget;
        setMeasured({ width: img.naturalWidth, height: img.naturalHeight });
      }}
    />
  );
}
