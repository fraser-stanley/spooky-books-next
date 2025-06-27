import { NextResponse } from "next/server";
import { createClient } from "@sanity/client";
import { v4 as uuidv4 } from "uuid";

const sanityClient = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "0gbx06x6",
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || "production",
  apiVersion: "2023-05-03",
  token: process.env.SANITY_API_TOKEN,
  useCdn: false,
});

/**
 * Comprehensive backfill for inventory management system
 * Fixes all issues needed for existing products to work with the autonomous inventory system
 */
export async function POST() {
  const results = {
    variantKeys: { processed: 0, fixed: 0, errors: [] as string[] },
    reservedQuantities: { processed: 0, fixed: 0, errors: [] as string[] },
    stockQuantities: { processed: 0, fixed: 0, errors: [] as string[] },
    hasSizes: { processed: 0, fixed: 0, errors: [] as string[] },
  };

  try {
    console.log("🔧 Starting comprehensive inventory backfill...");

    // Step 1: Fix missing _key properties in variant arrays
    console.log("\n📝 Step 1: Fixing missing variant _key properties...");
    await fixVariantKeys(results.variantKeys);

    // Step 2: Initialize missing reservedQuantity fields
    console.log("\n📦 Step 2: Initializing missing reservedQuantity fields...");
    await initializeReservedQuantities(results.reservedQuantities);

    // Step 3: Ensure all products have stockQuantity
    console.log("\n📊 Step 3: Ensuring all products have stockQuantity...");
    await ensureStockQuantities(results.stockQuantities);

    // Step 4: Update hasSizes computed field for better frontend logic
    console.log("\n🏷️ Step 4: Updating hasSizes computed field...");
    await updateHasSizes(results.hasSizes);

    const totalFixed =
      results.variantKeys.fixed +
      results.reservedQuantities.fixed +
      results.stockQuantities.fixed +
      results.hasSizes.fixed;

    console.log(
      `\n✅ Backfill completed successfully! Fixed ${totalFixed} issues across all products`,
    );

    return NextResponse.json({
      success: true,
      message: "Inventory backfill completed successfully",
      summary: {
        totalIssuesFixed: totalFixed,
        variantKeysFixed: results.variantKeys.fixed,
        reservedQuantitiesInitialized: results.reservedQuantities.fixed,
        stockQuantitiesEnsured: results.stockQuantities.fixed,
        hasSizesUpdated: results.hasSizes.fixed,
      },
      details: results,
      nextSteps: [
        "Products should now be editable in Sanity Studio",
        "Inventory system will work properly with autonomous cleanup",
        "All products have required fields for stock management",
        "Variant arrays have proper _key properties for Sanity editing",
      ],
    });
  } catch (error) {
    console.error("💥 Backfill failed:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Inventory backfill failed",
        message: error instanceof Error ? error.message : "Unknown error",
        partialResults: results,
      },
      { status: 500 },
    );
  }
}

async function fixVariantKeys(results: {
  processed: number;
  fixed: number;
  errors: string[];
}) {
  try {
    // Get all products with variants
    const products = await sanityClient.fetch(`
      *[_type == "product" && defined(variants)] {
        _id,
        title,
        variants[]
      }
    `);

    results.processed = products.length;
    console.log(`   Found ${products.length} products with variants to check`);

    for (const product of products) {
      if (!product.variants || product.variants.length === 0) continue;

      let needsUpdate = false;
      const updatedVariants = product.variants.map(
        (variant: Record<string, unknown>) => {
          if (!variant._key) {
            needsUpdate = true;
            console.log(
              `   Adding missing _key to ${product.title} variant ${variant.size}`,
            );
            return {
              ...variant,
              _key: uuidv4(),
            };
          }
          return variant;
        },
      );

      if (needsUpdate) {
        await sanityClient
          .patch(product._id)
          .set({ variants: updatedVariants })
          .commit();

        results.fixed++;
        console.log(`   ✅ Fixed missing keys for product: ${product.title}`);
      }
    }

    console.log(
      `   ✅ Fixed ${results.fixed} products with missing variant keys`,
    );
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : "Unknown error";
    results.errors.push(`Variant keys fix failed: ${errorMsg}`);
    console.error("   ❌ Failed to fix variant keys:", error);
  }
}

async function initializeReservedQuantities(results: {
  processed: number;
  fixed: number;
  errors: string[];
}) {
  try {
    // Get all products to check for missing reservedQuantity fields
    const products = await sanityClient.fetch(`
      *[_type == "product"] {
        _id,
        title,
        reservedQuantity,
        variants[]{
          size,
          reservedQuantity,
          stockQuantity
        }
      }
    `);

    results.processed = products.length;
    console.log(
      `   Found ${products.length} products to check for reservedQuantity fields`,
    );

    for (const product of products) {
      const transaction = sanityClient.transaction();
      let needsUpdate = false;

      // Check main product reservedQuantity
      if (
        product.reservedQuantity === undefined ||
        product.reservedQuantity === null
      ) {
        transaction.patch(product._id, {
          setIfMissing: { reservedQuantity: 0 },
        });
        needsUpdate = true;
        console.log(`   Adding reservedQuantity to ${product.title}`);
      }

      // Check variant reservedQuantity
      if (product.variants && product.variants.length > 0) {
        product.variants.forEach(
          (
            variant: {
              size: string;
              reservedQuantity?: number;
              stockQuantity?: number;
            },
            index: number,
          ) => {
            if (
              variant.reservedQuantity === undefined ||
              variant.reservedQuantity === null
            ) {
              transaction.patch(product._id, {
                setIfMissing: { [`variants[${index}].reservedQuantity`]: 0 },
              });
              needsUpdate = true;
              console.log(
                `   Adding reservedQuantity to ${product.title} size ${variant.size}`,
              );
            }
          },
        );
      }

      if (needsUpdate) {
        await transaction.commit();
        results.fixed++;
        console.log(`   ✅ Initialized reservedQuantity for: ${product.title}`);
      }
    }

    console.log(
      `   ✅ Initialized reservedQuantity for ${results.fixed} products`,
    );
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : "Unknown error";
    results.errors.push(
      `Reserved quantities initialization failed: ${errorMsg}`,
    );
    console.error("   ❌ Failed to initialize reserved quantities:", error);
  }
}

async function ensureStockQuantities(results: {
  processed: number;
  fixed: number;
  errors: string[];
}) {
  try {
    // Get all products to check for missing stockQuantity fields
    const products = await sanityClient.fetch(`
      *[_type == "product"] {
        _id,
        title,
        stockQuantity,
        variants[]{
          size,
          stockQuantity
        }
      }
    `);

    results.processed = products.length;
    console.log(
      `   Found ${products.length} products to check for stockQuantity fields`,
    );

    for (const product of products) {
      const transaction = sanityClient.transaction();
      let needsUpdate = false;

      // Check main product stockQuantity (for publications and non-sized apparel)
      if (
        product.stockQuantity === undefined ||
        product.stockQuantity === null
      ) {
        transaction.patch(product._id, {
          setIfMissing: { stockQuantity: 0 },
        });
        needsUpdate = true;
        console.log(`   Adding stockQuantity to ${product.title}`);
      }

      // Check variant stockQuantity (for sized apparel)
      if (product.variants && product.variants.length > 0) {
        product.variants.forEach(
          (
            variant: { size: string; stockQuantity?: number },
            index: number,
          ) => {
            if (
              variant.stockQuantity === undefined ||
              variant.stockQuantity === null
            ) {
              transaction.patch(product._id, {
                setIfMissing: { [`variants[${index}].stockQuantity`]: 0 },
              });
              needsUpdate = true;
              console.log(
                `   Adding stockQuantity to ${product.title} size ${variant.size}`,
              );
            }
          },
        );
      }

      if (needsUpdate) {
        await transaction.commit();
        results.fixed++;
        console.log(`   ✅ Ensured stockQuantity for: ${product.title}`);
      }
    }

    console.log(`   ✅ Ensured stockQuantity for ${results.fixed} products`);
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : "Unknown error";
    results.errors.push(`Stock quantities check failed: ${errorMsg}`);
    console.error("   ❌ Failed to ensure stock quantities:", error);
  }
}

async function updateHasSizes(results: {
  processed: number;
  fixed: number;
  errors: string[];
}) {
  try {
    // Get all products to update hasSizes field for better frontend logic
    const products = await sanityClient.fetch(`
      *[_type == "product"] {
        _id,
        title,
        category->{title},
        variants[]{
          size
        },
        hasSizes
      }
    `);

    results.processed = products.length;
    console.log(
      `   Found ${products.length} products to check for hasSizes field`,
    );

    for (const product of products) {
      const isApparel = product.category?.title?.toLowerCase() === "apparel";
      const actuallyHasSizes =
        isApparel && product.variants && product.variants.length > 0;

      // Only update if the computed value differs from stored value
      if (product.hasSizes !== actuallyHasSizes) {
        await sanityClient
          .patch(product._id)
          .set({ hasSizes: actuallyHasSizes })
          .commit();

        results.fixed++;
        console.log(
          `   ✅ Updated hasSizes for ${product.title}: ${actuallyHasSizes}`,
        );
      }
    }

    console.log(`   ✅ Updated hasSizes for ${results.fixed} products`);
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : "Unknown error";
    results.errors.push(`hasSizes update failed: ${errorMsg}`);
    console.error("   ❌ Failed to update hasSizes:", error);
  }
}

export async function GET() {
  return NextResponse.json({
    message: "Comprehensive Inventory Backfill API",
    description:
      "Fixes all issues needed for existing products to work with the autonomous inventory system",
    fixes: [
      "Missing _key properties in variant arrays (fixes Sanity Studio editing)",
      "Missing reservedQuantity fields (required for inventory system)",
      "Missing stockQuantity fields (ensures all products have stock fields)",
      "Incorrect hasSizes computed field (improves frontend logic)",
    ],
    usage: "POST to run the comprehensive backfill process",
    warning:
      "This operation modifies your Sanity dataset. Backup recommended before running.",
  });
}
