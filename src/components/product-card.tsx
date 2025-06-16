"use client"

// TODO: Replace with Sanity GROQ query
import Image from "next/image"
import Link from "next/link"
import { CurrencyPrice } from "./currency-price"
import { getAvailableStock } from "@/lib/utils/stock-validation"
import type { Product } from "@/data/products"
import type { SanityProduct } from "@/lib/sanity/types"

export type ProductCardProps = {
  product: Product
  sanityProduct?: SanityProduct
  eager?: boolean
}

export function ProductCard({ product, sanityProduct, eager }: ProductCardProps) {
  const { title, slug, price, images, variants, category } = product
  const image = images[0] // Use first image
  
  // Helper function to get available stock with fallback for Product type
  const getStockForDisplay = (size?: string) => {
    if (sanityProduct) {
      // Use the proper getAvailableStock function with Sanity data
      return getAvailableStock(sanityProduct, size)
    } else {
      // Fallback to basic Product data (assumes reservedQuantity = 0)
      if (size && variants) {
        const variant = variants.find(v => v.size === size)
        return variant ? variant.stockQuantity : 0
      }
      return product.stockQuantity
    }
  }
  
  // For apparel, check if any variant has stock; for publications, check main stock
  const isApparel = category.toLowerCase() === 'apparel'
  const isOutOfStock = isApparel 
    ? !variants || variants.length === 0 || variants.every(v => getStockForDisplay(v.size) <= 0)
    : getStockForDisplay() <= 0

  return (
    <Link
      className="col-span-12 sm:col-span-4 capitalize"
      href={`/products/${slug}`}
      aria-label={`View ${title} product page`}
    >
      {image ? (
        <div data-name="product-image-box">
          <Image
            src={image.url}
            alt={image.alt}
            width={400}
            height={400}
            className="rounded-md sm:rounded-lg w-full"
            loading={eager ? "eager" : "lazy"}
          />
        </div>
      ) : (
        <div style={{ height: 400, width: 400 }} className="bg-gray-100" />
      )}
      <div className="text-md sm:text-sm mb-12 sm:mb-8 pt-2">
        <h2 className="">
          {title}
          {isOutOfStock && " (SOLD OUT)"}
          {!isOutOfStock && !isApparel && (() => {
            const availableStock = getStockForDisplay();
            return availableStock > 0 && availableStock <= 5 ? ` (ONLY ${availableStock} LEFT)` : '';
          })()}
          {!isOutOfStock && isApparel && variants && (() => {
            const lowStockVariants = variants.filter(v => {
              const availableStock = getStockForDisplay(v.size);
              return availableStock > 0 && availableStock <= 5;
            });
            const totalLowStock = lowStockVariants.reduce((sum, v) => sum + getStockForDisplay(v.size), 0);
            return totalLowStock > 0 ? ` (ONLY ${totalLowStock} LEFT)` : '';
          })()}
        </h2>
        <div className="">
          <CurrencyPrice price={price} />
        </div>
      </div>
    </Link>
  )
}
