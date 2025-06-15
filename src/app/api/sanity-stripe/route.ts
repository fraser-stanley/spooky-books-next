import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@sanity/client'

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-11-20.acacia',
})

// Initialize Sanity client with write permissions
const sanityClient = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
  token: process.env.SANITY_API_TOKEN!, // This needs a write token
  apiVersion: '2023-05-03',
  useCdn: false,
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate webhook payload
    if (!body || body._type !== 'product') {
      return NextResponse.json(
        { error: 'Invalid payload - not a product document' },
        { status: 400 }
      )
    }

    const product = body

    // Skip if this product already has a Stripe price ID
    if (product.stripePriceId) {
      console.log(`Product ${product._id} already has Stripe price ID: ${product.stripePriceId}`)
      return NextResponse.json({ 
        message: 'Product already has Stripe price ID', 
        stripePriceId: product.stripePriceId 
      })
    }

    // Validate required fields
    if (!product.title || !product.price || !product.slug?.current) {
      return NextResponse.json(
        { error: 'Missing required fields: title, price, or slug' },
        { status: 400 }
      )
    }

    console.log(`Creating Stripe product for: ${product.title}`)

    // Create Stripe product
    const stripeProduct = await stripe.products.create({
      name: product.title,
      description: product.description || undefined,
      metadata: {
        sanity_id: product._id,
        sanity_slug: product.slug.current,
        vendor: 'Spooky Books',
      },
    })

    const stripePriceInCents = Math.round(product.price * 100)
    const updateData: any = { stripeProductId: stripeProduct.id }

    // Handle variants (apparel with sizes) vs simple products
    const isApparel = product.category?.title === 'Apparel'
    if (isApparel && product.variants && product.variants.length > 0) {
      console.log(`Creating ${product.variants.length} variant prices for apparel product`)
      
      // Create Stripe price for each variant and update the variants array
      const updatedVariants = []
      
      for (const variant of product.variants) {
        const variantPrice = await stripe.prices.create({
          product: stripeProduct.id,
          unit_amount: stripePriceInCents,
          currency: 'usd',
          metadata: {
            sanity_id: product._id,
            sanity_slug: product.slug.current,
            size: variant.size,
          },
        })

        updatedVariants.push({
          ...variant,
          stripePriceId: variantPrice.id
        })

        console.log(`Created variant price: ${variantPrice.id} for size: ${variant.size}`)
      }

      updateData.variants = updatedVariants

    } else {
      // Simple product (publications) - create single price
      const stripePrice = await stripe.prices.create({
        product: stripeProduct.id,
        unit_amount: stripePriceInCents,
        currency: 'usd',
        metadata: {
          sanity_id: product._id,
          sanity_slug: product.slug.current,
        },
      })

      updateData.stripePriceId = stripePrice.id
      console.log(`Created simple price: ${stripePrice.id} for publication`)
    }

    // Update Sanity document with Stripe IDs
    await sanityClient
      .patch(product._id)
      .set(updateData)
      .commit()

    console.log(`Updated Sanity document ${product._id} with Stripe IDs`)

    return NextResponse.json({
      success: true,
      message: 'Product synced to Stripe successfully',
      stripeProductId: stripeProduct.id,
      hasVariants: !!(product.variants && product.variants.length > 0),
      variantCount: product.variants?.length || 0,
    })

  } catch (error) {
    console.error('Error in Sanity-Stripe webhook:', error)
    
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// Handle other HTTP methods
export async function GET() {
  return NextResponse.json(
    { message: 'Sanity-Stripe webhook endpoint. Use POST to sync products.' },
    { status: 200 }
  )
}