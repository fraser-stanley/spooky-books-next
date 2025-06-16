import { sanityClient } from './client'
import { safeSanityFetch } from './live'
import { categoriesQuery, productsQuery, productsByCategoryQuery, productQuery, homepageQuery } from './groq'
import type { SanityCategory, SanityProduct, SanityHomepage } from './types'

export async function getCategories(): Promise<SanityCategory[]> {
  return safeSanityFetch({
    query: categoriesQuery,
    tags: ['categories']
  })
}

export async function getProducts(): Promise<SanityProduct[]> {
  return safeSanityFetch({
    query: productsQuery,
    tags: ['products']
  })
}

export async function getProductsByCategory(categorySlug: string): Promise<SanityProduct[]> {
  return safeSanityFetch({
    query: productsByCategoryQuery,
    params: { categorySlug },
    tags: [`products-${categorySlug}`]
  })
}

export async function getProduct(slug: string): Promise<SanityProduct | null> {
  return safeSanityFetch({
    query: productQuery,
    params: { slug },
    tags: [`product-${slug}`]
  })
}

export async function getHomepage(isDraft = false): Promise<SanityHomepage | null> {
  if (isDraft) {
    // For draft mode, still use the old method to avoid conflicts
    const client = sanityClient.withConfig({ 
      useCdn: false,
      token: process.env.SANITY_VIEWER_TOKEN,
      perspective: 'previewDrafts'
    })
    return client.fetch(homepageQuery)
  }
  
  return safeSanityFetch({
    query: homepageQuery,
    tags: ['homepage']
  })
}