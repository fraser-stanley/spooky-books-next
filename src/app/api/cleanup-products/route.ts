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
    // Get all products that have the old fields
    const products = await sanityClient.fetch(`
      *[_type == "product" && (defined(productType) || defined(vendor))] {
        _id,
        title,
        productType,
        vendor
      }
    `);

    console.log(
      `Found ${products.length} products with old fields to clean up`,
    );

    const results = [];

    for (const product of products) {
      try {
        console.log(`Cleaning up product: ${product.title}`);

        // Remove the old fields
        await sanityClient
          .patch(product._id)
          .unset(["productType", "vendor"])
          .commit();

        results.push({
          id: product._id,
          title: product.title,
          status: "cleaned",
          removedFields: {
            productType: product.productType || null,
            vendor: product.vendor || null,
          },
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

    return NextResponse.json({
      success: true,
      message: `Cleaned ${results.filter((r) => r.status === "cleaned").length} of ${products.length} products`,
      results,
    });
  } catch (error) {
    console.error("Cleanup error:", error);

    return NextResponse.json(
      {
        error: "Failed to cleanup products",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message:
      "POST to this endpoint to clean up old productType and vendor fields from products",
  });
}
