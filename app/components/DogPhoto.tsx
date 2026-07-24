"use client";

import Image from "next/image";
import { useState } from "react";

type DogPhotoProps = {
  src: string;
  alt: string;
};

export default function DogPhoto({ src, alt }: DogPhotoProps) {
  const [error, setError] = useState(false);

  if (error) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-photo-placeholder rounded-[14px]">
        <p className="text-tan text-[0.75rem] font-bold text-center px-4 leading-relaxed">
          Photo
          <br />
          coming soon
        </p>
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill
      className="object-cover object-top rounded-[14px]"
      onError={() => setError(true)}
    />
  );
}
