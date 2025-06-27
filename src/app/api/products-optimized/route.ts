import { NextResponse } from "next/server";
import { sanityClient } from "@/lib/sanity/client";

// Optimized query with only essential fields for cart operations
const optimizedProductQuery = `*[_type == "product"] {
  "id": slug.current,
  "slug": slug.current,
  title,
  price,
  stockQuantity,
  reservedQuantity,
  category->{title, "slug": slug.current},
  "heroImage": heroImage.asset->url,
  variants[]{
    size,
    stockQuantity,
    reservedQuantity
  }
}`;

export async function GET() {
  try {
    const products = await sanityClient.fetch(optimizedProductQuery);

    return NextResponse.json(products, {
      headers: {
        // Cache for 30 seconds
        "Cache-Control": "public, s-maxage=30, stale-while-revalidate=60",
      },
    });
  } catch (error) {
    console.error("Failed to fetch optimized products:", error);
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 },
    );
  }
}

// Revalidate cache on POST (for stock updates)
export async function POST() {
  try {
    const products = await sanityClient.fetch(optimizedProductQuery);

    return NextResponse.json(products, {
      headers: {
        // No cache for fresh data
        "Cache-Control": "no-cache",
      },
    });
  } catch (error) {
    console.error("Failed to fetch fresh products:", error);
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 },
    );
  }
}
