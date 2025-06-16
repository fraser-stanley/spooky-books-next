import { NextRequest, NextResponse } from 'next/server'
import { getProducts } from '@/lib/sanity/queries'
import { getAvailableStock } from '@/lib/utils/stock-validation'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const productIds = searchParams.get('productIds')?.split(',') || []
    
    if (productIds.length === 0) {
      return NextResponse.json(
        { error: 'No product IDs provided' },
        { status: 400 }
      )
    }

    // Get current product data
    const products = await getProducts()
    const filteredProducts = products.filter(p => productIds.includes(p.id))

    // Calculate stock status for each product
    const stockStatus = filteredProducts.map(product => {
      const result: Record<string, unknown> = {
        productId: product.id,
        title: product.title,
        category: product.category.title
      }

      if (product.variants && product.variants.length > 0) {
        // Apparel with variants
        result.variants = product.variants.map(variant => ({
          size: variant.size,
          totalStock: variant.stockQuantity,
          reservedStock: variant.reservedQuantity || 0,
          availableStock: getAvailableStock(product, variant.size),
          inStock: getAvailableStock(product, variant.size) > 0
        }))
      } else {
        // Publications
        result.totalStock = product.stockQuantity
        result.reservedStock = product.reservedQuantity || 0
        result.availableStock = getAvailableStock(product)
        result.inStock = getAvailableStock(product) > 0
      }

      return result
    })

    return NextResponse.json({
      success: true,
      stockStatus,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Stock status API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { items } = await request.json()
    
    if (!Array.isArray(items)) {
      return NextResponse.json(
        { error: 'Invalid request data. Expected items array.' },
        { status: 400 }
      )
    }

    // Get current product data
    const products = await getProducts()
    
    // Check stock for each requested item
    const stockChecks = items.map(item => {
      const product = products.find(p => p.id === item.productId)
      
      if (!product) {
        return {
          productId: item.productId,
          size: item.size,
          requestedQuantity: item.quantity,
          availableStock: 0,
          inStock: false,
          error: 'Product not found'
        }
      }

      const availableStock = getAvailableStock(product, item.size)
      
      return {
        productId: item.productId,
        size: item.size,
        requestedQuantity: item.quantity,
        availableStock,
        inStock: item.quantity <= availableStock,
        productTitle: product.title
      }
    })

    const allInStock = stockChecks.every(check => check.inStock)

    return NextResponse.json({
      success: true,
      allInStock,
      stockChecks,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Stock check API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}