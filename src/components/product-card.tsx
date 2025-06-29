"use client";

// TODO: Replace with Sanity GROQ query
import { ImageWithSkeleton } from "./image-with-skeleton";
import Link from "next/link";
import { CurrencyPrice } from "./currency-price";
import { getAvailableStock } from "@/lib/utils/stock-validation";
import { generateProductLinkText } from "@/lib/seo/internal-links";
import type { Product } from "@/data/products";
import type { SanityProduct } from "@/lib/sanity/types";

export type ProductCardProps = {
  product: Product;
  sanityProduct?: SanityProduct;
  eager?: boolean;
};

export function ProductCard({
  product,
  sanityProduct,
  eager,
}: ProductCardProps) {
  const { title, slug, price, images, variants } = product;
  const image = images[0]; // Use first image

  // Helper function to get available stock with fallback for Product type
  const getStockForDisplay = (size?: string) => {
    if (sanityProduct) {
      // Use the proper getAvailableStock function with Sanity data
      return getAvailableStock(sanityProduct, size);
    } else {
      // Fallback to basic Product data (assumes reservedQuantity = 0)
      if (size && variants) {
        const variant = variants.find((v) => v.size === size);
        return variant ? variant.stockQuantity : 0;
      }
      return product.stockQuantity || 0; // Handle null/undefined stockQuantity
    }
  };

  // Determine product type and stock checking logic
  const hasSizes = sanityProduct?.variants && sanityProduct.variants.length > 0;

  const isOutOfStock = hasSizes
    ? (sanityProduct?.variants?.every((v) => getStockForDisplay(v.size) <= 0) ??
      true) // Sized apparel: check all variants
    : getStockForDisplay() <= 0; // Publications and non-sized apparel: check main stock

  return (
    <div className="col-span-12 sm:col-span-4">
      <Link
        className="capitalize inline-block"
        href={`/products/${slug}`}
        aria-label={`View ${sanityProduct ? generateProductLinkText(sanityProduct, 'grid') : title} product page`}
        title={sanityProduct ? `Shop ${generateProductLinkText(sanityProduct, 'grid')} - Independent Art Book` : title}
      >
        {image ? (
          <div data-name="product-image-box" className="w-full">
            <ImageWithSkeleton
              src={image.url}
              alt={image.alt}
              width={800}
              height={800}
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              quality={90}
              className="transition-brightness duration-200 hover:brightness-90 cursor-pointer"
              loading={eager ? "eager" : "lazy"}
              priority={eager}
            />
          </div>
        ) : (
          <div className="w-full aspect-square bg-gray-100" />
        )}
        <div className="mb-12 sm:mb-8 pt-2">
          <h2>
            {title}
            {isOutOfStock && " (SOLD OUT)"}
            {!isOutOfStock &&
              !hasSizes &&
              (() => {
                // Publications and non-sized apparel: show main stock status
                const availableStock = getStockForDisplay();
                if (availableStock === 1) return " (LAST ONE)";
                return availableStock > 1 && availableStock <= 3
                  ? ` (ONLY ${availableStock} LEFT)`
                  : "";
              })()}
            {!isOutOfStock &&
              hasSizes &&
              sanityProduct?.variants &&
              (() => {
                // Sized apparel: calculate total available stock across all sizes
                const availableVariants = sanityProduct.variants.filter(
                  (v) => getStockForDisplay(v.size) > 0,
                );
                if (availableVariants.length === 0) return "";

                const totalAvailableStock = availableVariants.reduce(
                  (sum, v) => sum + getStockForDisplay(v.size),
                  0,
                );

                // Only show urgency if total available across all sizes is low
                if (totalAvailableStock === 1) return " (LAST ONE)";
                return totalAvailableStock <= 3
                  ? ` (ONLY ${totalAvailableStock} LEFT)`
                  : "";
              })()}
          </h2>
          {sanityProduct?.author && (
            <div>{sanityProduct.author}</div>
          )}
          <div>
            <CurrencyPrice price={price} />
          </div>
        </div>
      </Link>
    </div>
  );
}
