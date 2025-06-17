import { createClient } from '@sanity/client'

const sanityClient = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || '0gbx06x6',
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: '2023-05-03',
  token: process.env.SANITY_API_TOKEN,
  useCdn: false,
})

export interface StockReservation {
  productId: string
  quantity: number
  size?: string
  sessionId: string
  expiresAt: Date
}

export interface StockOperation {
  productId: string
  quantity: number
  size?: string
}

/**
 * Reserve stock for a product during checkout
 * Uses atomic transaction to prevent race conditions
 */
export async function reserveStock(
  operations: StockOperation[],
  sessionId: string,
  expirationMinutes: number = 30
): Promise<{ success: boolean; errors: string[] }> {
  const errors: string[] = []
  
  console.log('🔧 Stock reservation environment check:', {
    projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
    dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
    hasToken: !!process.env.SANITY_API_TOKEN
  })
  
  try {
    // Start a transaction for atomic operations
    const transaction = sanityClient.transaction()
    
    for (const operation of operations) {
      const { productId, quantity, size } = operation
      
      // Get current product state
      const product = await sanityClient.fetch(
        `*[_type == "product" && slug.current == $productId][0]{
          _id,
          stockQuantity,
          reservedQuantity,
          title,
          variants[]{
            size,
            stockQuantity,
            reservedQuantity
          }
        }`,
        { productId }
      )
      
      if (!product) {
        errors.push(`Product not found: ${productId}`)
        continue
      }
      
      if (size) {
        // Handle apparel variant stock
        const variantIndex = product.variants?.findIndex((v: Record<string, unknown>) => v.size === size)
        
        if (variantIndex === -1 || variantIndex === undefined) {
          errors.push(`Size ${size} not found for product ${productId}`)
          continue
        }
        
        const variant = product.variants[variantIndex]
        const availableStock = variant.stockQuantity - (variant.reservedQuantity || 0)
        
        if (quantity > availableStock) {
          errors.push(`Insufficient stock for ${product.title} size ${size}. Available: ${availableStock}, Requested: ${quantity}`)
          continue
        }
        
        // Reserve stock for this variant
        // First set reservedQuantity to 0 if it doesn't exist, then increment
        transaction.patch(product._id, {
          setIfMissing: { [`variants[${variantIndex}].reservedQuantity`]: 0 }
        })
        transaction.patch(product._id, {
          inc: { [`variants[${variantIndex}].reservedQuantity`]: quantity }
        })
      } else {
        // Handle publication stock
        const availableStock = product.stockQuantity - (product.reservedQuantity || 0)
        
        if (quantity > availableStock) {
          errors.push(`Insufficient stock for ${product.title}. Available: ${availableStock}, Requested: ${quantity}`)
          continue
        }
        
        // Reserve stock for main product
        // First set reservedQuantity to 0 if it doesn't exist, then increment
        transaction.patch(product._id, {
          setIfMissing: { reservedQuantity: 0 }
        })
        transaction.patch(product._id, {
          inc: { reservedQuantity: quantity }
        })
      }
    }
    
    if (errors.length > 0) {
      return { success: false, errors }
    }
    
    // Commit the transaction
    await transaction.commit()
    
    // Store reservation metadata (for cleanup)
    await storeReservationMetadata(operations, sessionId, expirationMinutes)
    
    return { success: true, errors: [] }
    
  } catch (error) {
    console.error('Stock reservation failed:', error)
    return { 
      success: false, 
      errors: [`Stock reservation failed: ${error instanceof Error ? error.message : 'Unknown error'}`] 
    }
  }
}

/**
 * Release reserved stock (on payment failure or session expiration)
 */
export async function releaseStock(
  operations: StockOperation[]
): Promise<{ success: boolean; errors: string[] }> {
  // const errors: string[] = []
  
  try {
    const transaction = sanityClient.transaction()
    
    for (const operation of operations) {
      const { productId, quantity, size } = operation
      
      if (size) {
        // Release variant stock
        const product = await sanityClient.fetch(
          `*[_type == "product" && slug.current == $productId][0]{
            _id,
            variants[]{size, stockQuantity, reservedQuantity}
          }`,
          { productId }
        )
        
        const variantIndex = product?.variants?.findIndex((v: Record<string, unknown>) => v.size === size)
        
        if (variantIndex !== -1 && variantIndex !== undefined) {
          transaction.patch(product._id, {
            dec: { [`variants[${variantIndex}].reservedQuantity`]: quantity }
          })
        }
      } else {
        // Release main product stock  
        const product = await sanityClient.fetch(
          `*[_type == "product" && slug.current == $productId][0]{_id}`,
          { productId }
        )
        
        if (product) {
          transaction.patch(product._id, {
            dec: { reservedQuantity: quantity }
          })
        }
      }
    }
    
    await transaction.commit()
    return { success: true, errors: [] }
    
  } catch (error) {
    console.error('Stock release failed:', error)
    return { 
      success: false, 
      errors: [`Stock release failed: ${error instanceof Error ? error.message : 'Unknown error'}`] 
    }
  }
}

/**
 * Deduct stock permanently (on successful payment)
 * Reduces both reserved and actual stock
 */
export async function deductStock(
  operations: StockOperation[]
): Promise<{ success: boolean; errors: string[] }> {
  // const errors: string[] = []
  
  try {
    const transaction = sanityClient.transaction()
    
    for (const operation of operations) {
      const { productId, quantity, size } = operation
      
      if (size) {
        // Deduct variant stock
        const product = await sanityClient.fetch(
          `*[_type == "product" && slug.current == $productId][0]{
            _id,
            variants[]{size, stockQuantity, reservedQuantity}
          }`,
          { productId }
        )
        
        const variantIndex = product?.variants?.findIndex((v: Record<string, unknown>) => v.size === size)
        
        if (variantIndex !== -1 && variantIndex !== undefined) {
          transaction.patch(product._id, {
            dec: { 
              [`variants[${variantIndex}].stockQuantity`]: quantity,
              [`variants[${variantIndex}].reservedQuantity`]: quantity
            }
          })
        }
      } else {
        // Deduct main product stock
        const product = await sanityClient.fetch(
          `*[_type == "product" && slug.current == $productId][0]{_id}`,
          { productId }
        )
        
        if (product) {
          transaction.patch(product._id, {
            dec: { 
              stockQuantity: quantity,
              reservedQuantity: quantity
            }
          })
        }
      }
    }
    
    await transaction.commit()
    return { success: true, errors: [] }
    
  } catch (error) {
    console.error('Stock deduction failed:', error)
    return { 
      success: false, 
      errors: [`Stock deduction failed: ${error instanceof Error ? error.message : 'Unknown error'}`] 
    }
  }
}

/**
 * Store reservation metadata for cleanup
 */
async function storeReservationMetadata(
  operations: StockOperation[],
  sessionId: string,
  expirationMinutes: number
) {
  const expiresAt = new Date(Date.now() + expirationMinutes * 60 * 1000)
  
  const reservationDoc = {
    _type: 'stockReservation',
    sessionId,
    operations,
    expiresAt: expiresAt.toISOString(),
    createdAt: new Date().toISOString()
  }
  
  try {
    await sanityClient.create(reservationDoc)
  } catch (error) {
    console.error('Failed to store reservation metadata:', error)
    // Non-critical error - don't fail the entire operation
  }
}

/**
 * Clean up expired reservations
 */
export async function cleanupExpiredReservations(): Promise<void> {
  try {
    const now = new Date().toISOString()
    
    // Find expired reservations
    const expiredReservations = await sanityClient.fetch(
      `*[_type == "stockReservation" && expiresAt < $now]`,
      { now }
    )
    
    // Release stock for each expired reservation
    for (const reservation of expiredReservations) {
      await releaseStock(reservation.operations)
      
      // Delete the reservation document
      await sanityClient.delete(reservation._id)
    }
    
  } catch (error) {
    console.error('Cleanup of expired reservations failed:', error)
  }
}