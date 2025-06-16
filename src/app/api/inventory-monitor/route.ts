import { NextResponse } from 'next/server'
import { generateInventoryReport, checkForOverselling, detectRaceConditionPatterns } from '@/lib/utils/inventory-monitoring'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const check = searchParams.get('check')

    switch (check) {
      case 'overselling':
        const oversellingIssues = await checkForOverselling()
        return NextResponse.json({
          success: true,
          type: 'overselling_check',
          data: oversellingIssues,
          timestamp: new Date().toISOString()
        })

      case 'race-conditions':
        const raceConditionPatterns = await detectRaceConditionPatterns()
        return NextResponse.json({
          success: true,
          type: 'race_condition_check',
          data: raceConditionPatterns,
          timestamp: new Date().toISOString()
        })

      case 'full-report':
      default:
        const fullReport = await generateInventoryReport()
        return NextResponse.json({
          success: true,
          type: 'full_inventory_report',
          data: fullReport
        })
    }

  } catch (error) {
    console.error('Inventory monitoring error:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to generate inventory report',
      details: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}

export async function POST() {
  try {
    // Manual trigger for comprehensive monitoring check
    console.log('🔍 Running manual inventory monitoring check...')
    
    const report = await generateInventoryReport()
    
    // Log summary to console for immediate visibility
    console.log(`📊 Inventory Report Summary:`)
    console.log(`- Total Products: ${report.summary.totalProducts}`)
    console.log(`- Products with Issues: ${report.summary.productsWithIssues}`)
    console.log(`- Critical Issues: ${report.summary.criticalIssues}`)
    console.log(`- Recommended Actions: ${report.summary.recommendedActions.join('; ')}`)
    
    if (report.summary.criticalIssues > 0) {
      console.log('🚨 CRITICAL ISSUES DETECTED!')
      report.oversellingIssues.issues
        .filter(i => i.severity === 'critical')
        .forEach(issue => {
          console.log(`❌ ${issue.productId}: ${issue.details}`)
        })
    }

    return NextResponse.json({
      success: true,
      message: 'Manual inventory monitoring check completed',
      report,
      actions: {
        criticalIssuesFound: report.summary.criticalIssues > 0,
        nextCheckRecommended: new Date(Date.now() + 60 * 60 * 1000).toISOString(), // 1 hour
        monitoringEndpoints: {
          oversellingCheck: '/api/inventory-monitor?check=overselling',
          raceConditionCheck: '/api/inventory-monitor?check=race-conditions',
          fullReport: '/api/inventory-monitor?check=full-report'
        }
      }
    })

  } catch (error) {
    console.error('Manual inventory monitoring failed:', error)
    return NextResponse.json({
      success: false,
      error: 'Manual inventory monitoring failed',
      details: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}