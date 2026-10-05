"use client";

import Image from "next/image";
import { useState } from "react";

/**
 * Renders a YouTube thumbnail.
 * Tries maxresdefault (1280×720, native 16:9) first.
 * Falls back to mqdefault (320×180) if maxres is unavailable (404).
 */
export function WatchThumbnail({
  src,
  fallbackSrc,
  sizes,
  className,
}: {
  src: string;
  fallbackSrc: string;
  sizes: string;
  className?: string;
}) {
  const [imgSrc, setImgSrc] = useState(src);

  return (
    <Image
      src={imgSrc}
      alt=""
      fill
      sizes={sizes}
      onError={() => setImgSrc(fallbackSrc)}
      className={className}
    />
  );
}
