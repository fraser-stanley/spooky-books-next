import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { sanityClient } from '@/lib/sanity/client'
import { reserveStock, type StockOperation } from '@/lib/sanity/stock-operations'
import { validateCartStock } from '@/lib/utils/stock-validation'
import type { SanityProduct } from '@/lib/sanity/types'
import { 
  checkoutRateLimiter, 
  getClientIdentifier, 
  createRateLimitResponse 
} from '@/lib/utils/rate-limiter'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-05-28.basil',
})

interface CartItem {
  id: string
  title: string
  quantity: number
  size?: string
}

interface CheckoutRequest {
  items: CartItem[]
  productData?: SanityProduct[] // Optional: reuse cart page data
  locale?: string
  currency?: string
}

export async function POST(request: NextRequest) {
  try {
    // Apply rate limiting
    const clientId = getClientIdentifier(request)
    const rateLimitResult = checkoutRateLimiter.check(clientId)
    
    if (!rateLimitResult.allowed) {
      console.log(`🚫 Rate limit exceeded for client: ${clientId} (${rateLimitResult.totalHits} attempts)`)
      return createRateLimitResponse(rateLimitResult)
    }
    
    console.log(`✅ Rate limit check passed for client: ${clientId} (${rateLimitResult.totalHits}/5 attempts)`)

    const { items, productData, locale = 'en-US', currency = 'USD' }: CheckoutRequest = await request.json()
    
    if (!items || items.length === 0) {
      return NextResponse.json(
        { error: 'Cart is empty' },
        { status: 400 }
      )
    }

    console.log(`🛒 Starting optimized checkout for ${items.length} items`)
    console.log(`🌍 Locale: ${locale}, Currency: ${currency}`)

    // Use provided product data or fetch if not available
    let products: SanityProduct[]
    
    if (productData && productData.length > 0) {
      console.log('📦 Using cached product data from cart')
      products = productData
    } else {
      console.log('🔍 Fetching fresh product data')
      const productIds = items.map(item => item.id)
      
      products = await sanityClient.fetch(
        `*[_type == "product" && slug.current in $productIds] {
          "id": slug.current,
          title,
          author,
          price,
          stockQuantity,
          reservedQuantity,
          stripePriceId,
          category->{title, "slug": slug.current},
          variants[]{
            size,
            stockQuantity,
            reservedQuantity,
            stripePriceId
          }
        }`,
        { productIds }
      )
    }

    console.log(`📋 Found ${products.length} products for checkout`)

    // Validate stock for all items
    const stockItems = items.map(item => ({
      productId: item.id,
      quantity: item.quantity,
      size: item.size
    }))
    const stockValidation = validateCartStock(products, stockItems)
    
    if (!stockValidation.isValid) {
      return NextResponse.json(
        { 
          error: 'Stock validation failed',
          details: stockValidation.errors,
          type: 'STOCK_ERROR'
        },
        { status: 409 } // Conflict
      )
    }

    // Build line items for Stripe and stock operations
    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = []
    const stockOperations: StockOperation[] = []

    for (const cartItem of items) {
      const product = products.find((p: SanityProduct) => p.id === cartItem.id)
      
      if (!product) {
        return NextResponse.json(
          { error: `Product not found: ${cartItem.id}` },
          { status: 400 }
        )
      }

      // Handle apparel with size variants
      if (cartItem.size && product.variants && product.variants.length > 0) {
        const variant = product.variants.find(v => v.size === cartItem.size)
        
        if (!variant) {
          return NextResponse.json(
            { error: `Size ${cartItem.size} not found for ${product.title}` },
            { status: 400 }
          )
        }

        // Use variant Stripe price if available
        if (variant.stripePriceId) {
          lineItems.push({
            price: variant.stripePriceId,
            quantity: cartItem.quantity,
          })
        } else {
          // Fallback to dynamic pricing with author in product name
          const productName = product.author 
            ? `${cartItem.title} (${cartItem.size.toUpperCase()}) by ${product.author}`
            : `${cartItem.title} (${cartItem.size.toUpperCase()})`
          
          lineItems.push({
            price_data: {
              currency: currency.toLowerCase(),
              product_data: {
                name: productName,
                metadata: {
                  product_id: cartItem.id,
                  size: cartItem.size,
                  ...(product.author && { author: product.author })
                }
              },
              unit_amount: Math.round(product.price * 100) // Convert to cents
            },
            quantity: cartItem.quantity,
          })
        }

        // Add stock operation for variant
        stockOperations.push({
          productId: product.id,
          size: cartItem.size,
          quantity: cartItem.quantity
        })

      } else {
        // Simple product (publications or non-sized apparel)
        if (product.stripePriceId) {
          lineItems.push({
            price: product.stripePriceId,
            quantity: cartItem.quantity,
          })
        } else {
          // Fallback to dynamic pricing with author in product name
          const productName = product.author 
            ? `${cartItem.title} by ${product.author}`
            : cartItem.title
          
          lineItems.push({
            price_data: {
              currency: currency.toLowerCase(),
              product_data: {
                name: productName,
                metadata: {
                  product_id: cartItem.id,
                  ...(product.author && { author: product.author })
                }
              },
              unit_amount: Math.round(product.price * 100) // Convert to cents
            },
            quantity: cartItem.quantity,
          })
        }

        // Add stock operation for simple product
        stockOperations.push({
          productId: product.id,
          quantity: cartItem.quantity
        })
      }
    }

    // Create Stripe checkout session
    console.log('💳 Creating Stripe session with optimized flow')
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
        }))),
        locale,
        currency
      }
    })

    console.log('✅ Stripe session created:', session.id)

    // Atomically reserve stock for 30 minutes (same as session expiration)
    const reservationResult = await reserveStock(stockOperations, session.id, 30)
    
    if (!reservationResult.success) {
      console.error('❌ Stock reservation failed:', reservationResult.errors)
      
      // Cancel the Stripe session since we couldn't reserve stock
      try {
        await stripe.checkout.sessions.expire(session.id)
        console.log('🔄 Cancelled Stripe session due to stock reservation failure')
      } catch (cancelError) {
        console.error('⚠️ Failed to cancel Stripe session:', cancelError)
      }
      
      return NextResponse.json(
        { 
          error: 'Unable to reserve stock for checkout',
          details: reservationResult.errors,
          type: 'RESERVATION_ERROR'
        },
        { status: 409 }
      )
    }

    console.log('✅ Stock reserved successfully for session:', session.id)
    console.log('🚀 Optimized checkout completed successfully')

    // Record successful checkout (reduces rate limit count)
    checkoutRateLimiter.recordSuccess(clientId)
    console.log(`📉 Rate limit count reduced for successful checkout: ${clientId}`)

    return NextResponse.json({
      sessionId: session.id,
      success: true
    })

  } catch (error) {
    console.error('💥 Optimized checkout error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to process checkout',
        type: 'SYSTEM_ERROR'
      },
      { status: 500 }
    )
  }
}