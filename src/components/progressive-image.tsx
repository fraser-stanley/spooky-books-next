"use client";

import { useState, useCallback } from "react";
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

  // If placeholder fails or main image is loaded, just show the main image
  if (placeholderError || isLoaded) {
    return (
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        sizes={sizes}
        quality={quality}
        className={className}
        onLoad={handleLoad}
        priority={priority}
        loading={loading}
        style={style}
      />
    );
  }

  // Show pixelated placeholder while main image loads
  return (
    <div style={{ position: 'relative', ...style }}>
      {/* Pixelated placeholder - maintains layout */}
      <Image
        src={placeholderSrc}
        alt=""
        width={width}
        height={height}
        className={className}
        onError={handlePlaceholderError}
        priority={priority}
        quality={10}
        unoptimized={true}
        style={{
          imageRendering: 'pixelated',
          filter: 'brightness(1.1) contrast(1.2)',
        }}
      />
      
      {/* High-quality main image - hidden but loading */}
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        sizes={sizes}
        quality={quality}
        onLoad={handleLoad}
        priority={priority}
        loading={loading}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          opacity: 0,
          pointerEvents: 'none',
        }}
      />
    </div>
  );
}