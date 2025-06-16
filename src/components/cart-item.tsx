"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { useCart } from "./cart-contex"
import { CurrencyPrice } from "./currency-price"
import { getAvailableStock } from "@/lib/utils/stock-validation"
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
  const { removeItem, updateItemQuantity, getCartItemQuantity } = useCart()
  const [localQuantity, setLocalQuantity] = useState(item.quantity)

  // Calculate available stock (excluding current cart quantity)
  const availableStock = sanityProduct 
    ? getAvailableStock(sanityProduct, item.size)
    : 999 // Fallback for products without stock data
  
  // Current cart quantity for other items of the same product/size
  const otherCartQuantity = getCartItemQuantity(item.id, item.size) - item.quantity

  // Maximum quantity is available stock (considering other cart items)
  const remainingStock = Math.max(0, availableStock - otherCartQuantity)
  const maxQuantity = Math.min(remainingStock, 10) // Cap at 10 for UI purposes

  useEffect(() => {
    setLocalQuantity(item.quantity)
  }, [item.quantity])

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity < 1) {
      removeItem(item.id, item.size)
      return
    }

    if (newQuantity > maxQuantity) {
      // Don't allow quantity higher than available stock
      return
    }

    setLocalQuantity(newQuantity)
    updateItemQuantity(item.id, newQuantity, item.size)
  }

  const stockWarning = sanityProduct && remainingStock < item.quantity
  const stockMessage = stockWarning 
    ? `Only ${remainingStock} available` 
    : sanityProduct && remainingStock <= 5 
      ? `${remainingStock} left in stock`
      : null

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
            <span className="text-gray-500 ml-2">Size: {item.size.toUpperCase()}</span>
          )}
        </div>
        
        <div className="text-sm text-gray-600 mb-2">
          <CurrencyPrice price={item.price} />
        </div>

        {/* Quantity Controls */}
        <div className="flex items-center gap-3 mb-2">
          <span className="text-sm text-gray-600">Quantity:</span>
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
              disabled={localQuantity >= maxQuantity}
              className="px-3 py-1 text-sm hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              +
            </button>
          </div>
        </div>

        {/* Stock Warning/Info */}
        {stockMessage && (
          <div className={`text-xs mb-2 ${stockWarning ? 'text-red-600' : 'text-orange-600'}`}>
            {stockMessage}
          </div>
        )}

        <button
          onClick={() => removeItem(item.id, item.size)}
          className="text-xs px-4 py-1 border border-gray-300 hover:bg-gray-100 font-normal uppercase tracking-wide"
        >
          REMOVE
        </button>
      </div>
      
      <div className="text-right">
        <div className="text-sm">
          <CurrencyPrice price={item.price * localQuantity} />
        </div>
      </div>
    </div>
  )
}