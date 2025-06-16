import { NextResponse } from 'next/server'
import { createClient } from '@sanity/client'

const sanityClient = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
  apiVersion: '2023-05-03',
  token: process.env.SANITY_API_TOKEN,
  useCdn: false,
})

export async function POST() {
  try {
    console.log('🧹 Starting cleanup of unknown reservedQuantity fields...')
    
    // Get all products with any reservedQuantity fields
    const products = await sanityClient.fetch(`
      *[_type == "product"] {
        _id,
        title,
        reservedQuantity,
        variants[]{
          size,
          stockQuantity,
          reservedQuantity
        }
      }
    `)

    console.log(`Found ${products.length} products to check`)

    let cleanedCount = 0

    for (const product of products) {
      let needsUpdate = false
      const fieldsToUnset: string[] = []
      const fieldsToSet: Record<string, unknown> = {}

      // Remove main product reservedQuantity if it exists and is not in schema
      if (product.reservedQuantity !== undefined) {
        fieldsToUnset.push('reservedQuantity')
        needsUpdate = true
        console.log(`Removing reservedQuantity from product: ${product.title}`)
      }

      // Clean up variant reservedQuantity fields
      if (product.variants && product.variants.length > 0) {
        const cleanedVariants = product.variants.map((variant: Record<string, unknown>) => {
          const { reservedQuantity, ...cleanVariant } = variant
          if (reservedQuantity !== undefined) {
            console.log(`Removing reservedQuantity from ${product.title} variant ${variant.size}`)
            needsUpdate = true
          }
          return cleanVariant
        })

        if (needsUpdate) {
          fieldsToSet['variants'] = cleanedVariants
        }
      }

      if (needsUpdate) {
        let patch = sanityClient.patch(product._id)
        
        if (fieldsToUnset.length > 0) {
          patch = patch.unset(fieldsToUnset)
        }
        
        if (Object.keys(fieldsToSet).length > 0) {
          patch = patch.set(fieldsToSet)
        }
        
        await patch.commit()
        cleanedCount++
      }
    }

    console.log(`✅ Cleaned ${cleanedCount} products`)

    return NextResponse.json({
      success: true,
      message: `Cleanup completed successfully`,
      productsProcessed: products.length,
      productsCleaned: cleanedCount,
      details: `Removed unknown reservedQuantity fields from ${cleanedCount} products`
    })

  } catch (error) {
    console.error('Cleanup error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to cleanup reserved fields',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}