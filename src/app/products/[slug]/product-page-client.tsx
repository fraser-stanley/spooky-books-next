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
  
  const hasSizes = sanityProduct?.hasSizes || false
  
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


  return (
    <>
      {/* Size Selector for Sized Apparel - Desktop Inline */}
      {hasSizes && (
        <div className="md:block hidden">
          <SizeSelector
            variants={product.variants!}
            sanityProduct={sanityProduct}
            selectedSize={selectedSize}
            onSizeChange={handleSizeChange}
          />
        </div>
      )}

      {/* Stock Display for Publications and Non-sized Apparel - Desktop Inline */}
      {!hasSizes && (
        <div className="mb-4 md:block hidden">
          {currentAvailableStock === 1 && (
            <span className="text-red-600">(LAST ONE)</span>
          )}
          {currentAvailableStock > 1 && currentAvailableStock <= 3 && (
            <span className="">(ONLY {currentAvailableStock} LEFT)</span>
          )}
        </div>
      )}

      {/* Add to Cart - Desktop Inline */}
      <div className="mb-6 md:block hidden">
        <AddToCart
          product={{
            id: product.id,
            title: product.title,
            price: product.price,
            image: product.images[0]?.url
          }}
          sanityProduct={sanityProduct}
          available={hasStock}
          selectedSize={selectedSize}
          hasSizes={hasSizes}
        />
      </div>

      {/* Mobile Sticky Bottom Container */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white mx-8 p-4 border-t shadow-lg">
        {/* Size Selector for Mobile */}
        {hasSizes && (
          <div className="mb-4">
            <SizeSelector
              variants={product.variants!}
              sanityProduct={sanityProduct}
              selectedSize={selectedSize}
              onSizeChange={handleSizeChange}
            />
          </div>
        )}

        {/* Stock Display for Mobile */}
        {!hasSizes && (
          <div className="mb-4">
            {currentAvailableStock === 1 && (
              <span className="text-red-600">(LAST ONE)</span>
            )}
            {currentAvailableStock > 1 && currentAvailableStock <= 3 && (
              <span className="">(ONLY {currentAvailableStock} LEFT)</span>
            )}
          </div>
        )}

        {/* Add to Cart for Mobile */}
        <AddToCart
          product={{
            id: product.id,
            title: product.title,
            price: product.price,
            image: product.images[0]?.url
          }}
          sanityProduct={sanityProduct}
          available={hasStock}
          selectedSize={selectedSize}
          hasSizes={hasSizes}
        />
      </div>
    </>
  )
}