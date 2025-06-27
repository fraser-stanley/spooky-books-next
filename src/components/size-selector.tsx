"use client";

import { useCart } from "./cart-contex";
import { getAvailableStock } from "@/lib/utils/stock-validation";
import type { ProductVariant } from "@/data/products";
import type { SanityProduct } from "@/lib/sanity/types";

interface SizeSelectorProps {
  variants: ProductVariant[];
  sanityProduct: SanityProduct;
  selectedSize?: string;
  onSizeChange: (size: string, variant: ProductVariant) => void;
}

export function SizeSelector({
  variants,
  sanityProduct,
  selectedSize,
  onSizeChange,
}: SizeSelectorProps) {
  const { getCartItemQuantity } = useCart();

  if (!variants || variants.length === 0) {
    return null;
  }

  // Helper to get real-time available stock for a size
  const getCurrentAvailableStock = (size: string) => {
    const availableStock = getAvailableStock(sanityProduct, size);
    const inCart = getCartItemQuantity(sanityProduct.id, size);
    return Math.max(0, availableStock - inCart);
  };

  return (
    <div className="mb-6">
      <div className="grid grid-cols-4 gap-2">
        {variants.map((variant) => {
          const isSelected = selectedSize === variant.size;
          const currentAvailableStock = getCurrentAvailableStock(variant.size);
          const isOutOfStock = currentAvailableStock <= 0;

          return (
            <button
              key={variant.size}
              onClick={() =>
                !isOutOfStock && onSizeChange(variant.size, variant)
              }
              disabled={isOutOfStock}
              className={`
                border px-3 py-2 text-sm font-medium rounded
                ${
                  isSelected
                    ? "border-black bg-black text-white"
                    : `border-gray-300 ${!isOutOfStock ? "hover:border-gray-400" : ""}`
                }
                ${
                  isOutOfStock
                    ? "opacity-50 cursor-not-allowed"
                    : "cursor-pointer"
                }
                transition-colors
              `}
            >
              {variant.size.toUpperCase()}
            </button>
          );
        })}
      </div>
    </div>
  );
}
