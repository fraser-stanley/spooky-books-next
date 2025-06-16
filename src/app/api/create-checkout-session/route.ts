import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@sanity/client'
import { reserveStock } from '@/lib/sanity/stock-operations'
import { validateCartStock } from '@/lib/utils/stock-validation'
import type { StockOperation } from '@/lib/sanity/stock-operations'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-05-28.basil',
})

const sanityClient = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
  apiVersion: '2023-05-03',
  token: process.env.SANITY_API_TOKEN, // Add API token for write operations
  useCdn: false, // Disable CDN for write operations
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
    console.log('🛒 Creating checkout session...')
    const { items }: { items: CartItem[] } = await request.json()
    console.log('📦 Cart items:', items)

    if (!items || items.length === 0) {
      return NextResponse.json(
        { error: 'No items in cart' },
        { status: 400 }
      )
    }

    // Get comprehensive product data from Sanity including reserved stock
    const productIds = items.map(item => item.id)
    console.log('🔍 Looking up products:', productIds)
    console.log('📦 Cart items with IDs:', items.map(item => ({ id: item.id, title: item.title, size: item.size })))
    
    const products = await sanityClient.fetch(
      `*[_type == "product" && slug.current in $productIds] {
        "id": slug.current,
        title,
        price,
        stockQuantity,
        reservedQuantity,
        category->{title, "slug": slug.current},
        variants[]{
          size,
          stockQuantity,
          reservedQuantity
        }
      }`,
      { productIds }
    )
    console.log('📋 Found products:', products.length)
    console.log('📋 Product details:', products.map((p: {id: string, title: string, variants?: unknown[]}) => ({ id: p.id, title: p.title, variants: p.variants?.length || 0 })))
    
    // Debug: Check which cart items don't have matching products
    const foundProductIds = products.map((p: {id: string}) => p.id)
    const missingProducts = productIds.filter(id => !foundProductIds.includes(id))
    if (missingProducts.length > 0) {
      console.log('❌ Missing products for cart items:', missingProducts)
    }

    // Validate cart stock before proceeding
    const stockValidation = validateCartStock(
      products,
      items.map(item => ({
        productId: item.id,
        quantity: item.quantity,
        size: item.size
      }))
    )

    if (!stockValidation.isValid) {
      return NextResponse.json(
        { 
          error: 'Stock validation failed',
          details: stockValidation.errors
        },
        { status: 409 } // Conflict
      )
    }

    // Build line items for Stripe
    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = []
    const stockOperations: StockOperation[] = []

    for (const cartItem of items) {
      const product = products.find((p: {id: string}) => p.id === cartItem.id)
      
      if (!product) {
        return NextResponse.json(
          { error: `Product not found: ${cartItem.id}` },
          { status: 400 }
        )
      }

      // Handle apparel with size variants
      if (cartItem.size && product.variants && product.variants.length > 0) {
        const variant = product.variants.find((v: {size: string}) => v.size === cartItem.size)
        
        if (!variant) {
          return NextResponse.json(
            { error: `Size ${cartItem.size?.toUpperCase()} of "${cartItem.title}" is not available` },
            { status: 400 }
          )
        }

        // Add to stock operations for reservation
        stockOperations.push({
          productId: cartItem.id,
          quantity: cartItem.quantity,
          size: cartItem.size
        })

      } else {
        // Add to stock operations for reservation
        stockOperations.push({
          productId: cartItem.id,
          quantity: cartItem.quantity
        })
      }

      // Use dynamic pricing with price_data (single source of truth from Sanity)
      lineItems.push({
        price_data: {
          currency: 'usd',
          product_data: {
            name: cartItem.title,
            metadata: {
              product_id: cartItem.id,
              ...(cartItem.size && { size: cartItem.size })
            }
          },
          unit_amount: Math.round(product.price * 100) // Convert to cents
        },
        quantity: cartItem.quantity,
      })
    }

    // Create Stripe checkout session first (get session ID for reservation)
    console.log('💳 Creating Stripe session with line items:', lineItems.length)
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/cart/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/cart`,
      expires_at: Math.floor(Date.now() / 1000) + (30 * 60), // 30 minutes
      metadata: {
        cart_items: JSON.stringify(items.map(item => ({
          id: item.id,
          quantity: item.quantity,
          size: item.size
        })))
      }
    })
    console.log('✅ Stripe session created:', session.id)

    // Reserve stock for 30 minutes (same as session expiration)
    const reservationResult = await reserveStock(stockOperations, session.id, 30)
    
    if (!reservationResult.success) {
      // If stock reservation fails, cancel the Stripe session
      try {
        await stripe.checkout.sessions.expire(session.id)
      } catch (expireError) {
        console.error('Failed to expire Stripe session after stock reservation failure:', expireError)
      }
      
      return NextResponse.json(
        { 
          error: 'Failed to reserve stock for checkout',
          details: reservationResult.errors
        },
        { status: 409 }
      )
    }

    return NextResponse.json({ 
      sessionId: session.id,
      expiresAt: new Date(Date.now() + 30 * 60 * 1000).toISOString()
    })

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