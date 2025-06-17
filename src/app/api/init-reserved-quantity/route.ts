import { NextResponse } from 'next/server'
import { createClient } from '@sanity/client'

const sanityClient = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || '0gbx06x6',
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: '2023-05-03',
  token: process.env.SANITY_API_TOKEN,
  useCdn: false,
})

export async function POST() {
  try {
    console.log('🔧 Initializing reservedQuantity fields for inventory management...')
    
    // Get all products that might be missing reservedQuantity fields
    const products = await sanityClient.fetch(`
      *[_type == "product" && !defined(reservedQuantity)] {
        _id,
        title,
        variants
      }
    `)
    
    console.log(`Found ${products.length} products needing reservedQuantity initialization`)
    
    if (products.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'All products already have reservedQuantity fields initialized',
        productsUpdated: 0
      })
    }
    
    const transaction = sanityClient.transaction()
    
    for (const product of products) {
      // Set main product reservedQuantity to 0
      transaction.patch(product._id, {
        set: { reservedQuantity: 0 }
      })
      console.log(`✅ Set reservedQuantity=0 for product: ${product.title}`)
      
      // Initialize reservedQuantity for variants if they exist
      if (product.variants && Array.isArray(product.variants)) {
        const updatedVariants = product.variants.map((variant: Record<string, unknown>) => ({
          ...variant,
          reservedQuantity: variant.reservedQuantity ?? 0 // Use nullish coalescing
        }))
        
        transaction.patch(product._id, {
          set: { variants: updatedVariants }
        })
        console.log(`✅ Updated ${updatedVariants.length} variants for: ${product.title}`)
      }
    }
    
    await transaction.commit()
    console.log('🎉 Successfully initialized reservedQuantity fields')
    
    return NextResponse.json({
      success: true,
      message: `Successfully initialized reservedQuantity fields for ${products.length} products`,
      productsUpdated: products.length,
      timestamp: new Date().toISOString(),
      nextSteps: [
        'Test stock reservation via /api/reserve-stock',
        'Verify checkout flow with stock validation',
        'Monitor logs for any reservation conflicts'
      ]
    })
    
  } catch (error) {
    console.error('❌ Error initializing reservedQuantity fields:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to initialize reservedQuantity fields',
      details: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}