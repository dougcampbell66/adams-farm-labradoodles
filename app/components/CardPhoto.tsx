"use client";

import Image from "next/image";
import { useState } from "react";
import {
  CARD_FILL_POSITION,
  CARD_IMAGE_SIZES,
  cardPhotoMode,
  type CardPhotoMode,
} from "@/lib/card-photo";

/**
 * A card's photo inside its 3:4 frame (lib/card-photo.ts). The parent holds
 * the frame — `relative aspect-[3/4]` with the site's cream behind it — so
 * nothing moves when the photo arrives. Once the photo has loaded, its measured
 * width and height choose fill or fit; until then it shows as fill, right for
 * every portrait. Fit shows the whole photo with the cream above and below.
 */
export default function CardPhoto({ src, alt }: { src: string; alt: string }) {
  const [mode, setMode] = useState<CardPhotoMode>("fill");
  return (
    <Image
      src={src}
      alt={alt}
      fill
      sizes={CARD_IMAGE_SIZES}
      className={mode === "fit" ? "object-contain object-center" : "object-cover"}
      style={mode === "fill" ? { objectPosition: CARD_FILL_POSITION } : undefined}
      onLoad={(e) => {
        const img = e.currentTarget;
        setMode(cardPhotoMode({ width: img.naturalWidth, height: img.naturalHeight }));
      }}
    />
  );
}
