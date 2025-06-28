"use client";

import { useEffect } from "react";
import Image from "next/image";
import { useCart } from "./cart-contex";
import { CurrencyPrice } from "./currency-price";
import { getAvailableStock } from "@/lib/utils/stock-validation";
import { toast } from "sonner";
import type { SanityProduct } from "@/lib/sanity/types";

interface CartItemProps {
  item: {
    id: string;
    title: string;
    price: number;
    quantity: number;
    image?: string;
    size?: string;
  };
  sanityProduct?: SanityProduct;
}

export function CartItem({ item, sanityProduct }: CartItemProps) {
  const { removeItem } = useCart();

  // Auto-adjust if item quantity exceeds available stock on mount
  useEffect(() => {
    if (sanityProduct) {
      const availableStock = getAvailableStock(sanityProduct, item.size);
      if (item.quantity > availableStock) {
        const sizeText = item.size ? ` (${item.size.toUpperCase()})` : "";

        if (availableStock === 0) {
          removeItem(item.id, item.size);
          toast.warning(
            `${item.title}${sizeText} was removed – no longer in stock`,
          );
        } else {
          toast.info(
            `${item.title}${sizeText} quantity exceeds available stock. Please add items from the product page.`,
          );
        }
      }
    }
  }, [
    sanityProduct,
    item.quantity,
    item.title,
    item.id,
    item.size,
    removeItem,
  ]);

  return (
    <article 
      className="flex flex-col sm:flex-row sm:items-start gap-4 sm:gap-6 w-full"
      aria-label={`${item.title}${item.size ? ` in size ${item.size}` : ""} - cart item`}
    >
      {/* Image */}
      <div className="w-full sm:w-24 sm:h-32">
        {item.image ? (
          <Image
            src={item.image}
            alt={`Cover of ${item.title}${sanityProduct?.author ? ` by ${sanityProduct.author}` : ""}`}
            width={600}
            height={400}
            className="w-full h-auto sm:h-32 sm:w-24 object-cover rounded"
          />
        ) : (
          <div className="w-full sm:w-24 sm:h-32 bg-gray-200 flex items-center justify-center rounded">
            <span className="text-gray-400 uppercase">No image</span>
          </div>
        )}
      </div>

      {/* Details */}
      <div className="flex-1 min-w-0">
        <div className="mb-1">
          {item.title}
          {item.size && (
            <span className="ml-2">
              Size: {item.size.toUpperCase()}
            </span>
          )}
        </div>

        {sanityProduct?.author && (
          <div className="mb-1">{sanityProduct.author}</div>
        )}

        <div className="mb-2">
          <span aria-label={`Unit price`}>
            <CurrencyPrice price={item.price} />
          </span>
        </div>

        {/* Quantity & Remove */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mb-2">
          <span className="uppercase">
            Qty: {item.quantity}
          </span>

          <button
            onClick={() => removeItem(item.id, item.size)}
            className="px-4 py-1 border border-gray-300 hover:bg-gray-100 uppercase rounded cursor-pointer"
            aria-label={`Remove ${item.title}${item.size ? ` in size ${item.size}` : ""} from cart`}
          >
            Remove
          </button>
        </div>
      </div>

      {/* Subtotal */}
      <div className="text-sm text-right sm:text-left sm:ml-auto mt-2 sm:mt-0 whitespace-nowrap">
        <span aria-label={`Subtotal for ${item.quantity} items`}>
          <CurrencyPrice price={item.price * item.quantity} />
        </span>
      </div>
    </article>
  );
}
