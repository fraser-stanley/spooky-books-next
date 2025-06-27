import { NextResponse } from "next/server";
import { getProducts } from "@/lib/sanity/queries";
import {
  getAvailableStock,
  getStockStatusText,
} from "@/lib/utils/stock-validation";

export async function GET() {
  try {
    const products = await getProducts();

    const debug = products.map((product) => {
      const baseStock = getAvailableStock(product);
      const stockStatus = getStockStatusText(product);

      let variantDebug = null;
      if (product.variants && product.variants.length > 0) {
        variantDebug = product.variants.map((variant) => ({
          size: variant.size,
          stockQuantity: variant.stockQuantity,
          reservedQuantity: variant.reservedQuantity || 0,
          availableStock: getAvailableStock(product, variant.size),
          stockStatus: getStockStatusText(product, variant.size),
        }));
      }

      return {
        title: product.title,
        slug: product.slug,
        category: product.category.title,
        baseStockQuantity: product.stockQuantity,
        baseReservedQuantity: product.reservedQuantity || 0,
        availableStock: baseStock,
        stockStatus,
        hasSizes: product.hasSizes,
        variants: variantDebug,
        rawProduct: product,
      };
    });

    return NextResponse.json(
      {
        timestamp: new Date().toISOString(),
        productsCount: products.length,
        debug,
      },
      {
        headers: {
          "Cache-Control": "no-cache, no-store, must-revalidate",
        },
      },
    );
  } catch (error) {
    console.error("Debug products error:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch debug data",
        message: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}
