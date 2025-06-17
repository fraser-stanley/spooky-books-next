import { NextResponse } from 'next/server'
import { createClient } from '@sanity/client'
import { v4 as uuidv4 } from 'uuid'

const sanityClient = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || '0gbx06x6',
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: '2023-05-03',
  token: process.env.SANITY_API_TOKEN,
  useCdn: false,
})

export async function POST() {
  try {
    console.log('🔧 Starting fix for missing variant _key properties...')
    
    // Get all products with variants
    const products = await sanityClient.fetch(`
      *[_type == "product" && defined(variants)] {
        _id,
        title,
        variants[]
      }
    `)

    console.log(`Found ${products.length} products with variants to check`)

    let fixedCount = 0

    for (const product of products) {
      if (!product.variants || product.variants.length === 0) continue

      let needsUpdate = false
      const updatedVariants = product.variants.map((variant: Record<string, unknown>) => {
        if (!variant._key) {
          needsUpdate = true
          console.log(`Adding missing _key to ${product.title} variant ${variant.size}`)
          return {
            ...variant,
            _key: uuidv4()
          }
        }
        return variant
      })

      if (needsUpdate) {
        await sanityClient
          .patch(product._id)
          .set({ variants: updatedVariants })
          .commit()
        
        fixedCount++
        console.log(`✅ Fixed missing keys for product: ${product.title}`)
      }
    }

    console.log(`✅ Fixed ${fixedCount} products with missing variant keys`)

    return NextResponse.json({
      success: true,
      message: `Fix completed successfully`,
      productsProcessed: products.length,
      productsFixed: fixedCount,
      details: `Added missing _key properties to variant arrays in ${fixedCount} products`
    })

  } catch (error) {
    console.error('Fix variant keys error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to fix variant keys',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}