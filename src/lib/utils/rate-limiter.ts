interface RateLimitEntry {
  count: number
  resetTime: number
}

interface RateLimitConfig {
  maxRequests: number
  windowMs: number
  skipSuccessfulRequests?: boolean
}

class RateLimiter {
  private store = new Map<string, RateLimitEntry>()
  private config: RateLimitConfig

  constructor(config: RateLimitConfig) {
    this.config = config
    
    // Clean up expired entries every 5 minutes
    setInterval(() => {
      this.cleanup()
    }, 5 * 60 * 1000)
  }

  /**
   * Check if request should be rate limited
   * @param identifier - Unique identifier (IP address, user ID, etc.)
   * @returns Rate limit info and whether request is allowed
   */
  check(identifier: string): {
    allowed: boolean
    remaining: number
    resetTime: number
    totalHits: number
  } {
    const now = Date.now()
    
    // Get or create entry for this identifier
    let entry = this.store.get(identifier)
    
    if (!entry || entry.resetTime <= now) {
      // Create new window
      entry = {
        count: 0,
        resetTime: now + this.config.windowMs
      }
      this.store.set(identifier, entry)
    }
    
    // Check if request is allowed
    const allowed = entry.count < this.config.maxRequests
    
    if (allowed) {
      entry.count++
    }
    
    return {
      allowed,
      remaining: Math.max(0, this.config.maxRequests - entry.count),
      resetTime: entry.resetTime,
      totalHits: entry.count
    }
  }

  /**
   * Record a successful request (if configured to skip successful requests from count)
   * @param identifier - Unique identifier
   */
  recordSuccess(identifier: string): void {
    if (this.config.skipSuccessfulRequests) {
      const entry = this.store.get(identifier)
      if (entry && entry.count > 0) {
        entry.count--
      }
    }
  }

  /**
   * Clean up expired entries
   */
  private cleanup(): void {
    const now = Date.now()
    for (const [key, entry] of this.store.entries()) {
      if (entry.resetTime <= now) {
        this.store.delete(key)
      }
    }
  }

  /**
   * Get current stats for monitoring
   */
  getStats(): {
    totalEntries: number
    activeWindows: number
  } {
    const now = Date.now()
    let activeWindows = 0
    
    for (const entry of this.store.values()) {
      if (entry.resetTime > now) {
        activeWindows++
      }
    }
    
    return {
      totalEntries: this.store.size,
      activeWindows
    }
  }
}

// Create rate limiter instances for different endpoints
export const checkoutRateLimiter = new RateLimiter({
  maxRequests: 5, // 5 checkout attempts per minute
  windowMs: 60 * 1000, // 1 minute window
  skipSuccessfulRequests: true // Don't count successful checkouts against limit
})

export const generalRateLimiter = new RateLimiter({
  maxRequests: 100, // 100 requests per minute for general API usage
  windowMs: 60 * 1000, // 1 minute window
  skipSuccessfulRequests: false
})

/**
 * Get client identifier from request (IP address with fallbacks)
 */
export function getClientIdentifier(request: Request): string {
  // Try to get real IP from various headers (for production behind proxies)
  const forwarded = request.headers.get('x-forwarded-for')
  const realIp = request.headers.get('x-real-ip')
  const cfConnectingIp = request.headers.get('cf-connecting-ip') // Cloudflare
  const vercelForwarded = request.headers.get('x-vercel-forwarded-for') // Vercel
  
  // Use the first available IP, fallback to a default
  const clientIp = forwarded?.split(',')[0]?.trim() || 
                  realIp || 
                  cfConnectingIp || 
                  vercelForwarded ||
                  'unknown'
  
  return clientIp
}

/**
 * Create rate limit response with appropriate headers
 */
export function createRateLimitResponse(result: {
  allowed: boolean
  remaining: number
  resetTime: number
  totalHits: number
}): Response {
  const headers = new Headers({
    'X-RateLimit-Limit': '5',
    'X-RateLimit-Remaining': result.remaining.toString(),
    'X-RateLimit-Reset': result.resetTime.toString(),
    'X-RateLimit-Used': result.totalHits.toString(),
    'Retry-After': Math.ceil((result.resetTime - Date.now()) / 1000).toString()
  })
  
  return new Response(
    JSON.stringify({
      error: 'Too many checkout attempts',
      message: `Rate limit exceeded. Try again in ${Math.ceil((result.resetTime - Date.now()) / 1000)} seconds.`,
      type: 'RATE_LIMIT_ERROR'
    }),
    {
      status: 429,
      headers: {
        'Content-Type': 'application/json',
        ...Object.fromEntries(headers)
      }
    }
  )
}