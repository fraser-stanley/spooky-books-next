import { NextRequest, NextResponse } from 'next/server'
import { sanityClient } from '@/lib/sanity/client'

/**
 * Debug Webhook Events API
 * Helps diagnose webhook delivery and stock deduction issues
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const productSlug = searchParams.get('product')
    const hours = parseInt(searchParams.get('hours') || '2')

    // Get recent stock changes for debugging
    const recentChanges = await sanityClient.fetch(
      `*[_type == "product" && defined(slug.current) && (!defined($productSlug) || slug.current == $productSlug)] | order(_updatedAt desc) [0...10] {
        _id,
        _updatedAt,
        title,
        "slug": slug.current,
        stockQuantity,
        reservedQuantity,
        variants[]{
          size,
          stockQuantity,
          reservedQuantity
        }
      }`,
      { productSlug }
    )

    // Get recent reservations (for debugging checkout process)
    const recentReservations = await sanityClient.fetch(
      `*[_type == "stockReservation"] | order(_createdAt desc) [0...10] {
        _id,
        _createdAt,
        sessionId,
        operations,
        expiresAt
      }`
    )

    // Calculate time threshold for recent activity
    const timeThreshold = new Date(Date.now() - hours * 60 * 60 * 1000).toISOString()

    return NextResponse.json({
      debug: 'Webhook Diagnostics',
      timeRange: `Last ${hours} hours`,
      timeThreshold,
      analysis: {
        recentProductUpdates: recentChanges.length,
        recentReservations: recentReservations.length,
        hasRecentActivity: recentChanges.some(p => p._updatedAt > timeThreshold)
      },
      data: {
        recentProducts: recentChanges,
        recentReservations: recentReservations
      },
      troubleshooting: {
        commonIssues: [
          'Webhook not configured in Stripe dashboard',
          'Webhook signature verification failing',
          'Cart metadata not properly stored in Stripe session',
          'Product slug mismatch between frontend and Sanity',
          'Transaction failing due to concurrent operations',
          'Stripe sandbox webhook delivery delays'
        ],
        checkPoints: [
          '1. Verify webhook is configured: https://dashboard.stripe.com/webhooks',
          '2. Check webhook delivery logs in Stripe dashboard',
          '3. Verify product slug matches between cart and Sanity',
          '4. Check Vercel function logs for webhook errors',
          '5. Test manual stock deduction via API'
        ]
      },
      manualTestUrls: {
        testStockDeduction: '/api/debug-webhooks/test-deduction',
        checkProductStock: `/api/debug-webhooks?product=${productSlug || 'PRODUCT_SLUG'}`
      }
    })

  } catch (error) {
    console.error('Webhook debug error:', error)
    return NextResponse.json({
      error: 'Failed to debug webhooks',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

/**
 * Manual Stock Deduction Test
 * Allows testing stock deduction without going through Stripe
 */
export async function POST(request: NextRequest) {
  try {
    const { productSlug, size, quantity = 1 } = await request.json()

    if (!productSlug) {
      return NextResponse.json(
        { error: 'productSlug is required' },
        { status: 400 }
      )
    }

    // Import deductStock function
    const { deductStock } = await import('@/lib/sanity/stock-operations')

    // Create stock operation
    const stockOperations = [{
      productId: productSlug,
      quantity: parseInt(quantity),
      ...(size && { size })
    }]

    console.log('🧪 Testing manual stock deduction:', stockOperations)

    // Attempt stock deduction
    const result = await deductStock(stockOperations)

    return NextResponse.json({
      test: 'Manual Stock Deduction',
      operation: stockOperations,
      result,
      success: result.success,
      ...(result.errors.length > 0 && { errors: result.errors }),
      note: 'This simulates what should happen when Stripe webhook fires'
    })

  } catch (error) {
    console.error('Manual stock deduction test failed:', error)
    return NextResponse.json({
      error: 'Manual test failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}