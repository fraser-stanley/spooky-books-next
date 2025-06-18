import { NextRequest, NextResponse } from 'next/server'
import { cleanupExpiredReservations } from '@/lib/sanity/stock-operations'
import { cleanupExpiredIdempotencyRecords } from '@/lib/utils/error-handling'

/**
 * Automated inventory cleanup cron job
 * Runs every 15 minutes via Vercel cron
 * Cleans up expired stock reservations and stale data
 */
export async function GET(request: NextRequest) {
  // Verify this is coming from Vercel cron
  if (request.headers.get('user-agent') !== 'vercel-cron/1.0') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const startTime = Date.now()
  console.log('🧹 Starting automated inventory cleanup...')
  
  try {
    const cleanupResults = {
      expiredReservations: { success: false, details: '' },
      idempotencyRecords: { success: false, details: '' },
      timestamp: new Date().toISOString()
    }

    // 1. Clean up expired stock reservations
    try {
      await cleanupExpiredReservations()
      cleanupResults.expiredReservations = {
        success: true,
        details: 'Expired reservations cleaned successfully'
      }
      console.log('✅ Expired stock reservations cleaned')
    } catch (error) {
      cleanupResults.expiredReservations = {
        success: false,
        details: error instanceof Error ? error.message : 'Unknown error'
      }
      console.error('❌ Failed to clean expired reservations:', error)
    }

    // 2. Clean up expired idempotency records
    try {
      await cleanupExpiredIdempotencyRecords()
      cleanupResults.idempotencyRecords = {
        success: true,
        details: 'Idempotency records cleaned successfully'
      }
      console.log('✅ Idempotency records cleaned')
    } catch (error) {
      cleanupResults.idempotencyRecords = {
        success: false,
        details: error instanceof Error ? error.message : 'Unknown error'
      }
      console.error('❌ Failed to clean idempotency records:', error)
    }

    const duration = Date.now() - startTime
    const overallSuccess = cleanupResults.expiredReservations.success && 
                          cleanupResults.idempotencyRecords.success

    console.log(`${overallSuccess ? '✅' : '❌'} Automated cleanup completed in ${duration}ms`)

    return NextResponse.json({
      success: overallSuccess,
      message: 'Automated inventory cleanup completed',
      duration: `${duration}ms`,
      results: cleanupResults
    })

  } catch (error) {
    const duration = Date.now() - startTime
    console.error('💥 Automated cleanup failed:', error)
    
    return NextResponse.json({
      success: false,
      message: 'Automated inventory cleanup failed',
      duration: `${duration}ms`,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}

// Handle other HTTP methods for security
export async function POST() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 })
}