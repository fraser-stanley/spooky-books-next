// components/add-to-cart.tsx
"use client";

import { useRouter } from "next/navigation";
import { useCart } from "./cart-contex";
import { toast } from "sonner";
import {
  validateProductStock,
  getAvailableStock,
} from "@/lib/utils/stock-validation";
import type { SanityProduct } from "@/lib/sanity/types";
import styles from "./add-to-cart.module.css";

export function AddToCart({
  product,
  sanityProduct,
  variantId,
  quantity = 1,
  available = true,
  selectedSize,
  hasSizes = false,
  ...props
}: {
  product: {
    id: string;
    title: string;
    price: number;
    image?: string;
  };
  sanityProduct?: SanityProduct;
  variantId?: string;
  quantity?: number;
  available?: boolean;
  selectedSize?: string;
  hasSizes?: boolean;
  [key: string]: unknown;
}) {
  const { addItem, getCartItemQuantity } = useCart();
  const router = useRouter();

  function handleAddToCart(e: React.MouseEvent) {
    e.preventDefault();

    // If we have Sanity product data, validate stock
    if (sanityProduct) {
      const currentInCart = getCartItemQuantity(product.id, selectedSize);
      const totalRequestedQuantity = currentInCart + quantity;

      const stockValidation = validateProductStock(
        sanityProduct,
        totalRequestedQuantity,
        selectedSize,
      );

      if (!stockValidation.isValid) {
        toast.error(stockValidation.message || "Not enough stock available");
        return;
      }
    }

    // Haptic feedback for mobile devices
    if ("vibrate" in navigator) {
      navigator.vibrate(50);
    }

    addItem({
      id: variantId || product.id,
      title: product.title,
      price: product.price,
      quantity,
      image: product.image,
      size: selectedSize,
    });

    const sizeText = selectedSize ? ` (${selectedSize.toUpperCase()})` : "";
    toast.success(`Added ${product.title}${sizeText} to cart`, {
      action: {
        label: "View Cart",
        onClick: () => router.push("/cart"),
      },
    });
  }

  // Calculate available stock for display (raw stock, not considering cart)
  const availableStock = sanityProduct
    ? getAvailableStock(sanityProduct, selectedSize)
    : undefined;

  // For sized products without size selection, just show disabled state
  const needsSizeSelection = hasSizes && !selectedSize;

  // Determine if item is actually available (this considers cart contents via `available` prop)
  const isAvailable = available && !needsSizeSelection;

  // Determine if item is sold out - either no raw stock OR available prop says no stock
  const isSoldOut =
    !needsSizeSelection &&
    ((availableStock !== undefined && availableStock <= 0) || !available);

  const getAriaLabel = () => {
    if (isSoldOut) return `${product.title} is sold out`;
    if (needsSizeSelection) return `Select a size for ${product.title} before adding to cart`;
    return `Add ${product.title}${selectedSize ? ` in size ${selectedSize}` : ""} to cart`;
  };

  const getAriaDescribedBy = () => {
    if (availableStock !== undefined && availableStock > 0) {
      return `stock-${product.id}`;
    }
    return undefined;
  };

  return (
    <>
      <button
        type="button"
        className={styles.addToCart}
        onClick={isAvailable ? handleAddToCart : undefined}
        disabled={!isAvailable}
        aria-label={getAriaLabel()}
        aria-describedby={getAriaDescribedBy()}
        title={
          availableStock !== undefined ? `${availableStock} in stock` : undefined
        }
        {...props}
      >
        {isSoldOut
          ? "SOLD OUT"
          : needsSizeSelection
            ? "Select a size"
            : "Add to Cart"}
      </button>
      {availableStock !== undefined && availableStock > 0 && (
        <div 
          id={`stock-${product.id}`} 
          className="sr-only"
          aria-live="polite"
        >
          {availableStock} items in stock
        </div>
      )}
    </>
  );
}
