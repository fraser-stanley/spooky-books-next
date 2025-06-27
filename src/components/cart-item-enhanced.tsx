"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useCart } from "./cart-contex";
import { CurrencyPrice } from "./currency-price";
import { getAvailableStock } from "@/lib/utils/stock-validation";
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
  isLoading?: boolean;
}

function QuantitySkeleton() {
  return (
    <div className="flex items-center gap-3 mb-2">
      <div className="animate-pulse bg-gray-200 rounded h-4 w-16" />
      <div className="animate-pulse bg-gray-200 rounded h-8 w-24" />
    </div>
  );
}

function StockInfoSkeleton() {
  return <div className="animate-pulse bg-gray-200 rounded h-3 w-24 mb-2" />;
}

export function CartItemEnhanced({
  item,
  sanityProduct,
  isLoading = false,
}: CartItemProps) {
  const { removeItem, updateItemQuantity, getCartItemQuantity } = useCart();
  const [localQuantity, setLocalQuantity] = useState(item.quantity);
  const [isUpdating, setIsUpdating] = useState(false);

  // Calculate available stock (excluding current cart quantity)
  const availableStock = sanityProduct
    ? getAvailableStock(sanityProduct, item.size)
    : 999; // Fallback for products without stock data

  // Current cart quantity for other items of the same product/size
  const otherCartQuantity =
    getCartItemQuantity(item.id, item.size) - item.quantity;

  // Maximum quantity is available stock (considering other cart items)
  const remainingStock = Math.max(0, availableStock - otherCartQuantity);
  const maxQuantity = Math.min(remainingStock, 10); // Cap at 10 for UI purposes

  useEffect(() => {
    setLocalQuantity(item.quantity);
  }, [item.quantity]);

  const handleQuantityChange = async (newQuantity: number) => {
    if (newQuantity < 1) {
      setIsUpdating(true);
      removeItem(item.id, item.size);
      return;
    }

    if (newQuantity > maxQuantity) {
      // Don't allow quantity higher than available stock
      return;
    }

    // Optimistic update
    setLocalQuantity(newQuantity);
    setIsUpdating(true);

    try {
      updateItemQuantity(item.id, newQuantity, item.size);
    } catch (error) {
      // Rollback on error
      setLocalQuantity(item.quantity);
      console.error("Failed to update quantity:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  const stockWarning = sanityProduct && remainingStock < item.quantity;
  const stockMessage = stockWarning
    ? `Only ${remainingStock} available`
    : sanityProduct && remainingStock <= 5
      ? `${remainingStock} left in stock`
      : null;

  return (
    <div className="flex gap-6">
      <div className="flex-shrink-0">
        {item.image ? (
          <Image
            src={item.image}
            alt={item.title}
            width={96}
            height={128}
            className="w-24 h-32 object-cover"
          />
        ) : (
          <div className="w-24 h-32 bg-gray-200 flex items-center justify-center">
            <span className="text-gray-400 text-xs">No image</span>
          </div>
        )}
      </div>

      <div className="flex-1">
        <div className="text-sm mb-1">
          {item.title}
          {item.size && (
            <span className="text-black ml-2">
              Size: {item.size.toUpperCase()}
            </span>
          )}
        </div>

        <div className="text-sm text-black mb-2">
          <CurrencyPrice price={item.price} />
        </div>

        {/* Quantity Controls */}
        {isLoading ? (
          <QuantitySkeleton />
        ) : (
          <div className="flex items-center gap-3 mb-2">
            <span className="text-sm text-black">Quantity:</span>
            <div
              className={`flex items-center border border-gray-300 rounded ${isUpdating ? "opacity-50" : ""}`}
            >
              <button
                onClick={() => handleQuantityChange(localQuantity - 1)}
                disabled={localQuantity <= 1 || isUpdating}
                className="px-3 py-1 text-sm hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                −
              </button>
              <span className="px-3 py-1 text-sm border-x border-gray-300 min-w-[3rem] text-center">
                {localQuantity}
                {isUpdating && (
                  <div className="inline-block ml-1 animate-spin rounded-full h-3 w-3 border border-gray-400 border-t-transparent"></div>
                )}
              </span>
              <button
                onClick={() => handleQuantityChange(localQuantity + 1)}
                disabled={localQuantity >= maxQuantity || isUpdating}
                className="px-3 py-1 text-sm hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                +
              </button>
            </div>
          </div>
        )}

        {/* Stock Warning/Info */}
        {isLoading ? (
          <StockInfoSkeleton />
        ) : stockMessage ? (
          <div
            className={`text-xs mb-2 ${stockWarning ? "text-red-600" : "text-orange-600"}`}
          >
            {stockMessage}
          </div>
        ) : null}

        <button
          onClick={() => removeItem(item.id, item.size)}
          disabled={isUpdating}
          className="text-xs px-4 py-1 border border-gray-300 hover:bg-gray-100 font-normal uppercase tracking-wide disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isUpdating ? "REMOVING..." : "REMOVE"}
        </button>
      </div>

      <div className="text-right">
        <div className="text-sm">
          <CurrencyPrice price={item.price * localQuantity} />
        </div>
      </div>
    </div>
  );
}
