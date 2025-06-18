// import { Suspense } from 'react'

export const dynamic = 'force-dynamic'

async function fetchSystemStatus() {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
    
    const [autonomousStatus, healthCheck, inventoryMonitor] = await Promise.all([
      fetch(`${baseUrl}/api/autonomous-inventory`).then(r => r.json()),
      fetch(`${baseUrl}/api/inventory-health`).then(r => r.json()),
      fetch(`${baseUrl}/api/inventory-monitor`).then(r => r.json()).catch(() => ({ healthy: false, error: 'Monitor unavailable' }))
    ])

    return { autonomousStatus, healthCheck, inventoryMonitor }
  } catch (error) {
    return { 
      error: 'Failed to fetch system status',
      details: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

export default async function AutonomousStatusPage() {
  const systemData = await fetchSystemStatus()

  if ('error' in systemData) {
    return (
      <div className="p-8 max-w-6xl">
        <h1 className="text-3xl mb-6 text-red-600">System Status - Error</h1>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{systemData.error}</p>
          {systemData.details && (
            <pre className="mt-2 text-sm text-red-600">{systemData.details}</pre>
          )}
        </div>
      </div>
    )
  }

  const { autonomousStatus, healthCheck, inventoryMonitor } = systemData
  const overallHealthy = healthCheck.healthy && (inventoryMonitor.healthy !== false)

  return (
    <div className="p-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl mb-2">🤖 Autonomous Inventory System</h1>
        <p className="text-gray-600">Enterprise-level self-healing inventory management</p>
      </div>

      {/* Overall Status */}
      <div className={`mb-8 p-6 rounded-lg border-2 ${
        overallHealthy 
          ? 'bg-green-50 border-green-200' 
          : 'bg-red-50 border-red-200'
      }`}>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold mb-2">
              {overallHealthy ? '✅ System Operational' : '⚠️ Issues Detected'}
            </h2>
            <p className={overallHealthy ? 'text-green-700' : 'text-red-700'}>
              {overallHealthy 
                ? 'All systems running autonomously without intervention'
                : 'System is self-healing detected issues automatically'
              }
            </p>
          </div>
          <div className="text-right text-sm text-gray-500">
            Last checked: {new Date().toLocaleString()}
          </div>
        </div>
      </div>

      {/* Automation Schedule */}
      <div className="mb-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-xl font-semibold mb-4">🕐 Automated Processes</h3>
        <div className="grid md:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded border">
            <h4 className="font-medium text-blue-800">Inventory Cleanup</h4>
            <p className="text-sm text-gray-600 mt-1">Every 15 minutes</p>
            <p className="text-xs text-gray-500 mt-2">
              Removes expired reservations, frees stuck inventory
            </p>
          </div>
          <div className="bg-white p-4 rounded border">
            <h4 className="font-medium text-blue-800">Health Monitoring</h4>
            <p className="text-sm text-gray-600 mt-1">Every 5 minutes</p>
            <p className="text-xs text-gray-500 mt-2">
              Detects issues, logs alerts, monitors overselling
            </p>
          </div>
          <div className="bg-white p-4 rounded border">
            <h4 className="font-medium text-blue-800">Auto-Remediation</h4>
            <p className="text-sm text-gray-600 mt-1">Every hour</p>
            <p className="text-xs text-gray-500 mt-2">
              Fixes common issues, resets negative stock
            </p>
          </div>
        </div>
      </div>

      {/* Current Health Status */}
      <div className="mb-8">
        <h3 className="text-xl font-semibold mb-4">🏥 Current Health Status</h3>
        <div className="grid md:grid-cols-2 gap-6">
          
          {/* Health Check Results */}
          <div className="bg-white border rounded-lg p-4">
            <h4 className="font-medium mb-3 flex items-center">
              {healthCheck.healthy ? '✅' : '❌'} 
              <span className="ml-2">System Health</span>
            </h4>
            
            {healthCheck.healthy ? (
              <p className="text-green-600 text-sm">All systems operating normally</p>
            ) : (
              <div>
                <p className="text-red-600 text-sm mb-2">Issues detected:</p>
                <ul className="text-xs text-gray-600 space-y-1">
                  {healthCheck.issues?.map((issue: string, i: number) => (
                    <li key={i} className="flex items-start">
                      <span className="text-red-500 mr-2">•</span>
                      {issue}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            {healthCheck.recommendations && (
              <div className="mt-3 pt-3 border-t">
                <p className="text-xs font-medium text-gray-700">System Actions:</p>
                <ul className="text-xs text-gray-600 mt-1 space-y-1">
                  {healthCheck.recommendations.map((rec: string, i: number) => (
                    <li key={i}>{rec}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Monitoring Results */}
          <div className="bg-white border rounded-lg p-4">
            <h4 className="font-medium mb-3 flex items-center">
              {inventoryMonitor.healthy !== false ? '✅' : '❌'}
              <span className="ml-2">Inventory Monitor</span>
            </h4>
            
            {inventoryMonitor.healthy !== false ? (
              <p className="text-green-600 text-sm">No critical inventory issues detected</p>
            ) : (
              <div>
                <p className="text-red-600 text-sm mb-2">Monitoring issues:</p>
                {inventoryMonitor.error && (
                  <p className="text-xs text-red-600">{inventoryMonitor.error}</p>
                )}
              </div>
            )}

            {inventoryMonitor.monitoring?.overselling && (
              <div className="mt-3 pt-3 border-t">
                <div className="flex justify-between text-xs">
                  <span>Overselling Issues:</span>
                  <span className={
                    inventoryMonitor.monitoring.overselling.criticalIssues > 0 
                      ? 'text-red-600 font-medium' 
                      : 'text-green-600'
                  }>
                    {inventoryMonitor.monitoring.overselling.criticalIssues} critical
                  </span>
                </div>
                <div className="flex justify-between text-xs mt-1">
                  <span>Race Conditions:</span>
                  <span className={
                    inventoryMonitor.monitoring.raceConditions?.highSeverityPatterns > 0 
                      ? 'text-orange-600 font-medium' 
                      : 'text-green-600'
                  }>
                    {inventoryMonitor.monitoring.raceConditions?.highSeverityPatterns || 0} high severity
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Autonomous Triggers */}
      <div className="mb-8">
        <h3 className="text-xl font-semibold mb-4">🤖 Autonomous Response System</h3>
        <div className="bg-gray-50 border rounded-lg p-4">
          <p className="text-sm text-gray-700 mb-4">
            The system automatically responds to these events without manual intervention:
          </p>
          
          <div className="grid md:grid-cols-2 gap-4">
            {Object.entries(autonomousStatus.triggers || {}).map(([trigger, description]) => (
              <div key={trigger} className="bg-white p-3 rounded border">
                <code className="text-xs bg-gray-100 px-2 py-1 rounded">{trigger}</code>
                <p className="text-xs text-gray-600 mt-2">{description as string}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Zero Manual Intervention Notice */}
      <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-2 text-green-800">
          🎯 Zero Manual Intervention Required
        </h3>
        <p className="text-sm text-green-700 mb-3">
          This system is fully autonomous. Non-technical users can:
        </p>
        <ul className="text-sm text-green-700 space-y-1">
          <li>• Update product stock in Sanity Studio - automatically syncs to frontend</li>
          <li>• Process payments via Stripe - stock deducts automatically</li>
          <li>• Handle shipping - no inventory concerns</li>
          <li>• Monitor via this dashboard - all issues self-heal</li>
        </ul>
        <p className="text-xs text-green-600 mt-4 font-medium">
          ✅ Enterprise-grade inventory management with complete automation
        </p>
      </div>

      {/* Technical Details */}
      <details className="mt-8">
        <summary className="text-lg cursor-pointer font-medium mb-4">
          Technical Implementation Details
        </summary>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium mb-2">Automated Processes</h4>
            <pre className="bg-gray-100 p-3 rounded text-xs overflow-auto">
              {JSON.stringify(autonomousStatus.automation, null, 2)}
            </pre>
          </div>
          <div>
            <h4 className="font-medium mb-2">Health Check Data</h4>
            <pre className="bg-gray-100 p-3 rounded text-xs overflow-auto">
              {JSON.stringify(healthCheck, null, 2)}
            </pre>
          </div>
        </div>
      </details>
    </div>
  )
}

/*
function LoadingStatus() {
  return (
    <div className="p-8 max-w-6xl">
      <h1 className="text-3xl mb-6">🤖 Autonomous Inventory System</h1>
      <div className="animate-pulse">
        <div className="h-32 bg-gray-200 rounded-lg mb-8"></div>
        <div className="grid md:grid-cols-3 gap-4">
          <div className="h-24 bg-gray-200 rounded"></div>
          <div className="h-24 bg-gray-200 rounded"></div>
          <div className="h-24 bg-gray-200 rounded"></div>
        </div>
      </div>
    </div>
  )
}
*/