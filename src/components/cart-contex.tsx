"use client"

import React, { createContext, useContext, useState } from "react"

type CartItem = {
  id: string
  title: string
  price: number
  quantity: number
  image?: string
  size?: string // For apparel products
}

type CartContextType = {
  cart: CartItem[]
  addItem: (item: CartItem) => void
  removeItem: (id: string, size?: string) => void
  clearCart: () => void
  total: number
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([])

  const addItem = (item: CartItem) => {
    setCart(prev => {
      // For apparel, match both ID and size; for publications, match ID only
      const existing = prev.find(i => 
        i.id === item.id && i.size === item.size
      )
      if (existing) {
        return prev.map(i =>
          (i.id === item.id && i.size === item.size) 
            ? { ...i, quantity: i.quantity + item.quantity } 
            : i
        )
      }
      return [...prev, item]
    })
  }

  const removeItem = (id: string, size?: string) => {
    setCart(prev => prev.filter(i => !(i.id === id && i.size === size)))
  }

  const clearCart = () => setCart([])

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)

  return (
    <CartContext.Provider value={{ cart, addItem, removeItem, clearCart, total }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) throw new Error("useCart must be used within a CartProvider")
  return context
}
