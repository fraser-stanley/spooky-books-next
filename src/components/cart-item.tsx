"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { useCart } from "./cart-contex"
import { CurrencyPrice } from "./currency-price"
import { getAvailableStock } from "@/lib/utils/stock-validation"
import { toast } from "sonner"
import type { SanityProduct } from "@/lib/sanity/types"

interface CartItemProps {
  item: {
    id: string
    title: string
    price: number
    quantity: number
    image?: string
    size?: string
  }
  sanityProduct?: SanityProduct
}

export function CartItem({ item, sanityProduct }: CartItemProps) {
  const { removeItem, updateItemQuantity } = useCart()
  const [localQuantity, setLocalQuantity] = useState(item.quantity)

  // Calculate maximum quantity this cart item can have
  const getCurrentAvailableStock = () => {
    if (!sanityProduct) return null
    
    // For cart items: max quantity is simply the total available stock
    // since cart merges items - there's only one instance per product+size
    return getAvailableStock(sanityProduct, item.size)
  }

  const currentAvailableStock = getCurrentAvailableStock()

  useEffect(() => {
    setLocalQuantity(item.quantity)
  }, [item.quantity])

  // Auto-adjust if item quantity exceeds available stock
  useEffect(() => {
    if (sanityProduct && currentAvailableStock !== null && localQuantity > currentAvailableStock) {
      const adjustedQuantity = Math.max(currentAvailableStock, 0)
      const sizeText = item.size ? ` (${item.size.toUpperCase()})` : ""

      if (adjustedQuantity === 0) {
        removeItem(item.id, item.size)
        toast.warning(`${item.title}${sizeText} was removed – no longer in stock`)
      } else {
        setLocalQuantity(adjustedQuantity)
        updateItemQuantity(item.id, adjustedQuantity, item.size)
        toast.info(`${item.title}${sizeText} quantity reduced to ${adjustedQuantity} (stock limit)`)
      }
    }
  }, [sanityProduct, currentAvailableStock, localQuantity, item.title, item.id, item.size, removeItem, updateItemQuantity])

  const handleQuantityChange = (newQuantity: number) => {
    // Remove item if quantity goes to 0
    if (newQuantity < 1) {
      removeItem(item.id, item.size)
      return
    }

    // Always allow decreases
    if (newQuantity < localQuantity) {
      setLocalQuantity(newQuantity)
      updateItemQuantity(item.id, newQuantity, item.size)
      return
    }

    // For increases, check if we have enough stock
    if (newQuantity > localQuantity) {
      if (currentAvailableStock !== null && newQuantity > currentAvailableStock) {
        // Don't allow increase beyond available stock
        return
      }
    }

    setLocalQuantity(newQuantity)
    updateItemQuantity(item.id, newQuantity, item.size)
  }

  return (
    <div className="flex flex-col sm:flex-row sm:items-start gap-4 sm:gap-6 w-full">
      {/* Image */}
      <div className="w-full sm:w-24 sm:h-32">
  {item.image ? (
    <Image
      src={item.image}
      alt={item.title}
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
            <span className="text-gray-500 ml-2 font-normal">
              Size: {item.size.toUpperCase()}
            </span>
          )}
        </div>

        <div className="mb-2">
          <CurrencyPrice price={item.price} />
        </div>

        {/* Quantity & Remove */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mb-2">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600 uppercase">Qty:</span>
            <div className="flex items-center border border-gray-300 rounded">
              <button
                onClick={() => handleQuantityChange(localQuantity - 1)}
                disabled={localQuantity <= 1}
                className="px-3 py-1 text-sm hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                −
              </button>
              <span className="px-3 py-1 text-sm border-x border-gray-300 min-w-[3rem] text-center">
                {localQuantity}
              </span>
              <button
                onClick={() => handleQuantityChange(localQuantity + 1)}
                disabled={currentAvailableStock !== null && localQuantity >= currentAvailableStock}
                className="px-3 py-1 text-sm hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                +
              </button>
            </div>
          </div>

          <button
            onClick={() => removeItem(item.id, item.size)}
            className="px-4 py-1 border border-gray-300 hover:bg-gray-100 font-normal uppercase tracking-wide rounded"
          >
            Remove
          </button>
        </div>
      </div>

      {/* Subtotal */}
      <div className="text-sm text-right sm:text-left sm:ml-auto mt-2 sm:mt-0 whitespace-nowrap">
        <CurrencyPrice price={item.price * localQuantity} />
      </div>
    </div>
  )
}
