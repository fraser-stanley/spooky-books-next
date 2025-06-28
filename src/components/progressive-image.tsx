"use client";

import { useState, useCallback } from "react";
import Image from "next/image";
import { generatePixelatedPlaceholder } from "@/lib/utils/sanity-image-urls";
import styles from "./progressive-image.module.css";

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

export function ProgressiveImage({
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
  const [isLoaded, setIsLoaded] = useState(false);
  const [placeholderError, setPlaceholderError] = useState(false);

  // Generate pixelated placeholder URL
  const placeholderSrc = generatePixelatedPlaceholder(src);

  const handleLoad = useCallback(() => {
    setIsLoaded(true);
    onLoad?.();
  }, [onLoad]);

  const handlePlaceholderError = useCallback(() => {
    setPlaceholderError(true);
  }, []);

  return (
    <div 
      className={`${styles.container} ${className}`}
      style={style}
    >
      {/* Pixelated placeholder image - loads instantly */}
      {!placeholderError && (
        <Image
          src={placeholderSrc}
          alt=""
          width={width}
          height={height}
          className={`${styles.placeholder} ${isLoaded ? styles.fadeOut : ""}`}
          onError={handlePlaceholderError}
          priority={priority}
          quality={10}
          unoptimized={true} // Skip Next.js optimization for tiny placeholder
        />
      )}

      {/* High-quality main image */}
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        sizes={sizes}
        quality={quality}
        className={`${styles.mainImage} ${isLoaded ? styles.fadeIn : ""}`}
        onLoad={handleLoad}
        priority={priority}
        loading={loading}
      />
    </div>
  );
}