import { sanityClient } from '@/lib/sanity/client'

export interface ErrorLog {
  type: 'stock_validation' | 'stock_reservation' | 'stock_deduction' | 'webhook_processing'
  message: string
  details?: Record<string, unknown>
  sessionId?: string
  productId?: string
  userId?: string
  timestamp: string
  severity: 'low' | 'medium' | 'high' | 'critical'
}

/**
 * Log errors to Sanity for monitoring and debugging
 */
export async function logError(error: ErrorLog): Promise<void> {
  try {
    await sanityClient.create({
      _type: 'errorLog',
      ...error,
      _id: `error-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    })
  } catch (logError) {
    console.error('Failed to log error to Sanity:', logError)
    // Fallback to console logging
    console.error('Original error:', error)
  }
}

/**
 * Retry function with exponential backoff
 */
export async function retryWithBackoff<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  let lastError: Error
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await operation()
    } catch (error) {
      lastError = error as Error
      
      if (attempt === maxRetries) {
        throw lastError
      }
      
      // Exponential backoff with jitter
      const delay = baseDelay * Math.pow(2, attempt) + Math.random() * 1000
      await new Promise(resolve => setTimeout(resolve, delay))
    }
  }
  
  throw lastError!
}

/**
 * Wrap stock operations with error handling and logging
 */
export async function safeStockOperation<T>(
  operationType: string,
  operation: () => Promise<T>,
  context: {
    sessionId?: string
    productId?: string
    details?: Record<string, unknown>
  }
): Promise<{ success: boolean; result?: T; error?: string }> {
  try {
    const result = await retryWithBackoff(operation, 2, 500)
    
    return { success: true, result }
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    
    // Log the error
    await logError({
      type: 'stock_reservation',
      message: `${operationType} failed: ${errorMessage}`,
      details: { error: errorMessage, ...context.details },
      sessionId: context.sessionId,
      productId: context.productId,
      timestamp: new Date().toISOString(),
      severity: 'high'
    })
    
    return { success: false, error: errorMessage }
  }
}

/**
 * Validate stock operation parameters
 */
export function validateStockOperationParams(operations: Array<{
  productId: string
  quantity: number
  size?: string
}>): { isValid: boolean; errors: string[] } {
  const errors: string[] = []
  
  if (!Array.isArray(operations) || operations.length === 0) {
    errors.push('Operations array is required and cannot be empty')
    return { isValid: false, errors }
  }
  
  for (const [index, operation] of operations.entries()) {
    if (!operation.productId) {
      errors.push(`Operation ${index}: productId is required`)
    }
    
    if (typeof operation.quantity !== 'number' || operation.quantity <= 0) {
      errors.push(`Operation ${index}: quantity must be a positive number`)
    }
    
    if (operation.size && typeof operation.size !== 'string') {
      errors.push(`Operation ${index}: size must be a string if provided`)
    }
  }
  
  return { isValid: errors.length === 0, errors }
}

/**
 * Clean up expired idempotency records
 */
export async function cleanupExpiredIdempotencyRecords(): Promise<void> {
  try {
    const now = new Date().toISOString()
    const expiredRecords = await sanityClient.fetch(
      `*[_type == "idempotencyRecord" && expiresAt < $now]._id`,
      { now }
    )
    
    if (expiredRecords.length > 0) {
      const transaction = sanityClient.transaction()
      expiredRecords.forEach((id: string) => {
        transaction.delete(id)
      })
      await transaction.commit()
    }
  } catch (error) {
    console.error('Failed to cleanup expired idempotency records:', error)
  }
}

/**
 * Health check for inventory system
 */
export async function inventoryHealthCheck(): Promise<{
  healthy: boolean
  issues: string[]
  metrics: {
    totalReservations: number
    expiredReservations: number
    recentErrors: number
  }
}> {
  const issues: string[] = []
  
  try {
    // Check for expired reservations
    const now = new Date().toISOString()
    const expiredReservations = await sanityClient.fetch(
      `count(*[_type == "stockReservation" && expiresAt < $now])`,
      { now }
    )
    
    // Check total active reservations
    const totalReservations = await sanityClient.fetch(
      `count(*[_type == "stockReservation" && expiresAt >= $now])`,
      { now }
    )
    
    // Check recent errors (last hour)
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString()
    const recentErrors = await sanityClient.fetch(
      `count(*[_type == "errorLog" && timestamp > $oneHourAgo])`,
      { oneHourAgo }
    )
    
    // Add warnings for concerning metrics
    if (expiredReservations > 50) {
      issues.push(`High number of expired reservations: ${expiredReservations}`)
    }
    
    if (recentErrors > 20) {
      issues.push(`High error rate in last hour: ${recentErrors}`)
    }
    
    if (totalReservations > 1000) {
      issues.push(`Very high number of active reservations: ${totalReservations}`)
    }
    
    return {
      healthy: issues.length === 0,
      issues,
      metrics: {
        totalReservations,
        expiredReservations,
        recentErrors
      }
    }
    
  } catch (error) {
    return {
      healthy: false,
      issues: [`Health check failed: ${error instanceof Error ? error.message : 'Unknown error'}`],
      metrics: {
        totalReservations: 0,
        expiredReservations: 0,
        recentErrors: 0
      }
    }
  }
}