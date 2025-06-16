import { sanityClient } from '@/lib/sanity/client'

export interface IdempotencyRecord {
  key: string
  result: Record<string, unknown>
  createdAt: string
  expiresAt: string
}

/**
 * Store idempotency record in Sanity
 */
export async function storeIdempotencyRecord(
  key: string, 
  result: Record<string, unknown>, 
  ttlMinutes: number = 60
): Promise<void> {
  const expiresAt = new Date(Date.now() + ttlMinutes * 60 * 1000)
  
  try {
    await sanityClient.create({
      _type: 'idempotencyRecord',
      key,
      result,
      createdAt: new Date().toISOString(),
      expiresAt: expiresAt.toISOString()
    })
  } catch (error) {
    console.error('Failed to store idempotency record:', error)
    // Don't fail the operation for idempotency storage issues
  }
}

/**
 * Check if operation has already been processed
 */
export async function checkIdempotencyRecord(key: string): Promise<Record<string, unknown> | null> {
  try {
    const record = await sanityClient.fetch(
      `*[_type == "idempotencyRecord" && key == $key && expiresAt > now()][0]`,
      { key }
    )
    
    return record?.result || null
  } catch (error) {
    console.error('Failed to check idempotency record:', error)
    return null
  }
}

/**
 * Clean up expired idempotency records
 */
export async function cleanupExpiredIdempotencyRecords(): Promise<void> {
  try {
    const expiredRecords = await sanityClient.fetch(
      `*[_type == "idempotencyRecord" && expiresAt < now()]`
    )
    
    for (const record of expiredRecords) {
      await sanityClient.delete(record._id)
    }
    
    console.log(`Cleaned up ${expiredRecords.length} expired idempotency records`)
  } catch (error) {
    console.error('Failed to cleanup expired idempotency records:', error)
  }
}

/**
 * Generate idempotency key for stock operations
 */
export function generateStockOperationKey(
  operation: string, 
  sessionId: string, 
  items: Array<{productId: string, quantity: number, size?: string}>
): string {
  const itemsStr = items
    .map(item => `${item.productId}:${item.quantity}${item.size ? `:${item.size}` : ''}`)
    .sort()
    .join('|')
  
  return `${operation}:${sessionId}:${itemsStr}`
}

/**
 * Generate idempotency key for webhook events
 */
export function generateWebhookKey(eventId: string, eventType: string): string {
  return `webhook:${eventType}:${eventId}`
}