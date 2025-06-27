import { NextRequest, NextResponse } from "next/server";
import { revalidatePath, revalidateTag } from "next/cache";
import { sanityClient } from "@/lib/sanity/client";
import { cleanupExpiredReservations } from "@/lib/sanity/stock-operations";

/**
 * Enhanced inventory synchronization endpoint
 * Handles bidirectional sync between Sanity and frontend
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, productId } = body;

    switch (action) {
      case "cleanup-expired":
        await cleanupExpiredReservations();
        return NextResponse.json({
          success: true,
          message: "Cleaned up expired reservations",
        });

      case "sync-product":
        if (!productId) {
          return NextResponse.json(
            { error: "productId required for sync-product action" },
            { status: 400 },
          );
        }

        // Force revalidation of specific product
        await revalidateProductPages(productId);

        return NextResponse.json({
          success: true,
          message: `Product ${productId} pages revalidated`,
        });

      case "full-sync":
        // Comprehensive sync - cleanup + revalidate all
        console.log("🔄 Starting full inventory sync...");

        // 1. Clean up expired reservations
        await cleanupExpiredReservations();

        // 2. Revalidate all product pages
        revalidatePath("/products");
        revalidatePath("/products/category/Publications");
        revalidatePath("/products/category/apparel");
        revalidateTag("products");
        revalidateTag("categories");

        console.log("✅ Full inventory sync complete");

        return NextResponse.json({
          success: true,
          message: "Full inventory sync completed",
          actions: ["expired-cleanup", "page-revalidation"],
        });

      case "verify-consistency":
        // Check for inventory inconsistencies
        const inconsistencies = await verifyInventoryConsistency();

        return NextResponse.json({
          success: true,
          message: "Inventory consistency check completed",
          inconsistencies,
          needsAttention: inconsistencies.length > 0,
        });

      default:
        return NextResponse.json(
          { error: `Unknown action: ${action}` },
          { status: 400 },
        );
    }
  } catch (error) {
    console.error("Inventory sync error:", error);
    return NextResponse.json(
      {
        error: "Inventory sync failed",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

async function revalidateProductPages(productId: string) {
  try {
    // Get product slug for specific page revalidation
    const product = await sanityClient.fetch(
      `*[_type == "product" && slug.current == $productId][0]{ 
        "slug": slug.current,
        title,
        category->{title}
      }`,
      { productId },
    );

    if (product) {
      // Revalidate specific product page
      revalidatePath(`/products/${product.slug}`);

      // Revalidate category page
      const categorySlug = product.category?.title?.toLowerCase();
      if (categorySlug) {
        revalidatePath(`/products/category/${categorySlug}`);
      }
    }

    // Always revalidate main products page
    revalidatePath("/products");
    revalidateTag("products");

    console.log(`Revalidated pages for product: ${productId}`);
  } catch (error) {
    console.error(`Failed to revalidate product ${productId}:`, error);
    throw error;
  }
}

async function verifyInventoryConsistency() {
  try {
    const products = await sanityClient.fetch(`
      *[_type == "product"] {
        "id": slug.current,
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

    const inconsistencies = [];

    for (const product of products) {
      // Check for negative available stock
      const baseAvailable =
        product.stockQuantity - (product.reservedQuantity || 0);
      if (baseAvailable < 0) {
        inconsistencies.push({
          productId: product.id,
          type: "negative_stock",
          message: `${product.title} has negative available stock: ${baseAvailable}`,
          details: {
            stockQuantity: product.stockQuantity,
            reservedQuantity: product.reservedQuantity || 0,
          },
        });
      }

      // Check variants if they exist
      if (product.variants) {
        for (const variant of product.variants) {
          const variantAvailable =
            variant.stockQuantity - (variant.reservedQuantity || 0);
          if (variantAvailable < 0) {
            inconsistencies.push({
              productId: product.id,
              type: "negative_variant_stock",
              message: `${product.title} size ${variant.size} has negative available stock: ${variantAvailable}`,
              details: {
                size: variant.size,
                stockQuantity: variant.stockQuantity,
                reservedQuantity: variant.reservedQuantity || 0,
              },
            });
          }
        }
      }

      // Check for extremely high reserved quantities (potential stale data)
      const reservedThreshold = 10; // Adjust based on your business needs
      if ((product.reservedQuantity || 0) > reservedThreshold) {
        inconsistencies.push({
          productId: product.id,
          type: "high_reserved_stock",
          message: `${product.title} has unusually high reserved stock: ${product.reservedQuantity}`,
          details: {
            reservedQuantity: product.reservedQuantity,
          },
        });
      }
    }

    return inconsistencies;
  } catch (error) {
    console.error("Failed to verify inventory consistency:", error);
    throw error;
  }
}

export async function GET() {
  return NextResponse.json({
    message: "Inventory Sync API",
    actions: [
      "cleanup-expired - Clean up expired stock reservations",
      "sync-product - Force sync specific product (requires productId)",
      "full-sync - Complete inventory sync and revalidation",
      "verify-consistency - Check for inventory inconsistencies",
    ],
    usage: 'POST with { "action": "action_name", "productId": "optional" }',
  });
}
