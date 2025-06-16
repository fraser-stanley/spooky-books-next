import type { SanityProduct } from '@/lib/sanity/types'

interface CacheEntry {
  data: SanityProduct[]
  timestamp: number
  expires: number
}

class StockCache {
  private cache = new Map<string, CacheEntry>()
  private readonly DEFAULT_TTL = 30000 // 30 seconds

  set(key: string, data: SanityProduct[], ttl: number = this.DEFAULT_TTL): void {
    const now = Date.now()
    this.cache.set(key, {
      data,
      timestamp: now,
      expires: now + ttl
    })
  }

  get(key: string): SanityProduct[] | null {
    const entry = this.cache.get(key)
    
    if (!entry) {
      return null
    }

    // Check if expired
    if (Date.now() > entry.expires) {
      this.cache.delete(key)
      return null
    }

    return entry.data
  }

  clear(): void {
    this.cache.clear()
  }

  // Clean up expired entries
  cleanup(): void {
    const now = Date.now()
    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expires) {
        this.cache.delete(key)
      }
    }
  }

  // Get cache key for product IDs
  getProductCacheKey(productIds: string[]): string {
    return `products:${productIds.sort().join(',')}`
  }

  // Cache all products
  cacheAllProducts(products: SanityProduct[]): void {
    this.set('all-products', products, 60000) // 1 minute TTL for all products
  }

  getAllProducts(): SanityProduct[] | null {
    return this.get('all-products')
  }
}

// Singleton instance
export const stockCache = new StockCache()

// Clean up expired entries every 5 minutes
if (typeof window !== 'undefined') {
  setInterval(() => {
    stockCache.cleanup()
  }, 5 * 60 * 1000)
}

// Debounced fetch function
export function createDebouncedFetch<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  delay: number = 300
): T {
  let timeoutId: NodeJS.Timeout | null = null
  let latestResolve: ((value: any) => void) | null = null
  let latestReject: ((reason: any) => void) | null = null

  return ((...args: Parameters<T>) => {
    return new Promise((resolve, reject) => {
      // Cancel previous timeout
      if (timeoutId) {
        clearTimeout(timeoutId)
      }

      // Store latest resolve/reject
      latestResolve = resolve
      latestReject = reject

      // Set new timeout
      timeoutId = setTimeout(async () => {
        try {
          const result = await fn(...args)
          latestResolve?.(result)
        } catch (error) {
          latestReject?.(error)
        }
      }, delay)
    })
  }) as T
}