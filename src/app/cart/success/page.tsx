"use client"

import { useEffect, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { useCart } from "@/components/cart-contex"
import Link from "next/link"

function SuccessContent() {
  const searchParams = useSearchParams()
  const { clearCart } = useCart()
  const sessionId = searchParams.get('session_id')

  useEffect(() => {
    // Clear the cart after successful payment
    if (sessionId) {
      clearCart()
    }
  }, [sessionId, clearCart])

  return (
    <div className="min-h-screen">
      <div className="flex flex-col items-center justify-center text-center min-h-screen">
        <div className="max-w-md">
          <div className="text-green-600 mb-6">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          
          <h1 className="text-2xl mb-4">Payment Successful!</h1>
          <p className="text-gray-600 mb-8">
            Thank you for your purchase. You will receive an email confirmation shortly.
          </p>
          
          {sessionId && (
            <p className="text-sm text-gray-500 mb-8">
              Order reference: {sessionId.slice(-8).toUpperCase()}
            </p>
          )}
          
          <div className="space-y-4">
            <Link 
              href="/products" 
              className="block px-8 py-2 bg-black text-white hover:bg-gray-800 font-normal text-xs uppercase tracking-wide"
            >
              Continue Shopping
            </Link>
            <Link 
              href="/" 
              className="block text-sm text-gray-600 hover:underline"
            >
              Return to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SuccessContent />
    </Suspense>
  )
}