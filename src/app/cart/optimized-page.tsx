"use client"

import { useCart } from "@/components/cart-contex"
import { CurrencyPrice } from "@/components/currency-price"
import { CartItemEnhanced } from "@/components/cart-item-enhanced"
import Link from "next/link"
import { useState } from "react"
import { useOptimizedStock } from "@/lib/hooks/use-optimized-stock"
import { CartPageSkeleton } from "@/components/skeletons/cart-skeleton"
import { CheckoutLoadingSkeleton, CheckoutProcessingSkeleton, StockValidationOverlay } from "@/components/skeletons/checkout-skeleton"

export default function OptimizedCartPage() {
  const { cart, total } = useCart()
  const [discountCode, setDiscountCode] = useState("")
  const [checkoutLoading, setCheckoutLoading] = useState(false)
  const [checkoutStep, setCheckoutStep] = useState<'idle' | 'validating' | 'creating' | 'redirecting'>('idle')
  
  const { products: sanityProducts, loading, error, refetch } = useOptimizedStock()

  const handleCheckout = async () => {
    try {
      setCheckoutLoading(true)
      setCheckoutStep('validating')

      // Validate stock before checkout
      const response = await fetch('/api/stock-status', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items: cart.map(item => ({
            productId: item.id,
            quantity: item.quantity,
            size: item.size
          }))
        }),
      })

      const stockValidation = await response.json()
      
      if (!stockValidation.allInStock) {
        const outOfStock = stockValidation.stockChecks
          .filter((check: Record<string, unknown>) => !check.inStock)
          .map((check: Record<string, unknown>) => `${check.productTitle}${check.size ? ` (${check.size})` : ''}`)
          .join(', ')
        
        alert(`Some items are no longer available: ${outOfStock}. Please update your cart.`)
        setCheckoutLoading(false)
        setCheckoutStep('idle')
        
        // Refresh stock data
        await refetch()
        return
      }

      setCheckoutStep('creating')

      const checkoutResponse = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ items: cart }),
      })

      const { sessionId, error: checkoutError } = await checkoutResponse.json()

      if (checkoutError) {
        console.error('Checkout error:', checkoutError)
        alert('Failed to create checkout session. Please try again.')
        setCheckoutLoading(false)
        setCheckoutStep('idle')
        return
      }

      setCheckoutStep('redirecting')

      // Redirect to Stripe Checkout
      const stripe = await import('@stripe/stripe-js').then(mod => 
        mod.loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)
      )
      
      if (stripe) {
        await stripe.redirectToCheckout({ sessionId })
      }
    } catch (error) {
      console.error('Checkout error:', error)
      alert('Failed to process checkout. Please try again.')
      setCheckoutLoading(false)
      setCheckoutStep('idle')
    }
  }

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0)

  // Show skeleton while loading
  if (loading && cart.length > 0) {
    return <CartPageSkeleton />
  }

  // Show error state with retry option
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-lg mb-2">Failed to load cart data</div>
          <div className="text-sm text-gray-600 mb-4">{error}</div>
          <button
            onClick={refetch}
            className="px-4 py-2 bg-black text-white hover:bg-gray-800 text-sm"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  if (cart.length === 0) {
    return (
      <div className="min-h-screen">
        <div className="flex flex-col items-center justify-center text-center min-h-screen">
          <h1 className="text-lg mb-4">Your cart is empty</h1>
          <p className="text-sm text-gray-600 mb-8">Looks like you haven&apos;t added anything to your cart yet.</p>
          <Link 
            href="/products" 
            className="px-8 py-2 bg-black text-white hover:bg-gray-800 font-normal text-xs uppercase tracking-wide"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <main className="max-w-4xl mx-auto p-6">
        {/* Cart Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-lg">Your Cart</h1>
          <span className="text-sm text-gray-600">Total {totalItems} items</span>
        </div>

        {/* Cart Items */}
        <div className="space-y-8">
          {cart.map((item, index) => {
            // Find corresponding Sanity product for stock validation
            const sanityProduct = sanityProducts.find(p => p.slug === item.id)
            
            return (
              <div key={`${item.id}-${item.size || 'no-size'}`}>
                <CartItemEnhanced 
                  item={item} 
                  sanityProduct={sanityProduct}
                  isLoading={loading && !sanityProduct}
                />
                {index < cart.length - 1 && <div className="border-b border-gray-200 mt-8"></div>}
              </div>
            )
          })}
        </div>

        {/* Discount Section */}
        <div className="mt-12 mb-8">
          <div className="border-b border-gray-200 mb-8"></div>
          <div className="flex gap-4 items-center">
            <input
              type="text"
              placeholder="DISCOUNT CODE"
              value={discountCode}
              onChange={(e) => setDiscountCode(e.target.value)}
              className="max-w-xs bg-transparent border-0 border-b border-gray-300 px-0 py-2 text-sm placeholder-gray-400 focus:outline-none focus:border-gray-600"
            />
            <button className="text-xs px-4 py-1 border border-gray-300 hover:bg-gray-100 font-normal uppercase tracking-wide">
              APPLY DISCOUNT
            </button>
          </div>
        </div>

        {/* Order Summary */}
        <div className="mt-12">
          <div className="border-b border-gray-200 mb-6"></div>
          <div className="space-y-4">
            <h2 className="text-sm">Order Summary</h2>

            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Subtotal ({totalItems} items)</span>
              <span className="text-sm"><CurrencyPrice price={total} /></span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Shipping</span>
              <span className="text-sm">Free</span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Tax</span>
              <span className="text-sm">Calculated at checkout</span>
            </div>

            <div className="border-b border-gray-200 my-4"></div>

            <div className="flex justify-between items-center">
              <span className="text-sm">Total</span>
              <span className="text-sm"><CurrencyPrice price={total} /></span>
            </div>
          </div>

          {/* Checkout Button */}
          {checkoutLoading ? (
            checkoutStep === 'validating' ? <CheckoutLoadingSkeleton /> :
            checkoutStep === 'creating' ? <CheckoutProcessingSkeleton /> :
            <CheckoutProcessingSkeleton />
          ) : (
            <div className="flex justify-end mt-8">
              <button
                onClick={handleCheckout}
                disabled={checkoutLoading}
                className="px-8 py-2 bg-black text-white hover:bg-gray-800 font-normal text-xs uppercase tracking-wide disabled:opacity-50 disabled:cursor-not-allowed"
              >
                PROCEED TO CHECKOUT
              </button>
            </div>
          )}

          {/* Continue Shopping */}
          <div className="flex justify-center mt-6">
            <Link
              href="/products"
              className="text-sm text-gray-600 hover:underline"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </main>
      
      {/* Stock validation overlay */}
      {checkoutStep === 'validating' && <StockValidationOverlay />}
    </div>
  )
}