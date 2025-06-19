"use client"

import { useEffect, Suspense, useState } from "react"
import { useSearchParams } from "next/navigation"
// TEMPORARILY DISABLED: Cart context to test if this is causing issues
// import { useCart } from "@/components/cart-contex"
import Link from "next/link"
import styles from "@/components/add-to-cart.module.css"

function SuccessContent() {
  const searchParams = useSearchParams()
  const sessionId = searchParams.get('session_id')
  const [_isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
    console.log('🎉 Checkout success page mounted', { sessionId })
  }, [sessionId])

  // TEMPORARILY DISABLED: Cart clearing to test if this is causing the frozen behavior
  // useEffect(() => {
  //   // Clear the cart after successful payment with a slight delay
  //   if (sessionId && !isCartCleared && isMounted) {
  //     const timer = setTimeout(() => {
  //       try {
  //         clearCart()
  //         setIsCartCleared(true)
  //         console.log('✅ Cart cleared after successful payment')
  //       } catch (error) {
  //         console.error('❌ Error clearing cart:', error)
  //       }
  //     }, 500) // Small delay to ensure proper hydration
  //     
  //     return () => clearTimeout(timer)
  //   }
  // }, [sessionId, clearCart, isCartCleared, isMounted])

  return (
    <div className="flex flex-col items-center justify-center text-center py-16">
      <div className="max-w-md">
        <div className="text-green-600 mb-6">
          <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        
        <h1 className="text-2xl mb-4">🚀 DEPLOYMENT TEST - Payment Successful!</h1>
        <p className="text-black mb-8">
          Thank you for your purchase. You will receive an email confirmation shortly.
        </p>
        
        {sessionId && (
          <p className="text-sm text-black mb-8">
            Order reference: {sessionId.slice(-8).toUpperCase()}
          </p>
        )}
        
        <div className="space-y-4">
          <Link 
            href="/products" 
            className={`${styles.addToCart} inline-block text-center font-normal text-xs uppercase tracking-wide`}
          >
            CONTINUE SHOPPING
          </Link>
          <Link 
            href="/" 
            className="block text-sm text-black hover:underline transition-colors"
          >
            Return to Home
          </Link>
        </div>
      </div>
    </div>
  )
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={
      <div className="flex flex-col items-center justify-center text-center py-16">
        <div className="text-gray-600">Processing your order...</div>
      </div>
    }>
      <SuccessContent />
    </Suspense>
  )
}

// Updated checkout success page with proper navigation and styling