import { NextRequest, NextResponse } from 'next/server'
import { cleanupExpiredReservations } from '@/lib/sanity/stock-operations'
import { inventoryHealthCheck } from '@/lib/utils/error-handling'
import { checkForOverselling } from '@/lib/utils/inventory-monitoring'
import { sanityClient } from '@/lib/sanity/client'
import { revalidatePath, revalidateTag } from 'next/cache'

/**
 * Autonomous Inventory Management API
 * Self-healing inventory system that responds to webhook triggers
 * Automatically fixes issues without manual intervention
 */

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { trigger, productId, force = false } = body

    console.log(`🤖 Autonomous inventory triggered: ${trigger}`)
    
    switch (trigger) {
      case 'stock-updated':
        return await handleStockUpdate(productId)
        
      case 'payment-completed':
        return await handlePaymentCompleted(productId)
        
      case 'checkout-expired':
        return await handleCheckoutExpired()
        
      case 'health-alert':
        return await handleHealthAlert(force)
        
      case 'emergency-cleanup':
        return await handleEmergencyCleanup()
        
      default:
        return NextResponse.json({
          error: `Unknown trigger: ${trigger}`,
          supportedTriggers: [
            'stock-updated',
            'payment-completed', 
            'checkout-expired',
            'health-alert',
            'emergency-cleanup'
          ]
        }, { status: 400 })
    }

  } catch (error) {
    console.error('🚨 Autonomous inventory error:', error)
    return NextResponse.json({
      success: false,
      error: 'Autonomous inventory system failure',
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}

async function handleStockUpdate(productId?: string) {
  console.log(`📦 Handling stock update for product: ${productId || 'all'}`)
  
  try {
    // If specific product, validate and revalidate
    if (productId) {
      const product = await sanityClient.fetch(
        `*[_type == "product" && slug.current == $productId][0]{ 
          _id, title, stockQuantity, reservedQuantity,
          variants[]{ size, stockQuantity, reservedQuantity }
        }`,
        { productId }
      )

      if (!product) {
        return NextResponse.json({
          success: false,
          message: `Product ${productId} not found`
        }, { status: 404 })
      }

      // Auto-fix any negative available stock
      await autoFixNegativeStock(product)
      
      // Revalidate specific product pages
      revalidatePath(`/products/${productId}`)
    } else {
      // Global stock update - revalidate all
      revalidatePath('/products')
      revalidateTag('products')
    }

    return NextResponse.json({
      success: true,
      message: 'Stock update handled autonomously',
      actions: ['negative-stock-check', 'cache-revalidation']
    })

  } catch (error) {
    console.error('❌ Stock update handling failed:', error)
    throw error
  }
}

async function handlePaymentCompleted(productId?: string) {
  console.log(`💳 Handling payment completion for product: ${productId || 'unknown'}`)
  
  try {
    // Run post-payment cleanup
    await cleanupExpiredReservations()
    
    // Revalidate product pages to show updated stock
    if (productId) {
      revalidatePath(`/products/${productId}`)
    }
    revalidatePath('/products')
    revalidateTag('products')

    return NextResponse.json({
      success: true,
      message: 'Payment completion handled autonomously',
      actions: ['reservation-cleanup', 'cache-revalidation']
    })

  } catch (error) {
    console.error('❌ Payment completion handling failed:', error)
    throw error
  }
}

async function handleCheckoutExpired() {
  console.log('⏰ Handling expired checkouts')
  
  try {
    // Clean up expired reservations immediately
    await cleanupExpiredReservations()
    
    // Revalidate to show newly available stock
    revalidatePath('/products')
    revalidateTag('products')

    return NextResponse.json({
      success: true,
      message: 'Checkout expiration handled autonomously',
      actions: ['expired-reservation-cleanup', 'stock-release', 'cache-revalidation']
    })

  } catch (error) {
    console.error('❌ Checkout expiration handling failed:', error)
    throw error
  }
}

async function handleHealthAlert(force = false) {
  console.log('🏥 Handling health alert - running diagnostics')
  
  try {
    // Run comprehensive health check
    const [healthCheck, oversellingIssues] = await Promise.all([
      inventoryHealthCheck(),
      checkForOverselling()
    ])

    const criticalIssues = oversellingIssues.issues.filter(i => i.severity === 'critical')
    const actions = []

    // Auto-fix critical overselling issues
    if (criticalIssues.length > 0 || force) {
      await autoFixOverselling(criticalIssues)
      actions.push('overselling-fix')
    }

    // Clean up if health issues detected
    if (!healthCheck.healthy || force) {
      await cleanupExpiredReservations()
      actions.push('health-cleanup')
    }

    // Revalidate if any fixes were applied
    if (actions.length > 0) {
      revalidatePath('/products')
      revalidateTag('products')
      actions.push('cache-revalidation')
    }

    return NextResponse.json({
      success: true,
      message: 'Health alert handled autonomously',
      healthStatus: healthCheck.healthy,
      criticalIssuesFixed: criticalIssues.length,
      actions
    })

  } catch (error) {
    console.error('❌ Health alert handling failed:', error)
    throw error
  }
}

async function handleEmergencyCleanup() {
  console.log('🚨 Emergency cleanup initiated')
  
  try {
    const actions = []

    // 1. Force cleanup of all expired reservations
    await cleanupExpiredReservations()
    actions.push('force-reservation-cleanup')

    // 2. Reset any negative available stock
    const productsWithIssues = await sanityClient.fetch(`
      *[_type == "product" && (
        reservedQuantity > stockQuantity ||
        count(variants[reservedQuantity > stockQuantity]) > 0
      )]{ _id, title }
    `)

    if (productsWithIssues.length > 0) {
      const transaction = sanityClient.transaction()
      
      for (const product of productsWithIssues) {
        // Reset reserved quantities to 0 for emergency cleanup
        transaction.patch(product._id, {
          set: { reservedQuantity: 0 }
        })
      }
      
      await transaction.commit()
      actions.push(`negative-stock-reset-${productsWithIssues.length}-products`)
    }

    // 3. Force complete cache revalidation
    revalidatePath('/products')
    revalidatePath('/products/category/Publications')
    revalidatePath('/products/category/apparel')
    revalidateTag('products')
    revalidateTag('categories')
    actions.push('full-cache-revalidation')

    return NextResponse.json({
      success: true,
      message: 'Emergency cleanup completed autonomously',
      productsFixed: productsWithIssues.length,
      actions
    })

  } catch (error) {
    console.error('❌ Emergency cleanup failed:', error)
    throw error
  }
}

async function autoFixNegativeStock(product: { _id: string; title?: string; stockQuantity: number; reservedQuantity?: number; variants?: Array<{ stockQuantity: number; reservedQuantity?: number }> }) {
  const transaction = sanityClient.transaction()
  let needsUpdate = false

  // Fix main product negative stock
  if ((product.reservedQuantity || 0) > product.stockQuantity) {
    transaction.patch(product._id, {
      set: { reservedQuantity: Math.max(0, product.stockQuantity) }
    })
    needsUpdate = true
  }

  // Fix variant negative stock
  if (product.variants) {
    product.variants.forEach((variant, index: number) => {
      if ((variant.reservedQuantity || 0) > variant.stockQuantity) {
        transaction.patch(product._id, {
          set: { [`variants[${index}].reservedQuantity`]: Math.max(0, variant.stockQuantity) }
        })
        needsUpdate = true
      }
    })
  }

  if (needsUpdate) {
    await transaction.commit()
    console.log(`🔧 Auto-fixed negative stock for ${product.title}`)
  }
}

async function autoFixOverselling(criticalIssues: Array<{ type: string; productId: string; [key: string]: unknown }>) {
  for (const issue of criticalIssues) {
    try {
      // Parse the issue and apply appropriate fix
      if (issue.type === 'negative_available_stock') {
        const productId = issue.productId
        const product = await sanityClient.fetch(
          `*[_type == "product" && slug.current == $productId][0]`,
          { productId }
        )
        
        if (product) {
          await autoFixNegativeStock(product)
        }
      }
    } catch (error) {
      console.error(`Failed to auto-fix issue for ${issue.productId}:`, error)
    }
  }
}

// GET endpoint for system status
export async function GET() {
  return NextResponse.json({
    system: 'Autonomous Inventory Management',
    status: 'operational',
    triggers: {
      'stock-updated': 'Handles product stock updates',
      'payment-completed': 'Handles successful payment processing',
      'checkout-expired': 'Handles expired checkout sessions',
      'health-alert': 'Responds to health monitoring alerts',
      'emergency-cleanup': 'Performs emergency system cleanup'
    },
    automation: {
      cleanupFrequency: 'Every 15 minutes via Vercel cron',
      healthChecks: 'Every 5 minutes via Vercel cron',
      autoRemediation: 'Every hour via Vercel cron'
    },
    usage: 'POST with { "trigger": "trigger_name", "productId": "optional" }'
  })
}