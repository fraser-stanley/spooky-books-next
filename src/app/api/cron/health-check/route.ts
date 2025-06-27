import { NextRequest, NextResponse } from "next/server";
import { inventoryHealthCheck } from "@/lib/utils/error-handling";
import {
  checkForOverselling,
  detectRaceConditionPatterns,
} from "@/lib/utils/inventory-monitoring";

/**
 * Automated health monitoring cron job
 * Runs every 5 minutes via Vercel cron
 * Monitors inventory health and logs critical issues
 */
export async function GET(request: NextRequest) {
  // Verify this is coming from Vercel cron
  if (request.headers.get("user-agent") !== "vercel-cron/1.0") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const startTime = Date.now();
  console.log("🏥 Starting automated health check...");

  try {
    // Run comprehensive health monitoring
    const [healthCheck, oversellingIssues, raceConditionPatterns] =
      await Promise.all([
        inventoryHealthCheck(),
        checkForOverselling(),
        detectRaceConditionPatterns(),
      ]);

    // Analyze results
    const criticalOversellingIssues = oversellingIssues.issues.filter(
      (i) => i.severity === "critical",
    );
    const highSeverityRaceConditions = raceConditionPatterns.patterns.filter(
      (p) => p.severity === "high",
    );

    const overallHealthy =
      healthCheck.healthy &&
      criticalOversellingIssues.length === 0 &&
      highSeverityRaceConditions.length === 0;

    const duration = Date.now() - startTime;

    // Log results with appropriate severity
    if (overallHealthy) {
      console.log(`✅ Health check passed - system healthy (${duration}ms)`);
    } else {
      console.warn(`⚠️ Health check detected issues (${duration}ms):`);

      if (!healthCheck.healthy) {
        console.warn("   - General health issues:", healthCheck.issues);
      }

      if (criticalOversellingIssues.length > 0) {
        console.error(
          `   - ${criticalOversellingIssues.length} critical overselling issues detected`,
        );
        criticalOversellingIssues.forEach((issue) => {
          console.error(`     * ${issue.details}`);
        });
      }

      if (highSeverityRaceConditions.length > 0) {
        console.warn(
          `   - ${highSeverityRaceConditions.length} high-severity race condition patterns`,
        );
        highSeverityRaceConditions.forEach((pattern) => {
          console.warn(`     * ${pattern.details}`);
        });
      }
    }

    return NextResponse.json({
      healthy: overallHealthy,
      timestamp: new Date().toISOString(),
      duration: `${duration}ms`,
      summary: {
        generalHealth: healthCheck.healthy,
        criticalOverselling: criticalOversellingIssues.length,
        highSeverityRaceConditions: highSeverityRaceConditions.length,
      },
      details: {
        healthCheck,
        overselling: {
          totalIssues: oversellingIssues.totalIssues,
          criticalIssues: criticalOversellingIssues.length,
          issues: criticalOversellingIssues, // Only return critical ones to reduce noise
        },
        raceConditions: {
          totalPatterns: raceConditionPatterns.totalPatterns,
          highSeverityPatterns: highSeverityRaceConditions.length,
          patterns: highSeverityRaceConditions, // Only return high severity ones
        },
      },
      recommendations: overallHealthy
        ? ["System is healthy"]
        : [
            ...(criticalOversellingIssues.length > 0
              ? ["⚠️ Critical overselling issues require immediate attention"]
              : []),
            ...(highSeverityRaceConditions.length > 0
              ? ["⚠️ Race condition patterns detected"]
              : []),
            ...(healthCheck.issues || []),
          ],
    });
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error("💥 Automated health check failed:", error);

    return NextResponse.json(
      {
        healthy: false,
        timestamp: new Date().toISOString(),
        duration: `${duration}ms`,
        error: "Health check system failure",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

// Handle other HTTP methods for security
export async function POST() {
  return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
}
