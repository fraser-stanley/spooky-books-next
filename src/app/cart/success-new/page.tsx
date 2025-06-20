"use client"

import { useEffect, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { useCart } from "@/components/cart-contex"
import Link from "next/link"
import styles from "@/components/add-to-cart.module.css"

function SuccessContent() {
  const searchParams = useSearchParams()
  const { clearCart } = useCart()
  const sessionId = searchParams.get('session_id')

  useEffect(() => {
    // Clear cart after successful payment
    if (sessionId) {
      setTimeout(() => {
        clearCart()
      }, 1000)
    }
  }, [sessionId, clearCart])

  return (
    <div className="flex flex-col items-center justify-center text-center py-16">
      <div className="max-w-md">
        <div className="text-green-600 mb-6">
          <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        
        <h1 className="text-2xl mb-4">✨ Payment Successful!</h1>
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

export default function NewCheckoutSuccessPage() {
  return (
    <Suspense fallback={
      <div className="flex flex-col items-center justify-center text-center py-16">
        <div className="text-black">Processing your order...</div>
      </div>
    }>
      <SuccessContent />
    </Suspense>
  )
}