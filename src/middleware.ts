import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Handle CORS for visual editing
  if (request.nextUrl.pathname.startsWith('/api/')) {
    const response = NextResponse.next()
    
    // Add CORS headers for Sanity Studio
    response.headers.set('Access-Control-Allow-Origin', 'https://spooky-books.sanity.studio')
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
    response.headers.set('Access-Control-Allow-Credentials', 'true')
    
    return response
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: '/api/:path*'
}