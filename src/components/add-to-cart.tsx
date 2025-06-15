// components/add-to-cart.tsx
"use client"

import { useRouter } from "next/navigation"
import { useCart } from "./cart-contex"
import { toast } from "sonner"
import styles from "./add-to-cart.module.css"

export function AddToCart({
  product,
  variantId,
  quantity = 1,
  available = true,
  selectedSize,
  ...props
}: {
  product: {
    id: string
    title: string
    price: number
    image?: string
  }
  variantId?: string
  quantity?: number
  available?: boolean
  selectedSize?: string
  [key: string]: unknown
}) {
  const { addItem } = useCart()
  const router = useRouter()

  function handleAddToCart(e: React.MouseEvent) {
    e.preventDefault()
    
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
    toast.success(`Added ${product.title} to cart`, {
      action: {
        label: "View Cart",
        onClick: () => router.push("/cart"),
      },
    })
  }

  return (
    <button
      type="button"
      className={
        available 
          ? styles.addToCart
          : `${styles.addToCart} opacity-50 cursor-not-allowed bg-gray-300 text-gray-600 !hover:bg-gray-300 !active:transform-none !active:scale-100`
      }
      onClick={available ? handleAddToCart : undefined}
      disabled={!available}
      {...props}
    >
      {available ? "Add to Cart" : "SOLD OUT"}
    </button>
  )
}