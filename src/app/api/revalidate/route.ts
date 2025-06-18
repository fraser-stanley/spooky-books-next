import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath, revalidateTag } from 'next/cache'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log(`🚀 Webhook received! Document type: ${body._type}, ID: ${body._id}`)
    
    // Validate webhook payload
    if (!body || !body._type) {
      console.log('❌ Invalid webhook payload - missing document type')
      return NextResponse.json(
        { error: 'Invalid payload - missing document type' },
        { status: 400 }
      )
    }

    // Handle homepage revalidation
    if (body._type === 'homepage') {
      console.log(`🔄 Revalidating homepage: ${body.title || body._id}`)
      
      revalidatePath('/')
      revalidateTag('homepage')
      
      console.log(`✅ Homepage revalidation complete`)
      
      return NextResponse.json({ 
        success: true, 
        message: 'Homepage revalidated successfully',
        documentType: 'homepage',
        revalidated: ['/']
      })
    }

    // Handle product revalidation
    if (body._type === 'product') {
      console.log(`🔄 Revalidating pages for product: ${body.title || body._id}`)
      
      // CRITICAL: Always revalidate ALL category pages when ANY product changes
      // This ensures products appear in correct categories immediately
      revalidatePath('/products')
      revalidatePath('/products/category/Publications')
      revalidatePath('/products/category/apparel')
      revalidatePath('/') // Homepage may show category-specific products
      
      // Revalidate specific product page if slug exists
      if (body.slug?.current) {
        revalidatePath(`/products/${body.slug.current}`)
      }
      
      // ENHANCED: Clear more comprehensive cache tags for category sync
      revalidateTag('products') // All product queries
      revalidateTag('categories') // Category listing queries
      revalidateTag('homepage') // Homepage product displays
      revalidateTag('publications') // Publications-specific cache
      revalidateTag('apparel') // Apparel-specific cache
      
      console.log(`✅ Product revalidation complete (with category sync): ${body.title || body._id}`)
      
      return NextResponse.json({ 
        success: true, 
        message: 'Product pages revalidated successfully',
        documentType: 'product',
        revalidated: [
          '/products',
          '/products/category/Publications', 
          '/products/category/apparel',
          '/', // Homepage for category-specific displays
          body.slug?.current ? `/products/${body.slug.current}` : null
        ].filter(Boolean)
      })
    }

    // Unsupported document type
    return NextResponse.json(
      { error: `Unsupported document type: ${body._type}` },
      { status: 400 }
    )

  } catch (error) {
    console.error('Revalidation error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to revalidate pages',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}