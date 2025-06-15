// components/product-listing.tsx
"use client"

import { ProductCard } from "./product-card"
import type { Product } from "@/data/products"

interface ProductListingProps {
  products: Product[]
}

export function ProductListing({ products }: ProductListingProps) {
  return (
    <div className="grid grid-cols-12 gap-2 pt-24">
      {products.map((product, index) => (
        <ProductCard
          key={product.id}
          product={product}
          eager={index === 0} // Improve LCP by loading the first product eagerly
        />
      ))}
    </div>
  )
}
