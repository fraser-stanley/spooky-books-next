"use client";

import { useState } from "react";
import Image from "next/image";

export interface ImageWithSkeletonProps {
  src: string;
  alt: string;
  width: number;
  height: number;
  sizes?: string;
  quality?: number;
  className?: string;
  skeletonClassName?: string;
  priority?: boolean;
  loading?: "lazy" | "eager";
  onLoad?: () => void;
  style?: React.CSSProperties;
}

export function ImageWithSkeleton({
  src,
  alt,
  width,
  height,
  sizes,
  quality = 85, // Optimal balance for Next.js 15
  className = "",
  skeletonClassName = "bg-gray-200 animate-pulse",
  priority = false,
  loading,
  onLoad,
  style,
}: ImageWithSkeletonProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  const handleLoad = () => {
    setIsLoaded(true);
    onLoad?.();
  };

  const handleError = () => {
    setHasError(true);
    setIsLoaded(true); // Hide skeleton even on error
  };

  // Calculate aspect ratio for skeleton - more precise calculation
  const aspectRatio = width && height ? width / height : undefined;

  return (
    <div className="relative w-full" style={style}>
      {/* Skeleton - shows until image loads */}
      {!isLoaded && (
        <div
          className={`w-full ${skeletonClassName}`}
          style={{
            aspectRatio: aspectRatio ? `${width} / ${height}` : "1 / 1",
          }}
        />
      )}

      {/* Actual image with Next.js 15 optimizations */}
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        sizes={sizes}
        quality={quality}
        className={`${className} transition-opacity duration-300 ${
          isLoaded ? "opacity-100" : "opacity-0"
        }`}
        priority={priority}
        loading={loading}
        onLoad={handleLoad}
        onError={handleError}
        // Next.js 15 automatically handles layout optimization
        style={{
          position: isLoaded ? "static" : "absolute",
          top: isLoaded ? "auto" : 0,
          left: isLoaded ? "auto" : 0,
          // Prevent layout shift with explicit dimensions
          width: "100%",
          height: "auto",
          objectFit: "cover",
        }}
        // Enable automatic format optimization (WebP/AVIF)
        unoptimized={false}
      />

      {/* Error state fallback with better accessibility */}
      {hasError && (
        <div
          className="w-full bg-gray-100 flex items-center justify-center text-gray-400 text-sm"
          style={{ 
            aspectRatio: aspectRatio ? `${width} / ${height}` : "1 / 1",
          }}
          role="img"
          aria-label={`Image not available: ${alt}`}
        >
          <span>Image unavailable</span>
        </div>
      )}
    </div>
  );
}