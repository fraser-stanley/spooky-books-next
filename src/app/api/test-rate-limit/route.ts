import { NextRequest, NextResponse } from 'next/server'
import { 
  checkoutRateLimiter, 
  getClientIdentifier 
} from '@/lib/utils/rate-limiter'

export async function GET(request: NextRequest) {
  try {
    // Only allow in development
    if (process.env.NODE_ENV !== 'development') {
      return NextResponse.json(
        { error: 'Test endpoint only available in development' },
        { status: 403 }
      )
    }

    const clientId = getClientIdentifier(request)
    const result = checkoutRateLimiter.check(clientId)
    
    return NextResponse.json({
      clientId,
      rateLimitResult: result,
      timestamp: new Date().toISOString(),
      message: result.allowed 
        ? `Rate limit check passed (${result.totalHits}/5 attempts)`
        : `Rate limit exceeded - wait ${Math.ceil((result.resetTime - Date.now()) / 1000)} seconds`
    })
  } catch (error) {
    console.error('Rate limit test error:', error)
    return NextResponse.json(
      { error: 'Test failed' },
      { status: 500 }
    )
  }
}