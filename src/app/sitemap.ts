/**
 * Dynamic Sitemap Generator for Spooky Books
 * Next.js 15 App Router sitemap function
 */

import { MetadataRoute } from 'next'
import { getProducts, getCategories } from '@/lib/sanity/queries'
import { siteConfig, sitemapConfig } from '@/lib/seo/config'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  try {
    // Fetch all products and categories from Sanity
    const [products, categories] = await Promise.all([
      getProducts(),
      getCategories(),
    ])

    // Static pages
    const staticUrls: MetadataRoute.Sitemap = [
      {
        url: siteConfig.url,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: sitemapConfig.priority.homepage,
      },
      {
        url: `${siteConfig.url}/products`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: sitemapConfig.priority.other,
      },
      {
        url: `${siteConfig.url}/cart`,
        lastModified: new Date(),
        changeFrequency: 'monthly',
        priority: sitemapConfig.priority.other,
      },
    ]

    // Product pages
    const productUrls: MetadataRoute.Sitemap = products.map(product => ({
      url: `${siteConfig.url}/products/${product.slug}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: sitemapConfig.priority.products,
    }))

    // Category pages
    const categoryUrls: MetadataRoute.Sitemap = categories.map(category => ({
      url: `${siteConfig.url}/products/category/${category.slug}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: sitemapConfig.priority.categories,
    }))

    // Combine all URLs
    return [...staticUrls, ...productUrls, ...categoryUrls]
  } catch (error) {
    console.error('Error generating sitemap:', error)
    // Return minimal sitemap on error
    return [
      {
        url: siteConfig.url,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 1.0,
      },
    ]
  }
}