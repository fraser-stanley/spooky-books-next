"use client"

import React, { createContext, useContext, useState, useEffect } from "react"

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
  getCartItemQuantity: (id: string, size?: string) => number
  updateItemQuantity: (id: string, quantity: number, size?: string) => void
}

interface StoredCart {
  items: CartItem[]
  timestamp: number
  version: number
}

const CART_STORAGE_KEY = 'spooky-books-cart'
const CART_VERSION = 1
const CART_EXPIRY_DAYS = 30

// localStorage utilities with error handling
const storage = {
  get: (): StoredCart | null => {
    if (typeof window === 'undefined') return null
    
    try {
      const stored = localStorage.getItem(CART_STORAGE_KEY)
      if (!stored) return null
      
      const data: StoredCart = JSON.parse(stored)
      
      // Check version compatibility
      if (data.version !== CART_VERSION) {
        console.log('📦 Cart version mismatch, clearing stored cart')
        storage.clear()
        return null
      }
      
      // Check expiration
      const daysSinceStored = (Date.now() - data.timestamp) / (1000 * 60 * 60 * 24)
      if (daysSinceStored > CART_EXPIRY_DAYS) {
        console.log('📦 Stored cart expired, clearing')
        storage.clear()
        return null
      }
      
      return data
    } catch (error) {
      console.error('📦 Failed to read cart from localStorage:', error)
      storage.clear()
      return null
    }
  },
  
  set: (items: CartItem[]): void => {
    if (typeof window === 'undefined') return
    
    try {
      const data: StoredCart = {
        items,
        timestamp: Date.now(),
        version: CART_VERSION
      }
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(data))
    } catch (error) {
      console.error('📦 Failed to save cart to localStorage:', error)
    }
  },
  
  clear: (): void => {
    if (typeof window === 'undefined') return
    
    try {
      localStorage.removeItem(CART_STORAGE_KEY)
    } catch (error) {
      console.error('📦 Failed to clear cart from localStorage:', error)
    }
  }
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([])
  const [isHydrated, setIsHydrated] = useState(false)

  // Hydrate cart from localStorage on mount
  useEffect(() => {
    const storedCart = storage.get()
    if (storedCart?.items && storedCart.items.length > 0) {
      console.log(`📦 Restored ${storedCart.items.length} items from stored cart`)
      setCart(storedCart.items)
    }
    setIsHydrated(true)
  }, [])

  // Auto-save cart to localStorage whenever it changes (but only after hydration)
  useEffect(() => {
    if (isHydrated) {
      storage.set(cart)
      if (cart.length > 0) {
        console.log(`📦 Saved ${cart.length} items to localStorage`)
      }
    }
  }, [cart, isHydrated])

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

  const clearCart = () => {
    setCart([])
    storage.clear()
    console.log('📦 Cart cleared from memory and localStorage')
  }

  const getCartItemQuantity = (id: string, size?: string): number => {
    const item = cart.find(i => i.id === id && i.size === size)
    return item?.quantity || 0
  }

  const updateItemQuantity = (id: string, quantity: number, size?: string) => {
    if (quantity <= 0) {
      removeItem(id, size)
      return
    }
    
    setCart(prev => prev.map(i =>
      (i.id === id && i.size === size) 
        ? { ...i, quantity } 
        : i
    ))
  }

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)

  return (
    <CartContext.Provider value={{ 
      cart, 
      addItem, 
      removeItem, 
      clearCart, 
      total, 
      getCartItemQuantity, 
      updateItemQuantity 
    }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) throw new Error("useCart must be used within a CartProvider")
  return context
}
