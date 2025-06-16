"use client"

import { useState } from "react"
import { AddToCart } from "@/components/add-to-cart"
import { SizeSelector } from "@/components/size-selector"
import { useCart } from "@/components/cart-contex"
import { getAvailableStock } from "@/lib/utils/stock-validation"
import type { Product, ProductVariant } from "@/data/products"
import type { SanityProduct } from "@/lib/sanity/types"

interface ProductPageClientProps {
  product: Product
  sanityProduct: SanityProduct
}

export function ProductPageClient({ product, sanityProduct }: ProductPageClientProps) {
  const [selectedSize, setSelectedSize] = useState<string>("")
  const [, setSelectedVariant] = useState<ProductVariant | null>(null)
  const { getCartItemQuantity } = useCart()
  
  const isApparel = product.category.toLowerCase() === 'apparel' && product.variants && product.variants.length > 0
  
  // Calculate real-time available stock considering cart contents
  const getCurrentAvailableStock = (size?: string) => {
    const availableStock = getAvailableStock(sanityProduct, size)
    const inCart = getCartItemQuantity(product.id, size)
    return Math.max(0, availableStock - inCart)
  }
  
  const currentAvailableStock = getCurrentAvailableStock(selectedSize)
  const hasStock = currentAvailableStock > 0

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
          sanityProduct={sanityProduct}
          selectedSize={selectedSize}
          onSizeChange={handleSizeChange}
        />
      )}

      {/* Stock Display */}
      {!isApparel && (
        <div className="mb-4">
          {currentAvailableStock <= 0 && (
            <span className="text-red-600 font-medium">SOLD OUT</span>
          )}
          {currentAvailableStock > 0 && currentAvailableStock <= 5 && (
            <span className="text-orange-600 font-medium">ONLY {currentAvailableStock} LEFT</span>
          )}
          {currentAvailableStock > 5 && (
            <span className="text-green-600 font-medium">In Stock</span>
          )}
        </div>
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
          sanityProduct={sanityProduct}
          available={!needsSizeSelection && hasStock}
          selectedSize={selectedSize}
        />
        {needsSizeSelection && (
          <p className="text-sm text-gray-600 mt-2">
            Please select a size to add to cart
          </p>
        )}
        {!needsSizeSelection && !hasStock && (
          <p className="text-sm text-red-600 mt-2">
            {isApparel ? `Size ${selectedSize?.toUpperCase()} is sold out` : 'This item is sold out'}
          </p>
        )}
      </div>
    </>
  )
}