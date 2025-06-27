import { NextResponse } from "next/server";
import { createClient } from "@sanity/client";

const sanityClient = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "0gbx06x6",
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || "production",
  token: process.env.SANITY_API_TOKEN!,
  apiVersion: "2023-05-03",
  useCdn: false,
});

export async function POST() {
  try {
    console.log("🧹 Starting legacy description cleanup...");

    // Get all products that still have any legacy fields
    const productsWithLegacyFields = await sanityClient.fetch(`
      *[_type == "product" && (defined(description) || defined(vendor) || defined(category.description))] {
        _id,
        title,
        description,
        vendor,
        "categoryDescription": category.description
      }
    `);

    console.log(`Found ${productsWithLegacyFields.length} products with legacy description fields`);

    if (productsWithLegacyFields.length === 0) {
      return NextResponse.json({
        success: true,
        message: "No legacy description fields found to clean up",
        cleaned: 0,
      });
    }

    const results = [];

    // Remove the legacy description field from each product
    for (const product of productsWithLegacyFields) {
      try {
        console.log(`Cleaning legacy fields from: ${product.title}`);

        // Use unset to remove all legacy fields
        const fieldsToRemove = [];
        if (product.description) fieldsToRemove.push('description');
        if (product.vendor) fieldsToRemove.push('vendor');
        
        if (fieldsToRemove.length > 0) {
          await sanityClient
            .patch(product._id)
            .unset(fieldsToRemove)
            .commit();
        }

        results.push({
          id: product._id,
          title: product.title,
          status: "success",
          removedFields: fieldsToRemove,
        });

        console.log(`✅ Cleaned: ${product.title}`);
      } catch (error) {
        console.error(`❌ Failed to clean ${product.title}:`, error);
        results.push({
          id: product._id,
          title: product.title,
          status: "error",
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }

    const successCount = results.filter((r) => r.status === "success").length;
    const errorCount = results.filter((r) => r.status === "error").length;

    console.log(`🎉 Cleanup complete: ${successCount} cleaned, ${errorCount} errors`);

    return NextResponse.json({
      success: true,
      message: `Successfully cleaned ${successCount} products. ${errorCount} errors encountered.`,
      cleaned: successCount,
      errors: errorCount,
      results,
    });
  } catch (error) {
    console.error("Legacy cleanup error:", error);

    return NextResponse.json(
      {
        error: "Failed to cleanup legacy description fields",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

export async function GET() {
  try {
    // Check how many products still have legacy fields
    const productsWithLegacyFields = await sanityClient.fetch(`
      *[_type == "product" && (defined(description) || defined(vendor))] {
        _id,
        title,
        description,
        vendor
      }
    `);

    return NextResponse.json({
      message: "Legacy description field cleanup endpoint",
      productsWithLegacyFields: productsWithLegacyFields.length,
      products: productsWithLegacyFields.map((p: any) => ({ id: p._id, title: p.title })),
      instructions: "POST to this endpoint to clean up all legacy description fields",
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Failed to check legacy fields",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}