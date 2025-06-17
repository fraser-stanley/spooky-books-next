// components/add-to-cart.tsx
"use client"

import { useRouter } from "next/navigation"
import { useCart } from "./cart-contex"
import { toast } from "sonner"
import { validateProductStock, getAvailableStock } from "@/lib/utils/stock-validation"
import type { SanityProduct } from "@/lib/sanity/types"
import styles from "./add-to-cart.module.css"

export function AddToCart({
  product,
  sanityProduct,
  variantId,
  quantity = 1,
  available = true,
  selectedSize,
  isApparel = false,
  ...props
}: {
  product: {
    id: string
    title: string
    price: number
    image?: string
  }
  sanityProduct?: SanityProduct
  variantId?: string
  quantity?: number
  available?: boolean
  selectedSize?: string
  isApparel?: boolean
  [key: string]: unknown
}) {
  const { addItem, getCartItemQuantity } = useCart()
  const router = useRouter()

  function handleAddToCart(e: React.MouseEvent) {
    e.preventDefault()
    
    // If we have Sanity product data, validate stock
    if (sanityProduct) {
      const currentInCart = getCartItemQuantity(product.id, selectedSize)
      const totalRequestedQuantity = currentInCart + quantity
      
      const stockValidation = validateProductStock(
        sanityProduct, 
        totalRequestedQuantity, 
        selectedSize
      )
      
      if (!stockValidation.isValid) {
        toast.error(stockValidation.message || 'Not enough stock available')
        return
      }
    }
    
    // Haptic feedback for mobile devices
    if ('vibrate' in navigator) {
      navigator.vibrate(50)
    }
    
    addItem({
      id: variantId || product.id,
      title: product.title,
      price: product.price,
      quantity,
      image: product.image,
      size: selectedSize,
    })
    
    const sizeText = selectedSize ? ` (${selectedSize.toUpperCase()})` : ''
    toast.success(`Added ${product.title}${sizeText} to cart`, {
      action: {
        label: "View Cart",
        onClick: () => router.push("/cart"),
      },
    })
  }

  // Calculate available stock for display
  const availableStock = sanityProduct 
    ? getAvailableStock(sanityProduct, selectedSize)
    : undefined

  // For apparel without size selection, just show disabled state
  const needsSizeSelection = isApparel && !selectedSize
  
  // Determine if item is actually available
  const isAvailable = available && (availableStock === undefined || availableStock > 0) && !needsSizeSelection
  
  // Determine if item is sold out (has stock data but no stock)
  const isSoldOut = availableStock !== undefined && availableStock <= 0 && !needsSizeSelection

  return (
    <button
      type="button"
      className={styles.addToCart}
      onClick={isAvailable ? handleAddToCart : undefined}
      disabled={!isAvailable}
      title={availableStock !== undefined ? `${availableStock} in stock` : undefined}
      {...props}
    >
      {isSoldOut ? "SOLD OUT" : "Add to Cart"}
    </button>
  )
}