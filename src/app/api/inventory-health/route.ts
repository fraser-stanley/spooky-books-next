import { NextResponse } from 'next/server'
import { inventoryHealthCheck, cleanupExpiredIdempotencyRecords } from '@/lib/utils/error-handling'
import { cleanupExpiredReservations } from '@/lib/sanity/stock-operations'
import { checkForOverselling, detectRaceConditionPatterns } from '@/lib/utils/inventory-monitoring'

export async function GET() {
  try {
    // Run comprehensive health checks
    const [healthCheck, oversellingIssues, raceConditionPatterns] = await Promise.all([
      inventoryHealthCheck(),
      checkForOverselling(),
      detectRaceConditionPatterns()
    ])
    
    // Include additional system info
    const systemInfo = {
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      nodeVersion: process.version,
      environment: process.env.NODE_ENV
    }

    // Enhanced health assessment
    const enhancedHealthy = healthCheck.healthy && 
                           oversellingIssues.issues.filter(i => i.severity === 'critical').length === 0 &&
                           raceConditionPatterns.patterns.filter(p => p.severity === 'high').length === 0
    
    return NextResponse.json({
      ...healthCheck,
      healthy: enhancedHealthy,
      monitoring: {
        overselling: {
          totalIssues: oversellingIssues.totalIssues,
          criticalIssues: oversellingIssues.issues.filter(i => i.severity === 'critical').length,
          issues: oversellingIssues.issues
        },
        raceConditions: {
          totalPatterns: raceConditionPatterns.totalPatterns,
          highSeverityPatterns: raceConditionPatterns.patterns.filter(p => p.severity === 'high').length,
          patterns: raceConditionPatterns.patterns
        }
      },
      system: systemInfo,
      recommendations: enhancedHealthy ? 
        ['✅ Inventory system is healthy'] :
        [
          ...(oversellingIssues.issues.length > 0 ? ['Check overselling issues'] : []),
          ...(raceConditionPatterns.patterns.length > 0 ? ['Monitor race condition patterns'] : []),
          ...healthCheck.issues
        ]
    })
    
  } catch (error) {
    console.error('Health check failed:', error)
    return NextResponse.json(
      { 
        healthy: false,
        error: 'Health check endpoint failed',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}

export async function POST() {
  try {
    // Manual cleanup trigger
    console.log('Starting manual inventory cleanup...')
    
    // Clean up expired reservations
    await cleanupExpiredReservations()
    
    // Clean up expired idempotency records
    await cleanupExpiredIdempotencyRecords()
    
    // Run health check after cleanup
    const healthCheck = await inventoryHealthCheck()
    
    return NextResponse.json({
      message: 'Cleanup completed successfully',
      healthCheck,
      timestamp: new Date().toISOString()
    })
    
  } catch (error) {
    console.error('Manual cleanup failed:', error)
    return NextResponse.json(
      { 
        error: 'Cleanup failed',
        message: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}