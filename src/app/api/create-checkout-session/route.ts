import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@sanity/client'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-05-28.basil',
})

const sanityClient = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
  apiVersion: '2023-05-03',
  useCdn: true,
})

interface CartItem {
  id: string
  title: string
  price: number
  quantity: number
  image?: string
  size?: string // For apparel products
}

export async function POST(request: NextRequest) {
  try {
    const { items }: { items: CartItem[] } = await request.json()

    if (!items || items.length === 0) {
      return NextResponse.json(
        { error: 'No items in cart' },
        { status: 400 }
      )
    }

    // Get stripePriceId and stock for each product from Sanity
    const productIds = items.map(item => item.id)
    const products = await sanityClient.fetch(
      `*[_type == "product" && slug.current in $productIds] {
        "id": slug.current,
        stripePriceId,
        title,
        price,
        stockQuantity,
        variants[]{
          size,
          stockQuantity,
          stripePriceId
        }
      }`,
      { productIds }
    )

    // Build line items for Stripe and check stock
    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = []

    for (const cartItem of items) {
      const product = products.find((p: {id: string}) => p.id === cartItem.id)
      
      if (!product) {
        return NextResponse.json(
          { error: `Product not found: ${cartItem.id}` },
          { status: 400 }
        )
      }

      let stripePriceId: string
      let availableStock: number
      let stockLabel: string

      // Handle apparel with size variants
      if (cartItem.size && product.variants && product.variants.length > 0) {
        const variant = product.variants.find((v: {size: string}) => v.size === cartItem.size)
        
        if (!variant) {
          return NextResponse.json(
            { error: `Size ${cartItem.size?.toUpperCase()} not found for "${cartItem.title}"` },
            { status: 400 }
          )
        }

        if (!variant.stripePriceId) {
          return NextResponse.json(
            { 
              error: `Size ${cartItem.size?.toUpperCase()} of "${cartItem.title}" is not available for purchase` 
            },
            { status: 400 }
          )
        }

        stripePriceId = variant.stripePriceId
        availableStock = variant.stockQuantity
        stockLabel = `"${cartItem.title}" in size ${cartItem.size?.toUpperCase()}`

      } else {
        // Handle simple products (publications)
        if (!product.stripePriceId) {
          return NextResponse.json(
            { 
              error: `Product "${cartItem.title}" is not available for purchase (no Stripe price ID)` 
            },
            { status: 400 }
          )
        }

        stripePriceId = product.stripePriceId
        availableStock = product.stockQuantity
        stockLabel = `"${cartItem.title}"`
      }

      // Check stock availability
      if (availableStock <= 0) {
        return NextResponse.json(
          { 
            error: `${stockLabel} is out of stock` 
          },
          { status: 400 }
        )
      }

      if (cartItem.quantity > availableStock) {
        return NextResponse.json(
          { 
            error: `Not enough stock for ${stockLabel}. Only ${availableStock} available, but ${cartItem.quantity} requested.` 
          },
          { status: 400 }
        )
      }

      lineItems.push({
        price: stripePriceId,
        quantity: cartItem.quantity,
      })
    }

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/cart/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/cart`,
      metadata: {
        cart_items: JSON.stringify(items.map(item => ({
          id: item.id,
          quantity: item.quantity
        })))
      }
    })

    return NextResponse.json({ sessionId: session.id })

  } catch (error) {
    console.error('Error creating checkout session:', error)
    
    return NextResponse.json(
      { 
        error: 'Failed to create checkout session',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}