import type { SanityProduct } from '@/lib/sanity/types'

export interface StockValidationResult {
  isValid: boolean
  availableQuantity: number
  requestedQuantity: number
  message?: string
}

export interface StockItem {
  productId: string
  quantity: number
  size?: string
}

/**
 * Calculate available stock for a product (total - reserved)
 */
export function getAvailableStock(product: SanityProduct, size?: string): number {
  if (size) {
    // For apparel with size variants
    const variant = product.variants?.find(v => v.size === size)
    if (!variant) return 0
    
    const reserved = variant.reservedQuantity || 0
    return Math.max(0, variant.stockQuantity - reserved)
  } else {
    // For publications (single stock)
    const reserved = product.reservedQuantity || 0
    return Math.max(0, product.stockQuantity - reserved)
  }
}

/**
 * Validate if requested quantity is available for a single product
 */
export function validateProductStock(
  product: SanityProduct, 
  requestedQuantity: number, 
  size?: string
): StockValidationResult {
  const availableQuantity = getAvailableStock(product, size)
  
  if (requestedQuantity <= 0) {
    return {
      isValid: false,
      availableQuantity,
      requestedQuantity,
      message: 'Quantity must be greater than 0'
    }
  }
  
  if (requestedQuantity > availableQuantity) {
    const sizeText = size ? ` in size ${size.toUpperCase()}` : ''
    return {
      isValid: false,
      availableQuantity,
      requestedQuantity,
      message: availableQuantity === 0 
        ? `${product.title}${sizeText} is sold out`
        : `Only ${availableQuantity} available${sizeText}, but ${requestedQuantity} requested`
    }
  }
  
  return {
    isValid: true,
    availableQuantity,
    requestedQuantity
  }
}

/**
 * Validate stock for multiple items (like a cart)
 */
export function validateCartStock(
  products: SanityProduct[],
  cartItems: StockItem[]
): { isValid: boolean; errors: string[]; validItems: StockItem[] } {
  const errors: string[] = []
  const validItems: StockItem[] = []
  
  for (const item of cartItems) {
    const product = products.find(p => p.id === item.productId)
    
    if (!product) {
      errors.push(`Product not found: ${item.productId}`)
      continue
    }
    
    const validation = validateProductStock(product, item.quantity, item.size)
    
    if (validation.isValid) {
      validItems.push(item)
    } else {
      errors.push(validation.message || 'Stock validation failed')
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    validItems
  }
}

/**
 * Check if a product is in stock (any quantity available)
 */
export function isInStock(product: SanityProduct, size?: string): boolean {
  return getAvailableStock(product, size) > 0
}

/**
 * Check if a product is low stock (3 or fewer available)
 */
export function isLowStock(product: SanityProduct, size?: string, threshold: number = 3): boolean {
  const available = getAvailableStock(product, size)
  return available > 0 && available <= threshold
}

/**
 * Get stock status text for UI display
 */
export function getStockStatusText(product: SanityProduct, size?: string): string | null {
  const available = getAvailableStock(product, size)
  
  if (available === 0) {
    return 'SOLD OUT'
  }
  
  if (available === 1) {
    return 'LAST ONE'
  }
  
  if (available <= 3) {
    return `ONLY ${available} LEFT`
  }
  
  return null
}

/**
 * Format product title with stock status
 */
export function formatTitleWithStock(title: string, product: SanityProduct, size?: string): string {
  const statusText = getStockStatusText(product, size)
  return statusText ? `${title} (${statusText})` : title
}