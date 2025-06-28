/**
 * Sanity Image URL Utilities
 * Generates optimized image URLs with various transformations for progressive loading
 */

export interface SanityImageOptions {
  width?: number;
  height?: number;
  quality?: number;
  format?: 'auto' | 'webp' | 'avif' | 'jpg' | 'png';
  fit?: 'crop' | 'fill' | 'fillmax' | 'max' | 'scale' | 'clip' | 'min';
}

/**
 * Extract the base URL and asset ID from a Sanity image URL
 */
function parseSanityImageUrl(imageUrl: string) {
  // Handle both CDN URLs and asset references
  if (imageUrl.includes('cdn.sanity.io')) {
    const urlParts = imageUrl.split('/');
    const filename = urlParts[urlParts.length - 1];
    const baseUrl = urlParts.slice(0, -1).join('/');
    return { baseUrl, filename };
  }
  
  // If it's already a transformed URL, extract the base
  const baseUrl = imageUrl.split('?')[0];
  const urlParts = baseUrl.split('/');
  const filename = urlParts[urlParts.length - 1];
  const baseUrlWithoutFilename = urlParts.slice(0, -1).join('/');
  
  return { baseUrl: baseUrlWithoutFilename, filename };
}

/**
 * Generate a Sanity image URL with specified transformations
 */
export function generateSanityImageUrl(
  imageUrl: string,
  options: SanityImageOptions = {}
): string {
  if (!imageUrl) return '';
  
  const { baseUrl, filename } = parseSanityImageUrl(imageUrl);
  const params = new URLSearchParams();
  
  // Add transformation parameters
  if (options.width) params.set('w', options.width.toString());
  if (options.height) params.set('h', options.height.toString());
  if (options.quality) params.set('q', options.quality.toString());
  if (options.format) params.set('auto', options.format);
  if (options.fit) params.set('fit', options.fit);
  
  const queryString = params.toString();
  return queryString ? `${baseUrl}/${filename}?${queryString}` : `${baseUrl}/${filename}`;
}

/**
 * Generate a pixelated placeholder URL (20x20px) for instant loading
 */
export function generatePixelatedPlaceholder(imageUrl: string): string {
  return generateSanityImageUrl(imageUrl, {
    width: 20,
    height: 20,
    quality: 10,
    format: 'auto',
    fit: 'crop'
  });
}

/**
 * Generate optimized image URLs for different screen sizes
 */
export function generateResponsiveImageUrls(imageUrl: string) {
  return {
    // Pixelated placeholder for instant loading
    placeholder: generatePixelatedPlaceholder(imageUrl),
    
    // High-quality versions for different breakpoints
    small: generateSanityImageUrl(imageUrl, {
      width: 640,
      quality: 90,
      format: 'auto'
    }),
    
    medium: generateSanityImageUrl(imageUrl, {
      width: 1024,
      quality: 95,
      format: 'auto'
    }),
    
    large: generateSanityImageUrl(imageUrl, {
      width: 1920,
      quality: 95,
      format: 'auto'
    }),
    
    // Original high-quality version
    original: generateSanityImageUrl(imageUrl, {
      quality: 95,
      format: 'auto'
    })
  };
}

/**
 * Generate a data URL for a pixelated placeholder (for Next.js blurDataURL)
 */
export function generatePixelatedDataUrl(imageUrl: string): string {
  const pixelatedUrl = generatePixelatedPlaceholder(imageUrl);
  
  // For now, return the URL directly - we could enhance this to generate
  // actual base64 data URLs in the future if needed
  return pixelatedUrl;
}

/**
 * Get optimal image dimensions while maintaining aspect ratio
 */
export function getOptimalDimensions(
  originalWidth: number,
  originalHeight: number,
  maxWidth: number,
  maxHeight: number
) {
  const aspectRatio = originalWidth / originalHeight;
  
  let width = maxWidth;
  let height = maxWidth / aspectRatio;
  
  if (height > maxHeight) {
    height = maxHeight;
    width = maxHeight * aspectRatio;
  }
  
  return {
    width: Math.round(width),
    height: Math.round(height)
  };
}