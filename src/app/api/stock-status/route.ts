import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@sanity/client";
import { getAvailableStock } from "@/lib/utils/stock-validation";
import type { SanityProduct } from "@/lib/sanity/types";

const sanityClient = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "0gbx06x6",
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || "production",
  apiVersion: "2023-05-03",
  token: process.env.SANITY_API_TOKEN,
  useCdn: false,
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const productIds = searchParams.get("productIds")?.split(",") || [];

    if (productIds.length === 0) {
      return NextResponse.json(
        { error: "No product IDs provided" },
        { status: 400 },
      );
    }

    // Get current product data using the same method as checkout API
    const products = await sanityClient.fetch(
      `*[_type == "product" && slug.current in $productIds] {
        "id": slug.current,
        title,
        author,
        description,
        price,
        stockQuantity,
        reservedQuantity,
        category->{title, "slug": slug.current},
        variants[]{
          size,
          stockQuantity,
          reservedQuantity,
          stripePriceId
        }
      }`,
      { productIds },
    );

    // Calculate stock status for each product
    const stockStatus = products.map((product: Record<string, unknown>) => {
      const result: Record<string, unknown> = {
        productId: product.id,
        title: product.title,
        category: (product.category as { title: string })?.title,
      };

      if (
        product.variants &&
        Array.isArray(product.variants) &&
        product.variants.length > 0
      ) {
        // Apparel with variants
        result.variants = (product.variants as Record<string, unknown>[]).map(
          (variant) => ({
            size: variant.size,
            totalStock: variant.stockQuantity,
            reservedStock: variant.reservedQuantity || 0,
            availableStock: getAvailableStock(
              product as unknown as SanityProduct,
              variant.size as string,
            ),
            inStock:
              getAvailableStock(
                product as unknown as SanityProduct,
                variant.size as string,
              ) > 0,
          }),
        );
      } else {
        // Publications
        result.totalStock = product.stockQuantity;
        result.reservedStock = product.reservedQuantity || 0;
        result.availableStock = getAvailableStock(
          product as unknown as SanityProduct,
        );
        result.inStock =
          getAvailableStock(product as unknown as SanityProduct) > 0;
      }

      return result;
    });

    return NextResponse.json({
      success: true,
      stockStatus,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Stock status API error:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { items } = await request.json();

    if (!Array.isArray(items)) {
      return NextResponse.json(
        { error: "Invalid request data. Expected items array." },
        { status: 400 },
      );
    }

    console.log(
      "🔍 Stock validation for items:",
      items.map((item) => ({
        productId: item.productId,
        size: item.size,
        quantity: item.quantity,
      })),
    );

    // Get current product data using the same method as checkout API
    const productIds = items.map((item) => item.productId);
    const products = await sanityClient.fetch(
      `*[_type == "product" && slug.current in $productIds] {
        "id": slug.current,
        title,
        stockQuantity,
        reservedQuantity,
        category->{title, "slug": slug.current},
        variants[]{
          size,
          stockQuantity,
          reservedQuantity
        }
      }`,
      { productIds },
    );

    console.log(
      "📋 Found products for validation:",
      products.map(
        (p: { id: string; title: string; variants?: unknown[] }) => ({
          id: p.id,
          title: p.title,
          variants: p.variants?.length || 0,
        }),
      ),
    );

    // Check stock for each requested item
    const stockChecks = items.map((item) => {
      const product = products.find(
        (p: Record<string, unknown>) => p.id === item.productId,
      );

      if (!product) {
        console.log(`❌ Product not found for ID: ${item.productId}`);
        return {
          productId: item.productId,
          size: item.size,
          requestedQuantity: item.quantity,
          availableStock: 0,
          inStock: false,
          error: "Product not found",
          productTitle: `Unknown Product (${item.productId})`,
        };
      }

      const availableStock = getAvailableStock(
        product as unknown as SanityProduct,
        item.size,
      );

      return {
        productId: item.productId,
        size: item.size,
        requestedQuantity: item.quantity,
        availableStock,
        inStock: item.quantity <= availableStock,
        productTitle: product.title,
      };
    });

    const allInStock = stockChecks.every((check) => check.inStock);

    return NextResponse.json({
      success: true,
      allInStock,
      stockChecks,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Stock check API error:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
