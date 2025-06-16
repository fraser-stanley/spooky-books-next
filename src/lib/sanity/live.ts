import { defineLive } from 'next-sanity'
import { sanityClient, liveClient } from './client'

export const { sanityFetch, SanityLive } = defineLive({ 
  client: liveClient,
  serverToken: process.env.SANITY_VIEWER_TOKEN,
  browserToken: process.env.SANITY_VIEWER_TOKEN, // Use same token for now
})

// Fallback fetch for static generation contexts where live queries can't be used
export async function safeSanityFetch<T>(options: {
  query: string
  params?: Record<string, unknown>
  tags?: string[]
}): Promise<T> {
  try {
    const { data } = await sanityFetch(options)
    return data
  } catch {
    // Fallback to regular client fetch during static generation
    return sanityClient.fetch(options.query, options.params)
  }
}