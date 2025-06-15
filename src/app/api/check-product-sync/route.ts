import { NextResponse } from 'next/server'
import { createClient } from '@sanity/client'

const sanityClient = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
  apiVersion: '2023-05-03',
  useCdn: true,
})

export async function GET() {
  try {
    const products = await sanityClient.fetch(`
      *[_type == "product"] {
        _id,
        title,
        "slug": slug.current,
        price,
        stripePriceId,
        stripeProductId
      }
    `)

    const synced = products.filter((p: any) => p.stripePriceId)
    const unsynced = products.filter((p: any) => !p.stripePriceId)

    return NextResponse.json({
      total: products.length,
      synced: synced.length,
      unsynced: unsynced.length,
      products: {
        synced: synced.map((p: any) => ({
          title: p.title,
          slug: p.slug,
          stripePriceId: p.stripePriceId
        })),
        unsynced: unsynced.map((p: any) => ({
          title: p.title,
          slug: p.slug,
          price: p.price
        }))
      }
    })

  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to check sync status' },
      { status: 500 }
    )
  }
}