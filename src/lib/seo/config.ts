/**
 * SEO Configuration for Spooky Books
 * Centralized configuration for all SEO-related constants and settings
 */

import type { SiteConfig } from './types'

/**
 * Main site configuration
 */
export const siteConfig: SiteConfig = {
  name: 'Spooky Books',
  title: 'Spooky Books - Independent Art Book Publisher Since 2015',
  description: 'Independent publisher focused on the production and dissemination of limited edition artists books. Founded in 2015, featuring unique works by contemporary artists.',
  url: process.env.NEXT_PUBLIC_SITE_URL || 'https://spooky-books-next.vercel.app',
  ogImage: '/images/og-image.jpg',
  twitterHandle: '@spookybooks',
  author: 'Spooky Books',
  keywords: [
    'art books',
    'limited edition',
    'independent publisher',
    'artists books',
    'contemporary art',
    'book design',
    'art publication',
    'independent press',
    'artist publishing',
    'book art'
  ]
}

/**
 * Default meta tags for all pages
 */
export const defaultMetadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: siteConfig.title,
    template: `%s | ${siteConfig.name}`
  },
  description: siteConfig.description,
  keywords: siteConfig.keywords,
  authors: [{ name: siteConfig.author }],
  creator: siteConfig.author,
  publisher: siteConfig.author,
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large' as const,
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: siteConfig.url,
    siteName: siteConfig.name,
    title: siteConfig.title,
    description: siteConfig.description,
    images: [
      {
        url: siteConfig.ogImage,
        width: 1200,
        height: 630,
        alt: siteConfig.name,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: siteConfig.title,
    description: siteConfig.description,
    images: [siteConfig.ogImage],
    site: siteConfig.twitterHandle,
    creator: siteConfig.twitterHandle,
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png',
  },
  verification: {
    // Add verification tokens here when available
    // google: 'google-verification-token',
    // yandex: 'yandex-verification-token',
    // yahoo: 'yahoo-verification-token',
  },
}

/**
 * Structured data constants
 */
export const structuredDataConfig = {
  organization: {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: siteConfig.name,
    url: siteConfig.url,
    logo: `${siteConfig.url}/images/logo.jpg`,
    description: siteConfig.description,
    foundingDate: '2015',
    address: {
      '@type': 'PostalAddress',
      addressCountry: 'AU',
      addressRegion: 'Victoria',
      addressLocality: 'Melbourne',
    },
    sameAs: [
      'https://instagram.com/spooky.books/',
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'Customer Service',
      email: 'contact@spooky-books.com',
    },
  },
}

/**
 * Sitemap configuration
 */
export const sitemapConfig = {
  changeFrequency: 'weekly' as const,
  priority: {
    homepage: 1.0,
    products: 0.8,
    categories: 0.7,
    other: 0.5,
  },
}