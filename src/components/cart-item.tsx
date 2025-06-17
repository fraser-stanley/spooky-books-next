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
  
  // Debug the calculated values
  console.log(`📊 Cart item calculations for ${item.title}:`, {
    totalAvailableStock,
    maxQuantity,
    localQuantity,
    sanityProduct: !!sanityProduct,
    plusDisabled: localQuantity >= maxQuantity,
    minusDisabled: localQuantity <= 1
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
    console.log(`🔄 Cart stepper debug for ${item.title}:`, {
      current: localQuantity,
      new: newQuantity,
      totalAvailableStock,
      maxQuantity,
      sanityProduct: !!sanityProduct,
      isIncrease: newQuantity > localQuantity,
      isDecrease: newQuantity < localQuantity,
      willBlock: newQuantity > localQuantity && newQuantity > maxQuantity
    })

    if (newQuantity < 1) {
      removeItem(item.id, item.size)
      return
    }

    // Only block increases beyond stock, but allow decreases
    if (newQuantity > localQuantity && newQuantity > maxQuantity) {
      // Don't allow quantity increases higher than available stock
      console.log(`❌ Blocked increase: ${newQuantity} > ${maxQuantity}`)
      return
    }

    console.log(`✅ Allowing quantity change from ${localQuantity} to ${newQuantity}`)
    setLocalQuantity(newQuantity)
    updateItemQuantity(item.id, newQuantity, item.size)
  }

  // Remove stock messages from cart page for cleaner interface
  const stockMessage = null

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

        {/* Stock Warning/Info - Removed for cleaner cart interface */}
        {stockMessage && (
          <div className="text-xs mb-2 text-red-600">
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