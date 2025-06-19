import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { headers } from 'next/headers'
import { deductStock, releaseStock } from '@/lib/sanity/stock-operations'
import { sanityClient } from '@/lib/sanity/client'
import type { StockOperation } from '@/lib/sanity/stock-operations'
import { revalidatePath, revalidateTag } from 'next/cache'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-05-28.basil',
})

// Store processed webhook events to prevent duplicates
const processedEvents = new Map<string, boolean>()

export async function POST(request: NextRequest) {
  const body = await request.text()
  const headersList = await headers()
  const signature = headersList.get('stripe-signature')!

  let event: Stripe.Event

  try {
    // Verify webhook signature
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err) {
    console.error('Webhook signature verification failed:', err)
    return NextResponse.json(
      { error: 'Invalid signature' },
      { status: 400 }
    )
  }

  // Check for duplicate events (idempotency)
  if (processedEvents.has(event.id)) {
    console.log(`Event ${event.id} already processed, skipping`)
    return NextResponse.json({ received: true })
  }

  console.log(`Processing Stripe webhook: ${event.type} (${event.id})`)

  try {
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutSessionCompleted(event.data.object as Stripe.Checkout.Session)
        break
        
      case 'checkout.session.expired':
        await handleCheckoutSessionExpired(event.data.object as Stripe.Checkout.Session)
        break
        
      case 'checkout.session.async_payment_failed':
        await handleCheckoutSessionExpired(event.data.object as Stripe.Checkout.Session)
        break
        
      case 'payment_intent.succeeded':
        await handlePaymentSucceeded(event.data.object as Stripe.PaymentIntent)
        break
        
      case 'payment_intent.payment_failed':
        await handlePaymentFailed(event.data.object as Stripe.PaymentIntent)
        break
        
      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    // Mark event as processed
    processedEvents.set(event.id, true)
    
    // Clean up old processed events (keep last 1000)
    if (processedEvents.size > 1000) {
      const oldestKeys = Array.from(processedEvents.keys()).slice(0, 100)
      oldestKeys.forEach(key => processedEvents.delete(key))
    }

    return NextResponse.json({ received: true })

  } catch (error) {
    console.error(`Error processing webhook ${event.type}:`, error)
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}

async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
  console.log(`Checkout session completed: ${session.id}`)
  
  // Stock deduction will be handled by payment_intent.succeeded
  // This is just for logging/analytics
  
  try {
    const cartItems = JSON.parse(session.metadata?.cart_items || '[]')
    console.log(`Session ${session.id} completed with ${cartItems.length} items`)
  } catch (error) {
    console.error('Failed to parse cart items from session metadata:', error)
  }
}

async function handleCheckoutSessionExpired(session: Stripe.Checkout.Session) {
  console.log(`Checkout session expired: ${session.id}`)
  
  try {
    // Parse cart items from metadata
    const cartItems = JSON.parse(session.metadata?.cart_items || '[]')
    
    if (cartItems.length === 0) {
      console.log('No cart items found in expired session metadata')
      return
    }

    // Convert to stock operations
    const stockOperations: StockOperation[] = cartItems.map((item: Record<string, unknown>) => ({
      productId: item.id,
      quantity: item.quantity,
      size: item.size
    }))

    // Release reserved stock
    const result = await releaseStock(stockOperations)
    
    if (result.success) {
      console.log(`Released stock for expired session ${session.id}`)
      
      // Immediately revalidate cache to show released stock
      revalidatePath('/products')
      revalidatePath('/products/category/Publications')
      revalidatePath('/products/category/apparel')
      revalidateTag('products')
      
      // Revalidate specific product pages
      for (const operation of stockOperations) {
        revalidatePath(`/products/${operation.productId}`)
      }
      
      console.log(`🔄 Cache revalidated after stock release`)
    } else {
      console.error(`Failed to release stock for expired session ${session.id}:`, result.errors)
    }

    // Clean up reservation document
    await cleanupReservation(session.id)

    // Trigger autonomous inventory response for checkout expiration
    try {
      await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/autonomous-inventory`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          trigger: 'checkout-expired'
        })
      })
      console.log(`🤖 Autonomous inventory notified of checkout expiration`)
    } catch (error) {
      console.warn('⚠️ Failed to notify autonomous inventory:', error)
      // Non-critical - don't fail the main operation
    }

  } catch (error) {
    console.error(`Error handling expired session ${session.id}:`, error)
  }
}

async function handlePaymentSucceeded(paymentIntent: Stripe.PaymentIntent) {
  console.log(`Payment succeeded: ${paymentIntent.id}`)
  
  try {
    // Get the checkout session associated with this payment
    const sessions = await stripe.checkout.sessions.list({
      payment_intent: paymentIntent.id,
      limit: 1
    })

    if (sessions.data.length === 0) {
      console.log(`No checkout session found for payment intent ${paymentIntent.id}`)
      return
    }

    const session = sessions.data[0]
    const cartItems = JSON.parse(session.metadata?.cart_items || '[]')
    
    if (cartItems.length === 0) {
      console.log('No cart items found in session metadata')
      return
    }

    // Convert to stock operations
    const stockOperations: StockOperation[] = cartItems.map((item: Record<string, unknown>) => ({
      productId: item.id,
      quantity: item.quantity,
      size: item.size
    }))

    // Deduct stock permanently (reduces both actual and reserved stock)
    const result = await deductStock(stockOperations)
    
    if (result.success) {
      console.log(`Successfully deducted stock for payment ${paymentIntent.id}`)
      
      // CRITICAL: Immediately revalidate cache to prevent overselling
      revalidatePath('/products')
      revalidatePath('/products/category/Publications')
      revalidatePath('/products/category/apparel')
      revalidateTag('products')
      
      // Revalidate specific product pages for faster updates
      for (const operation of stockOperations) {
        revalidatePath(`/products/${operation.productId}`)
      }
      
      console.log(`🔄 Cache revalidated immediately after stock deduction`)
    } else {
      console.error(`Failed to deduct stock for payment ${paymentIntent.id}:`, result.errors)
      // TODO: Add alerting for failed stock deduction on successful payment
    }

    // Clean up reservation document
    await cleanupReservation(session.id)

    // Trigger autonomous inventory response for payment completion
    try {
      await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/autonomous-inventory`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          trigger: 'payment-completed'
        })
      })
      console.log(`🤖 Autonomous inventory notified of payment completion`)
    } catch (error) {
      console.warn('⚠️ Failed to notify autonomous inventory:', error)
      // Non-critical - don't fail the main operation
    }

  } catch (error) {
    console.error(`Error handling successful payment ${paymentIntent.id}:`, error)
  }
}

async function handlePaymentFailed(paymentIntent: Stripe.PaymentIntent) {
  console.log(`Payment failed: ${paymentIntent.id}`)
  
  try {
    // Get the checkout session associated with this payment
    const sessions = await stripe.checkout.sessions.list({
      payment_intent: paymentIntent.id,
      limit: 1
    })

    if (sessions.data.length === 0) {
      console.log(`No checkout session found for failed payment intent ${paymentIntent.id}`)
      return
    }

    const session = sessions.data[0]
    const cartItems = JSON.parse(session.metadata?.cart_items || '[]')
    
    if (cartItems.length === 0) {
      console.log('No cart items found in session metadata')
      return
    }

    // Convert to stock operations
    const stockOperations: StockOperation[] = cartItems.map((item: Record<string, unknown>) => ({
      productId: item.id,
      quantity: item.quantity,
      size: item.size
    }))

    // Release reserved stock
    const result = await releaseStock(stockOperations)
    
    if (result.success) {
      console.log(`Released stock for failed payment ${paymentIntent.id}`)
    } else {
      console.error(`Failed to release stock for failed payment ${paymentIntent.id}:`, result.errors)
    }

    // Clean up reservation document
    await cleanupReservation(session.id)

  } catch (error) {
    console.error(`Error handling failed payment ${paymentIntent.id}:`, error)
  }
}

async function cleanupReservation(sessionId: string) {
  try {
    const reservations = await sanityClient.fetch(
      `*[_type == "stockReservation" && sessionId == $sessionId]`,
      { sessionId }
    )
    
    for (const reservation of reservations) {
      await sanityClient.delete(reservation._id)
    }
    
    console.log(`Cleaned up reservation documents for session ${sessionId}`)
  } catch (error) {
    console.error(`Failed to cleanup reservation for session ${sessionId}:`, error)
    // Non-critical error - don't fail the webhook
  }
}