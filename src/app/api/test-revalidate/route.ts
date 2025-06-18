import { NextResponse } from 'next/server'
import { revalidatePath, revalidateTag } from 'next/cache'

export async function GET() {
  try {
    console.log('🧪 Manual revalidation test triggered')
    
    // Revalidate key pages
    revalidatePath('/')
    revalidatePath('/products')
    revalidateTag('products')
    revalidateTag('homepage')
    
    console.log('✅ Manual revalidation complete')
    
    return NextResponse.json({ 
      success: true, 
      message: 'Manual revalidation completed',
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('❌ Manual revalidation failed:', error)
    return NextResponse.json(
      { error: 'Revalidation failed' },
      { status: 500 }
    )
  }
}