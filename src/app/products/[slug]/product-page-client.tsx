"use client"

import { useState } from "react"
import { AddToCart } from "@/components/add-to-cart"
import { SizeSelector } from "@/components/size-selector"
import type { Product, ProductVariant } from "@/data/products"

interface ProductPageClientProps {
  product: Product
}

export function ProductPageClient({ product }: ProductPageClientProps) {
  const [selectedSize, setSelectedSize] = useState<string>("")
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null)
  
  const isApparel = product.category.toLowerCase() === 'apparel' && product.variants && product.variants.length > 0
  const hasStock = isApparel 
    ? Boolean(selectedVariant && selectedVariant.stockQuantity > 0)
    : product.stockQuantity > 0

  const handleSizeChange = (size: string, variant: ProductVariant) => {
    setSelectedSize(size)
    setSelectedVariant(variant)
  }

  // Show size requirement message for apparel without size selection
  const needsSizeSelection = isApparel && !selectedSize

  return (
    <>
      {/* Size Selector for Apparel */}
      {isApparel && (
        <SizeSelector
          variants={product.variants!}
          selectedSize={selectedSize}
          onSizeChange={handleSizeChange}
        />
      )}

      {/* Add to Cart */}
      <div className="mb-6">
        <AddToCart
          product={{
            id: product.id,
            title: product.title,
            price: product.price,
            image: product.images[0]?.url
          }}
          available={!needsSizeSelection && hasStock}
          selectedSize={selectedSize}
        />
        {needsSizeSelection && (
          <p className="text-sm text-gray-600 mt-2">
            Please select a size to add to cart
          </p>
        )}
      </div>
    </>
  )
}