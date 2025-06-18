import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath, revalidateTag } from 'next/cache'

/**
 * Emergency Cache Clear API
 * Immediately clears all product-related cache to force fresh stock data
 * Use this when stock shows incorrectly due to cache issues
 */
export async function POST(request: NextRequest) {
  try {
    console.log('🚨 Emergency cache clear initiated')
    
    // Clear all product-related cache
    revalidatePath('/')
    revalidatePath('/products')
    revalidatePath('/products/category/Publications')
    revalidatePath('/products/category/apparel')
    
    // Clear all product detail pages (we'll clear common ones)
    const commonProducts = [
      'new-item', 'railcam', 'black-tote-bag', 'spooky-books-t-shirt',
      'white-tote-bag', 'issue-1', 'issue-2', 'spooky-books-magazine-issue-1',
      'spooky-books-magazine-issue-2', 'tote-bag', 'black-t-shirt', 'white-t-shirt'
    ]
    
    for (const productSlug of commonProducts) {
      revalidatePath(`/products/${productSlug}`)
    }
    
    // CRITICAL: Clear category-specific cache thoroughly
    // This addresses category sync issues when products move between categories
    revalidateTag('products') // All product queries
    revalidateTag('categories') // Category listing queries  
    revalidateTag('homepage') // Homepage product displays
    revalidateTag('publications') // Publications-specific cache
    revalidateTag('apparel') // Apparel-specific cache
    
    console.log('✅ Emergency cache clear completed (including category sync fix)')
    
    return NextResponse.json({
      success: true,
      message: 'All product cache cleared successfully',
      timestamp: new Date().toISOString(),
      cleared: [
        'Homepage',
        'Product listings',
        'Category pages', 
        'Product detail pages',
        'Cache tags'
      ]
    })
    
  } catch (error) {
    console.error('💥 Emergency cache clear failed:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to clear cache',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// GET endpoint for status check
export async function GET() {
  return NextResponse.json({
    endpoint: 'Emergency Cache Clear',
    purpose: 'Force immediate cache revalidation for stock synchronization',
    usage: 'POST to trigger cache clear',
    warning: 'Use only when stock data is stuck in cache',
    timing: 'Cache updates typically take 1-3 seconds to propagate'
  })
}