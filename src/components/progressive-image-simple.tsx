"use client";

import { useState } from "react";
import Image from "next/image";
import { generatePixelatedPlaceholder } from "@/lib/utils/sanity-image-urls";

export interface ProgressiveImageProps {
  src: string;
  alt: string;
  width: number;
  height: number;
  sizes?: string;
  quality?: number;
  className?: string;
  priority?: boolean;
  loading?: "lazy" | "eager";
  onLoad?: () => void;
  style?: React.CSSProperties;
}

export function ProgressiveImageSimple({
  src,
  alt,
  width,
  height,
  sizes,
  quality = 95,
  className = "",
  priority = false,
  loading,
  onLoad,
  style,
}: ProgressiveImageProps) {
  const [imageLoaded, setImageLoaded] = useState(false);

  // Generate a tiny pixelated version for the blur placeholder
  const blurDataURL = generatePixelatedPlaceholder(src);

  return (
    <div className="relative">
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        sizes={sizes}
        quality={quality}
        className={`${className} transition-opacity duration-300 ${
          imageLoaded ? "opacity-100" : "opacity-90"
        }`}
        priority={priority}
        loading={loading}
        style={style}
        placeholder="blur"
        blurDataURL={blurDataURL}
        onLoad={() => {
          setImageLoaded(true);
          onLoad?.();
        }}
      />
    </div>
  );
}