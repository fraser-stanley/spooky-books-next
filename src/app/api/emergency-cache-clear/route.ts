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
      'white-tote-bag', 'issue-1', 'issue-2'
    ]
    
    for (const productSlug of commonProducts) {
      revalidatePath(`/products/${productSlug}`)
    }
    
    // Clear tags
    revalidateTag('products')
    revalidateTag('categories')
    revalidateTag('homepage')
    
    console.log('✅ Emergency cache clear completed')
    
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