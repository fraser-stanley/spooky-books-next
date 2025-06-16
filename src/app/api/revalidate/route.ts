import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath, revalidateTag } from 'next/cache'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate webhook payload
    if (!body || !body._type) {
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
      
      // Revalidate product-related pages
      revalidatePath('/products')
      revalidatePath('/products/category/Publications')
      revalidatePath('/products/category/apparel')
      
      // Revalidate specific product page if slug exists
      if (body.slug?.current) {
        revalidatePath(`/products/${body.slug.current}`)
      }
      
      // Revalidate by tags (if using tagged caching)
      revalidateTag('products')
      revalidateTag('categories')
      
      console.log(`✅ Product revalidation complete: ${body.title || body._id}`)
      
      return NextResponse.json({ 
        success: true, 
        message: 'Product pages revalidated successfully',
        documentType: 'product',
        revalidated: [
          '/products',
          '/products/category/Publications', 
          '/products/category/apparel',
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