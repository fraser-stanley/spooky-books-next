// components/product-listing.tsx
"use client";

import { ProductCard } from "./product-card";
import { ProductGridSkeleton } from "./product-card-skeleton";
import type { Product } from "@/data/products";
import type { SanityProduct } from "@/lib/sanity/types";

interface ProductListingProps {
  products: Product[];
  sanityProducts: SanityProduct[];
  loading?: boolean;
}

export function ProductListing({
  products,
  sanityProducts,
  loading = false,
}: ProductListingProps) {
  // Show skeleton loading state
  if (loading || products.length === 0) {
    return <ProductGridSkeleton />;
  }

  return (
    <div className="grid grid-cols-12 gap-2 pt-24">
      {products.map((product, index) => {
        // Find corresponding Sanity product for accurate stock data
        const sanityProduct = sanityProducts.find(
          (sp) => sp.slug === product.slug,
        );
        return (
          <ProductCard
            key={product.id}
            product={product}
            sanityProduct={sanityProduct}
            eager={index === 0} // Improve LCP by loading the first product eagerly
          />
        );
      })}
    </div>
  );
}
