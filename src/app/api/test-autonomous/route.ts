import { NextRequest, NextResponse } from "next/server";

/**
 * Test endpoint for autonomous inventory system
 * Simulates various scenarios to verify automation works
 */
export async function POST(request: NextRequest) {
  try {
    const { scenario } = await request.json();
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

    console.log(`🧪 Testing autonomous system scenario: ${scenario}`);

    switch (scenario) {
      case "stock-update":
        return await testStockUpdate(baseUrl);

      case "payment-completion":
        return await testPaymentCompletion(baseUrl);

      case "checkout-expiration":
        return await testCheckoutExpiration(baseUrl);

      case "health-alert":
        return await testHealthAlert(baseUrl);

      case "emergency-cleanup":
        return await testEmergencyCleanup(baseUrl);

      case "full-system":
        return await testFullSystem(baseUrl);

      default:
        return NextResponse.json(
          {
            error: `Unknown test scenario: ${scenario}`,
            availableScenarios: [
              "stock-update",
              "payment-completion",
              "checkout-expiration",
              "health-alert",
              "emergency-cleanup",
              "full-system",
            ],
          },
          { status: 400 },
        );
    }
  } catch (error) {
    console.error("🚨 Autonomous test failed:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Test execution failed",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

async function testStockUpdate(baseUrl: string) {
  const response = await fetch(`${baseUrl}/api/autonomous-inventory`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      trigger: "stock-updated",
      productId: "test-product",
    }),
  });

  const result = await response.json();

  return NextResponse.json({
    scenario: "stock-update",
    success: response.ok,
    autonomousResponse: result,
    message: response.ok
      ? "✅ Autonomous system responded to stock update"
      : "❌ Autonomous system failed to respond",
  });
}

async function testPaymentCompletion(baseUrl: string) {
  const response = await fetch(`${baseUrl}/api/autonomous-inventory`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      trigger: "payment-completed",
    }),
  });

  const result = await response.json();

  return NextResponse.json({
    scenario: "payment-completion",
    success: response.ok,
    autonomousResponse: result,
    message: response.ok
      ? "✅ Autonomous system responded to payment completion"
      : "❌ Autonomous system failed to respond",
  });
}

async function testCheckoutExpiration(baseUrl: string) {
  const response = await fetch(`${baseUrl}/api/autonomous-inventory`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      trigger: "checkout-expired",
    }),
  });

  const result = await response.json();

  return NextResponse.json({
    scenario: "checkout-expiration",
    success: response.ok,
    autonomousResponse: result,
    message: response.ok
      ? "✅ Autonomous system responded to checkout expiration"
      : "❌ Autonomous system failed to respond",
  });
}

async function testHealthAlert(baseUrl: string) {
  const response = await fetch(`${baseUrl}/api/autonomous-inventory`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      trigger: "health-alert",
      force: true, // Force remediation for testing
    }),
  });

  const result = await response.json();

  return NextResponse.json({
    scenario: "health-alert",
    success: response.ok,
    autonomousResponse: result,
    message: response.ok
      ? "✅ Autonomous system responded to health alert"
      : "❌ Autonomous system failed to respond",
  });
}

async function testEmergencyCleanup(baseUrl: string) {
  const response = await fetch(`${baseUrl}/api/autonomous-inventory`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      trigger: "emergency-cleanup",
    }),
  });

  const result = await response.json();

  return NextResponse.json({
    scenario: "emergency-cleanup",
    success: response.ok,
    autonomousResponse: result,
    message: response.ok
      ? "✅ Autonomous system performed emergency cleanup"
      : "❌ Autonomous system failed emergency cleanup",
  });
}

async function testFullSystem(baseUrl: string) {
  const testResults = [];

  // Test all scenarios in sequence
  const scenarios = [
    "stock-updated",
    "payment-completed",
    "checkout-expired",
    "health-alert",
  ];

  for (const trigger of scenarios) {
    try {
      const response = await fetch(`${baseUrl}/api/autonomous-inventory`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          trigger,
          ...(trigger === "health-alert" && { force: true }),
        }),
      });

      const result = await response.json();

      testResults.push({
        trigger,
        success: response.ok,
        response: result,
      });

      // Small delay between tests
      await new Promise((resolve) => setTimeout(resolve, 500));
    } catch (error) {
      testResults.push({
        trigger,
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  const successCount = testResults.filter((r) => r.success).length;
  const overallSuccess = successCount === scenarios.length;

  return NextResponse.json({
    scenario: "full-system",
    success: overallSuccess,
    summary: {
      totalTests: scenarios.length,
      successful: successCount,
      failed: scenarios.length - successCount,
    },
    results: testResults,
    message: overallSuccess
      ? "✅ All autonomous systems functioning correctly"
      : `❌ ${scenarios.length - successCount} autonomous systems failed`,
  });
}

export async function GET() {
  return NextResponse.json({
    message: "Autonomous Inventory Test Endpoint",
    scenarios: [
      "stock-update - Test stock update response",
      "payment-completion - Test payment completion response",
      "checkout-expiration - Test checkout expiration response",
      "health-alert - Test health alert response",
      "emergency-cleanup - Test emergency cleanup",
      "full-system - Test all scenarios",
    ],
    usage: 'POST with { "scenario": "scenario_name" }',
  });
}
