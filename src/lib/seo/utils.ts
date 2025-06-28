/**
 * SEO Utility Functions for Spooky Books
 * Helper functions for generating metadata, structured data, and SEO optimizations
 */

import type { Metadata } from 'next'
import type { 
  ProductMetadata, 
  CategoryMetadata, 
  SEOMetadataOptions,
  StructuredData,
  ProductSchema,
  BreadcrumbSchema,
  SitemapURL 
} from './types'
import { siteConfig, defaultMetadata } from './config'

/**
 * Generate metadata for any page with SEO optimizations
 * @param options - SEO metadata configuration options
 * @returns Next.js Metadata object
 */
export function generateSEOMetadata(options: SEOMetadataOptions = {}): Metadata {
  const {
    title,
    description,
    canonical,
    noindex = false,
    nofollow = false,
    ogImage,
    ogType = 'website',
  } = options

  const metadata: Metadata = {
    ...defaultMetadata,
    title: title || defaultMetadata.title,
    description: description || defaultMetadata.description,
  }

  // Add canonical URL
  if (canonical) {
    metadata.alternates = {
      canonical,
    }
  }

  // Handle robots directives
  if (noindex || nofollow) {
    metadata.robots = {
      ...defaultMetadata.robots,
      index: !noindex,
      follow: !nofollow,
    }
  }

  // Override Open Graph data
  if (ogImage || ogType !== 'website') {
    metadata.openGraph = {
      ...defaultMetadata.openGraph,
      type: ogType,
      ...(ogImage && {
        images: [
          {
            url: ogImage,
            width: 1200,
            height: 630,
            alt: title || siteConfig.title,
          },
        ],
      }),
    }
  }

  return metadata
}

/**
 * Generate product-specific metadata
 * @param product - Product metadata configuration
 * @returns Next.js Metadata object with product-optimized SEO
 */
export function generateProductMetadata(product: ProductMetadata): Metadata {
  const title = `${product.title}${product.author ? ` by ${product.author}` : ''}`
  const description = `${product.description} ${product.price ? `$${product.price.toFixed(2)}` : ''} - ${product.availability === 'InStock' ? 'In Stock' : 'Limited Availability'} at ${siteConfig.name}.`
  
  return generateSEOMetadata({
    title,
    description: description.substring(0, 160), // Keep under 160 chars
    ogType: 'website', // Use 'website' instead of 'product' for Next.js compatibility
    ogImage: product.images[0],
  })
}

/**
 * Generate category page metadata
 * @param category - Category metadata configuration
 * @returns Next.js Metadata object for category pages
 */
export function generateCategoryMetadata(category: CategoryMetadata): Metadata {
  const title = `${category.title} - ${siteConfig.name}`
  const description = `${category.description}${category.productCount ? ` Browse ${category.productCount} unique items` : ''} available at ${siteConfig.name}.`
  
  return generateSEOMetadata({
    title,
    description: description.substring(0, 160),
    canonical: `${siteConfig.url}/products/category/${category.slug}`,
  })
}

/**
 * Generate product structured data (JSON-LD)
 * @param product - Product metadata
 * @param productUrl - Full product URL
 * @returns Product schema structured data
 */
export function generateProductSchema(product: ProductMetadata, productUrl: string): ProductSchema {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.title,
    description: product.description,
    image: product.images,
    brand: {
      '@type': 'Organization',
      name: siteConfig.name,
    },
    offers: {
      '@type': 'Offer',
      price: product.price.toString(),
      priceCurrency: product.currency,
      availability: `https://schema.org/${product.availability}`,
      url: productUrl,
    },
    ...(product.category && { category: product.category }),
    ...(product.isbn && { isbn: product.isbn }),
    ...(product.author && {
      author: {
        '@type': 'Person',
        name: product.author,
      },
    }),
    ...(product.publisher && {
      publisher: {
        '@type': 'Organization',
        name: product.publisher,
      },
    }),
  }
}

/**
 * Generate breadcrumb structured data
 * @param items - Array of breadcrumb items with name and url
 * @returns BreadcrumbList schema structured data
 */
export function generateBreadcrumbSchema(items: Array<{ name: string; url: string }>): BreadcrumbSchema {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  }
}

/**
 * Generate structured data script tag
 * @param data - Structured data object or array
 * @returns Script tag props for Next.js
 */
export function generateStructuredDataScript(data: StructuredData | StructuredData[]) {
  const jsonData = Array.isArray(data) ? data : [data]
  
  return {
    type: 'application/ld+json',
    dangerouslySetInnerHTML: {
      __html: JSON.stringify(jsonData, null, 0),
    },
  }
}

/**
 * Generate sitemap URLs for products
 * @param products - Array of products with slug and lastModified
 * @returns Array of sitemap URL entries
 */
export function generateProductSitemapUrls(
  products: Array<{ slug: string; lastModified?: Date }>
): SitemapURL[] {
  return products.map((product) => ({
    url: `${siteConfig.url}/products/${product.slug}`,
    lastModified: product.lastModified || new Date(),
    changeFrequency: 'weekly',
    priority: 0.8,
  }))
}

/**
 * Generate sitemap URLs for categories
 * @param categories - Array of categories with slug
 * @returns Array of sitemap URL entries
 */
export function generateCategorySitemapUrls(
  categories: Array<{ slug: string }>
): SitemapURL[] {
  return categories.map((category) => ({
    url: `${siteConfig.url}/products/category/${category.slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.7,
  }))
}

/**
 * Clean and optimize text for SEO
 * @param text - Raw text content
 * @param maxLength - Maximum character length
 * @returns Cleaned and truncated text
 */
export function cleanTextForSEO(text: string, maxLength = 160): string {
  return text
    .replace(/\s+/g, ' ') // Normalize whitespace
    .trim()
    .substring(0, maxLength)
    .replace(/\.$/, '') // Remove trailing period if truncated
    + (text.length > maxLength ? '...' : '')
}

/**
 * Validate and normalize URL
 * @param url - URL to validate
 * @param baseUrl - Base URL to resolve relative URLs
 * @returns Normalized absolute URL
 */
export function normalizeUrl(url: string, baseUrl = siteConfig.url): string {
  try {
    // If it's already absolute, return as-is
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url
    }
    
    // Handle relative URLs
    return new URL(url, baseUrl).toString()
  } catch {
    // Fallback to base URL if invalid
    return baseUrl
  }
}