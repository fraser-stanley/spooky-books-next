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
    <div className="w-full" style={style}>
      {/* Skeleton with proper aspect ratio - shows until image loads */}
      {!isLoaded && (
        <div
          className={`w-full ${skeletonClassName}`}
          style={{
            aspectRatio: aspectRatio ? `${width} / ${height}` : "1 / 1",
            width: "100%",
          }}
        />
      )}

      {/* Actual image with Next.js 15 optimizations - always fills width, maintains aspect ratio */}
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        sizes={sizes}
        quality={quality}
        className={`w-full h-auto transition-opacity duration-300 ${
          isLoaded ? "opacity-100" : "opacity-0"
        } ${className}`}
        priority={priority}
        loading={loading}
        onLoad={handleLoad}
        onError={handleError}
        // Enable automatic format optimization (WebP/AVIF)
        unoptimized={false}
        style={{
          position: isLoaded ? "static" : "absolute",
          top: isLoaded ? "auto" : 0,
          left: isLoaded ? "auto" : 0,
          // Force full width regardless of original image size
          width: "100%",
          height: "auto",
          display: "block",
        }}
        fill={false}
      />

      {/* Error state fallback with better accessibility */}
      {hasError && (
        <div
          className="w-full bg-gray-100 flex items-center justify-center text-gray-400 text-sm"
          style={{ 
            aspectRatio: aspectRatio ? `${width} / ${height}` : "1 / 1",
            width: "100%",
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