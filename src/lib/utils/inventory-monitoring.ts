import { sanityClient } from "@/lib/sanity/client";
import { logError } from "./error-handling";

/**
 * Monitor for potential overselling scenarios
 */
export async function checkForOverselling(): Promise<{
  issues: Array<{
    productId: string;
    title: string;
    type: "negative_stock" | "reserved_exceeds_stock" | "inconsistent_data";
    details: string;
    severity: "low" | "medium" | "high" | "critical";
  }>;
  totalIssues: number;
}> {
  const issues: Array<{
    productId: string;
    title: string;
    type: "negative_stock" | "reserved_exceeds_stock" | "inconsistent_data";
    details: string;
    severity: "low" | "medium" | "high" | "critical";
  }> = [];

  try {
    // Get all products with stock and reservation data
    const products = await sanityClient.fetch(`
      *[_type == "product"] {
        _id,
        "productId": slug.current,
        title,
        stockQuantity,
        reservedQuantity,
        variants[]{
          size,
          stockQuantity,
          reservedQuantity
        }
      }
    `);

    for (const product of products) {
      // Check main product stock issues
      if (product.stockQuantity < 0) {
        issues.push({
          productId: product.productId,
          title: product.title,
          type: "negative_stock",
          details: `Main stock is negative: ${product.stockQuantity}`,
          severity: "critical",
        });
      }

      if ((product.reservedQuantity || 0) > product.stockQuantity) {
        issues.push({
          productId: product.productId,
          title: product.title,
          type: "reserved_exceeds_stock",
          details: `Reserved (${product.reservedQuantity}) exceeds stock (${product.stockQuantity})`,
          severity: "high",
        });
      }

      // Check variant stock issues
      if (product.variants && Array.isArray(product.variants)) {
        for (const variant of product.variants) {
          if (variant.stockQuantity < 0) {
            issues.push({
              productId: product.productId,
              title: product.title,
              type: "negative_stock",
              details: `Variant ${variant.size} stock is negative: ${variant.stockQuantity}`,
              severity: "critical",
            });
          }

          if ((variant.reservedQuantity || 0) > variant.stockQuantity) {
            issues.push({
              productId: product.productId,
              title: product.title,
              type: "reserved_exceeds_stock",
              details: `Variant ${variant.size} reserved (${variant.reservedQuantity}) exceeds stock (${variant.stockQuantity})`,
              severity: "high",
            });
          }
        }
      }
    }

    // Log critical issues
    for (const issue of issues.filter((i) => i.severity === "critical")) {
      await logError({
        type: "stock_validation",
        message: `Critical inventory issue detected: ${issue.details}`,
        details: {
          productId: issue.productId,
          issueType: issue.type,
          productTitle: issue.title,
        },
        productId: issue.productId,
        timestamp: new Date().toISOString(),
        severity: "critical",
      });
    }

    return {
      issues,
      totalIssues: issues.length,
    };
  } catch (error) {
    console.error("Error checking for overselling:", error);
    await logError({
      type: "stock_validation",
      message: "Failed to check for overselling issues",
      details: {
        error: error instanceof Error ? error.message : "Unknown error",
      },
      timestamp: new Date().toISOString(),
      severity: "high",
    });

    return { issues: [], totalIssues: 0 };
  }
}

/**
 * Monitor for suspicious reservation patterns that might indicate race conditions
 */
export async function detectRaceConditionPatterns(): Promise<{
  patterns: Array<{
    type:
      | "high_reservation_rate"
      | "reservation_spikes"
      | "failed_reservations";
    details: string;
    timestamp: string;
    severity: "low" | "medium" | "high";
  }>;
  totalPatterns: number;
}> {
  const patterns: Array<{
    type:
      | "high_reservation_rate"
      | "reservation_spikes"
      | "failed_reservations";
    details: string;
    timestamp: string;
    severity: "low" | "medium" | "high";
  }> = [];

  try {
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000).toISOString();

    // Check for high error rates in the last hour
    const recentErrors = await sanityClient.fetch(
      `
      count(*[_type == "errorLog" && type == "stock_reservation" && timestamp > $oneHourAgo])
    `,
      { oneHourAgo },
    );

    if (recentErrors > 5) {
      patterns.push({
        type: "failed_reservations",
        details: `High reservation failure rate: ${recentErrors} failures in last hour`,
        timestamp: now.toISOString(),
        severity: recentErrors > 20 ? "high" : "medium",
      });
    }

    // Check for products with unusually high reserved quantities
    const highReservationProducts = await sanityClient.fetch(`
      *[_type == "product" && reservedQuantity > (stockQuantity * 0.8)] {
        "productId": slug.current,
        title,
        stockQuantity,
        reservedQuantity
      }
    `);

    for (const product of highReservationProducts) {
      patterns.push({
        type: "high_reservation_rate",
        details: `Product "${product.title}" has ${product.reservedQuantity} reserved out of ${product.stockQuantity} total (${Math.round((product.reservedQuantity / product.stockQuantity) * 100)}%)`,
        timestamp: now.toISOString(),
        severity: "medium",
      });
    }

    return {
      patterns,
      totalPatterns: patterns.length,
    };
  } catch (error) {
    console.error("Error detecting race condition patterns:", error);
    return { patterns: [], totalPatterns: 0 };
  }
}

/**
 * Generate comprehensive inventory health report
 */
export async function generateInventoryReport(): Promise<{
  timestamp: string;
  oversellingIssues: Awaited<ReturnType<typeof checkForOverselling>>;
  raceConditionPatterns: Awaited<
    ReturnType<typeof detectRaceConditionPatterns>
  >;
  summary: {
    totalProducts: number;
    productsWithIssues: number;
    criticalIssues: number;
    recommendedActions: string[];
  };
}> {
  const timestamp = new Date().toISOString();

  const [oversellingIssues, raceConditionPatterns] = await Promise.all([
    checkForOverselling(),
    detectRaceConditionPatterns(),
  ]);

  // Get total product count
  const totalProducts = await sanityClient.fetch(
    `count(*[_type == "product"])`,
  );

  const criticalIssues = oversellingIssues.issues.filter(
    (i) => i.severity === "critical",
  ).length;
  const productsWithIssues = new Set([
    ...oversellingIssues.issues.map((i) => i.productId),
  ]).size;

  const recommendedActions: string[] = [];

  if (criticalIssues > 0) {
    recommendedActions.push(
      `Immediately review ${criticalIssues} critical stock issues`,
    );
  }

  if (raceConditionPatterns.totalPatterns > 3) {
    recommendedActions.push(
      "Monitor for potential race conditions during high traffic",
    );
  }

  if (
    oversellingIssues.issues.some((i) => i.type === "reserved_exceeds_stock")
  ) {
    recommendedActions.push("Check for stuck reservations that need cleanup");
  }

  if (recommendedActions.length === 0) {
    recommendedActions.push(
      "✅ No immediate action required - inventory system healthy",
    );
  }

  return {
    timestamp,
    oversellingIssues,
    raceConditionPatterns,
    summary: {
      totalProducts,
      productsWithIssues,
      criticalIssues,
      recommendedActions,
    },
  };
}
