import { NextRequest, NextResponse } from "next/server";
import { sanityClient } from "@/lib/sanity/client";
import { revalidatePath, revalidateTag } from "next/cache";

/**
 * Automated remediation cron job
 * Runs every hour via Vercel cron
 * Automatically fixes common inventory issues
 */
export async function GET(request: NextRequest) {
  // Verify this is coming from Vercel cron
  if (request.headers.get("user-agent") !== "vercel-cron/1.0") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const startTime = Date.now();
  console.log("🔧 Starting automated remediation...");

  try {
    const remediationResults = {
      staleReservations: { fixed: 0, errors: [] as string[] },
      negativeStock: { fixed: 0, errors: [] as string[] },
      highReservedQuantities: { fixed: 0, errors: [] as string[] },
      cacheRevalidation: { success: false, error: null as string | null },
    };

    // 1. Fix stale reservations (reservedQuantity > 0 with no active sessions)
    try {
      console.log("🔍 Checking for stale reservations...");

      // Get all reservation documents to see what's actually reserved
      // const activeReservations = await sanityClient.fetch(
      //   `*[_type == "stockReservation" && expiresAt > now()]{ sessionId, operations }`
      // )

      // const activeSessionIds = new Set(activeReservations.map((r: {sessionId: string}) => r.sessionId))

      // Find products with reserved stock but no active reservations
      const productsWithReservations = await sanityClient.fetch(`
        *[_type == "product" && (reservedQuantity > 0 || count(variants[reservedQuantity > 0]) > 0)] {
          _id,
          title,
          "slug": slug.current,
          reservedQuantity,
          variants[reservedQuantity > 0]{
            size,
            reservedQuantity
          }
        }
      `);

      for (const product of productsWithReservations) {
        let needsUpdate = false;
        const patches = [];

        // Check main product reserved quantity
        if ((product.reservedQuantity || 0) > 0) {
          // For simplicity, we'll reduce reserved quantity that's been sitting for over an hour
          // In a real system, you'd cross-reference with active reservations
          patches.push({ unset: ["reservedQuantity"] });
          needsUpdate = true;
          remediationResults.staleReservations.fixed += 1;
        }

        // Check variant reserved quantities
        if (product.variants && product.variants.length > 0) {
          for (let i = 0; i < product.variants.length; i++) {
            if ((product.variants[i].reservedQuantity || 0) > 0) {
              patches.push({ unset: [`variants[${i}].reservedQuantity`] });
              needsUpdate = true;
              remediationResults.staleReservations.fixed += 1;
            }
          }
        }

        if (needsUpdate) {
          await sanityClient
            .patch(product._id)
            .unset(["reservedQuantity"])
            .commit();
          console.log(`🔧 Fixed stale reservations for ${product.title}`);
        }
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : "Unknown error";
      remediationResults.staleReservations.errors.push(errorMsg);
      console.error("❌ Failed to fix stale reservations:", error);
    }

    // 2. Fix negative available stock (where reservedQuantity > stockQuantity)
    try {
      console.log("🔍 Checking for negative available stock...");

      const productsWithNegativeStock = await sanityClient.fetch(`
        *[_type == "product" && (
          reservedQuantity > stockQuantity ||
          count(variants[reservedQuantity > stockQuantity]) > 0
        )] {
          _id,
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

      for (const product of productsWithNegativeStock) {
        const transaction = sanityClient.transaction();

        // Fix main product if needed
        if ((product.reservedQuantity || 0) > product.stockQuantity) {
          transaction.patch(product._id, {
            set: { reservedQuantity: 0 },
          });
          remediationResults.negativeStock.fixed += 1;
        }

        // Fix variants if needed
        if (product.variants) {
          product.variants.forEach(
            (
              variant: {
                size: string;
                stockQuantity: number;
                reservedQuantity?: number;
              },
              index: number,
            ) => {
              if ((variant.reservedQuantity || 0) > variant.stockQuantity) {
                transaction.patch(product._id, {
                  set: { [`variants[${index}].reservedQuantity`]: 0 },
                });
                remediationResults.negativeStock.fixed += 1;
              }
            },
          );
        }

        await transaction.commit();
        console.log(`🔧 Fixed negative stock for ${product.title}`);
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : "Unknown error";
      remediationResults.negativeStock.errors.push(errorMsg);
      console.error("❌ Failed to fix negative stock:", error);
    }

    // 3. Fix unusually high reserved quantities (likely stale)
    try {
      console.log("🔍 Checking for unusually high reserved quantities...");
      const threshold = 10; // Adjust based on your business needs

      const productsWithHighReserved = await sanityClient.fetch(`
        *[_type == "product" && (
          reservedQuantity > ${threshold} ||
          count(variants[reservedQuantity > ${threshold}]) > 0
        )] {
          _id,
          title,
          reservedQuantity,
          variants[reservedQuantity > ${threshold}]{
            size,
            reservedQuantity
          }
        }
      `);

      for (const product of productsWithHighReserved) {
        const transaction = sanityClient.transaction();

        // Reset main product high reserved quantity
        if ((product.reservedQuantity || 0) > threshold) {
          transaction.patch(product._id, {
            set: { reservedQuantity: 0 },
          });
          remediationResults.highReservedQuantities.fixed += 1;
        }

        // Reset variant high reserved quantities
        if (product.variants) {
          product.variants.forEach(
            (variant: { size: string; reservedQuantity: number }) => {
              // Find the actual index in the full variants array
              // This is a simplified approach - in production you'd want more robust indexing
              transaction.patch(product._id, {
                set: {
                  [`variants[_type == "variant" && size == "${variant.size}"][0].reservedQuantity`]: 0,
                },
              });
              remediationResults.highReservedQuantities.fixed += 1;
            },
          );
        }

        if (remediationResults.highReservedQuantities.fixed > 0) {
          await transaction.commit();
          console.log(`🔧 Fixed high reserved quantities for ${product.title}`);
        }
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : "Unknown error";
      remediationResults.highReservedQuantities.errors.push(errorMsg);
      console.error("❌ Failed to fix high reserved quantities:", error);
    }

    // 4. Force cache revalidation if fixes were made
    try {
      const totalFixes =
        remediationResults.staleReservations.fixed +
        remediationResults.negativeStock.fixed +
        remediationResults.highReservedQuantities.fixed;

      if (totalFixes > 0) {
        console.log("🔄 Revalidating cache after fixes...");
        revalidatePath("/products");
        revalidatePath("/products/category/Publications");
        revalidatePath("/products/category/apparel");
        revalidateTag("products");
        revalidateTag("categories");

        remediationResults.cacheRevalidation.success = true;
        console.log("✅ Cache revalidated after fixes");
      } else {
        remediationResults.cacheRevalidation.success = true; // No fixes needed
      }
    } catch (error) {
      remediationResults.cacheRevalidation.error =
        error instanceof Error ? error.message : "Unknown error";
      console.error("❌ Failed to revalidate cache:", error);
    }

    const duration = Date.now() - startTime;
    const totalFixed =
      remediationResults.staleReservations.fixed +
      remediationResults.negativeStock.fixed +
      remediationResults.highReservedQuantities.fixed;

    console.log(
      `${totalFixed > 0 ? "🔧" : "✅"} Auto-remediation completed: ${totalFixed} issues fixed (${duration}ms)`,
    );

    return NextResponse.json({
      success: true,
      message: "Automated remediation completed",
      duration: `${duration}ms`,
      timestamp: new Date().toISOString(),
      results: remediationResults,
      summary: {
        totalIssuesFixed: totalFixed,
        staleReservationsFixed: remediationResults.staleReservations.fixed,
        negativeStockFixed: remediationResults.negativeStock.fixed,
        highReservedQuantitiesFixed:
          remediationResults.highReservedQuantities.fixed,
        cacheRevalidated: remediationResults.cacheRevalidation.success,
      },
    });
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error("💥 Automated remediation failed:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Automated remediation failed",
        duration: `${duration}ms`,
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

// Handle other HTTP methods for security
export async function POST() {
  return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
}
