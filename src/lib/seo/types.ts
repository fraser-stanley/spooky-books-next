/**
 * SEO Types and Interfaces for Spooky Books Next.js Site
 * Provides comprehensive type definitions for metadata, structured data, and SEO utilities
 */

// SEO Types and Interfaces - removed unused Metadata import

/**
 * Base site configuration for consistent SEO metadata
 */
export interface SiteConfig {
  name: string
  title: string
  description: string
  url: string
  ogImage: string
  twitterHandle?: string
  author: string
  keywords: string[]
}

/**
 * Extended metadata for product pages
 */
export interface ProductMetadata {
  title: string
  description: string
  author?: string
  price: number
  currency: string
  availability: 'InStock' | 'OutOfStock' | 'LimitedAvailability'
  category: string
  images: string[]
  isbn?: string
  publisher: string
  publishedDate?: string
}

/**
 * Category page metadata configuration
 */
export interface CategoryMetadata {
  title: string
  description: string
  slug: string
  productCount?: number
}

/**
 * JSON-LD structured data types
 */
export interface StructuredData {
  '@context': string
  '@type': string
  [key: string]: any
}

/**
 * Organization schema for homepage
 */
export interface OrganizationSchema extends StructuredData {
  '@type': 'Organization'
  name: string
  url: string
  logo: string
  description: string
  foundingDate: string
  address?: {
    '@type': 'PostalAddress'
    addressCountry: string
    addressRegion?: string
    addressLocality?: string
  }
  sameAs: string[]
  contactPoint?: {
    '@type': 'ContactPoint'
    contactType: string
    email: string
  }
}

/**
 * Product schema for product pages
 */
export interface ProductSchema extends StructuredData {
  '@type': 'Product'
  name: string
  description: string
  image: string[]
  brand: {
    '@type': 'Organization'
    name: string
  }
  offers: {
    '@type': 'Offer'
    price: string
    priceCurrency: string
    availability: string
    url: string
  }
  category?: string
  isbn?: string
  author?: {
    '@type': 'Person'
    name: string
  }
  publisher?: {
    '@type': 'Organization'
    name: string
  }
}

/**
 * BreadcrumbList schema for navigation
 */
export interface BreadcrumbSchema extends StructuredData {
  '@type': 'BreadcrumbList'
  itemListElement: Array<{
    '@type': 'ListItem'
    position: number
    name: string
    item: string
  }>
}

/**
 * SEO metadata generation options
 */
export interface SEOMetadataOptions {
  title?: string
  description?: string
  canonical?: string
  noindex?: boolean
  nofollow?: boolean
  ogImage?: string
  ogType?: 'website' | 'article'
  structuredData?: StructuredData[]
  alternates?: {
    languages?: Record<string, string>
  }
}

/**
 * Sitemap URL entry
 */
export interface SitemapURL {
  url: string
  lastModified?: Date
  changeFrequency?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never'
  priority?: number
}

/**
 * Meta tag configuration
 */
export interface MetaTagConfig {
  name?: string
  property?: string
  content: string
}