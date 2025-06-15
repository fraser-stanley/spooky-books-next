import { sanityClient } from './client'
import { categoriesQuery, productsQuery, productsByCategoryQuery, productQuery, homepageQuery } from './groq'
import type { SanityCategory, SanityProduct, SanityHomepage } from './types'

export async function getCategories(): Promise<SanityCategory[]> {
  return sanityClient.fetch(categoriesQuery)
}

export async function getProducts(): Promise<SanityProduct[]> {
  return sanityClient.fetch(productsQuery)
}

export async function getProductsByCategory(categorySlug: string): Promise<SanityProduct[]> {
  return sanityClient.fetch(productsByCategoryQuery, { categorySlug })
}

export async function getProduct(slug: string): Promise<SanityProduct | null> {
  return sanityClient.fetch(productQuery, { slug })
}

export async function getHomepage(isDraft = false): Promise<SanityHomepage | null> {
  const client = isDraft 
    ? sanityClient.withConfig({ 
        useCdn: false,
        token: process.env.SANITY_VIEWER_TOKEN,
        perspective: 'previewDrafts'
      })
    : sanityClient

  return client.fetch(homepageQuery)
}