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

  // Calculate available stock from Sanity
  const totalAvailableStock = sanityProduct 
    ? getAvailableStock(sanityProduct, item.size)
    : 0 // Conservative fallback - no stock if no Sanity data
  
  // For cart quantity controls, the max should be the total available stock
  // (not reduced by current cart quantity, since this IS the cart quantity)
  const maxQuantity = Math.min(totalAvailableStock, 10) // Cap at 10 for UI purposes
  
  // Check if current quantity exceeds total available stock (for warnings)
  const isOverStock = item.quantity > totalAvailableStock

  // Debug logging
  console.log(`🛒 Cart item debug for ${item.title}:`, {
    localQuantity,
    totalAvailableStock,
    maxQuantity,
    isOverStock,
    disabled: localQuantity >= maxQuantity,
    sanityProduct: !!sanityProduct
  })

  useEffect(() => {
    setLocalQuantity(item.quantity)
  }, [item.quantity])

  // Auto-adjust quantity if it exceeds available stock
  useEffect(() => {
    if (sanityProduct && item.quantity > totalAvailableStock && totalAvailableStock >= 0) {
      console.log(`Auto-adjusting ${item.title} quantity from ${item.quantity} to ${totalAvailableStock}`)
      const adjustedQuantity = Math.max(totalAvailableStock, 0)
      const sizeText = item.size ? ` (${item.size.toUpperCase()})` : ''
      
      if (adjustedQuantity === 0) {
        removeItem(item.id, item.size)
        toast.warning(`${item.title}${sizeText} was removed - no longer in stock`)
      } else {
        updateItemQuantity(item.id, adjustedQuantity, item.size)
        toast.info(`${item.title}${sizeText} quantity reduced to ${adjustedQuantity} (stock limit)`)
      }
    }
  }, [sanityProduct, totalAvailableStock, item.quantity, item.title, item.id, item.size, removeItem, updateItemQuantity])

  const handleQuantityChange = (newQuantity: number) => {
    console.log(`🔄 Quantity change attempt for ${item.title}:`, {
      current: localQuantity,
      new: newQuantity,
      maxQuantity,
      totalAvailableStock,
      willBlock: newQuantity > maxQuantity
    })

    if (newQuantity < 1) {
      removeItem(item.id, item.size)
      return
    }

    if (newQuantity > maxQuantity) {
      // Don't allow quantity higher than available stock
      console.log(`❌ Blocked quantity change - ${newQuantity} > ${maxQuantity}`)
      return
    }

    setLocalQuantity(newQuantity)
    updateItemQuantity(item.id, newQuantity, item.size)
  }

  const stockWarning = isOverStock
  const stockMessage = stockWarning 
    ? `ONLY ${totalAvailableStock} AVAILABLE` 
    : sanityProduct && totalAvailableStock === 1
      ? 'LAST ONE'
    : sanityProduct && totalAvailableStock <= 3 && totalAvailableStock > 1
      ? `ONLY ${totalAvailableStock} LEFT IN STOCK`
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
          <div className={`text-xs mb-2 ${
            stockWarning ? 'text-red-600' : 
            totalAvailableStock === 1 ? 'text-red-600' : 
            'text-orange-600'
          }`}>
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