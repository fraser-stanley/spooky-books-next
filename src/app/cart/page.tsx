// app/cart/page.tsx
"use client"

// Layout is provided by cart/layout.tsx
import { useCart } from "@/components/cart-contex"
import { CurrencyPrice } from "@/components/currency-price"
import { CartItem } from "@/components/cart-item"
import Link from "next/link"
import { useState, useEffect } from "react"
import { liveClient } from "@/lib/sanity/client"
import type { SanityProduct } from "@/lib/sanity/types"
import { CartPageSkeleton } from "@/components/skeletons/cart-skeleton"
import { CheckoutLoadingSkeleton, CheckoutProcessingSkeleton, StockValidationOverlay } from "@/components/skeletons/checkout-skeleton"

// Force dynamic rendering for this page
export const dynamic = 'force-dynamic'

export default function CartPage() {
  const { cart, total } = useCart()
  const [discountCode, setDiscountCode] = useState("")
  const [sanityProducts, setSanityProducts] = useState<SanityProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [checkoutLoading, setCheckoutLoading] = useState(false)
  const [checkoutStep, setCheckoutStep] = useState<'idle' | 'validating' | 'creating' | 'redirecting'>('idle')

  // Fetch current product data for stock validation
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        // Use live client with proper token for cart page
        const products = await liveClient.fetch(`
          *[_type == "product"] {
            "id": slug.current,
            "slug": slug.current,
            title,
            author,
            description,
            price,
            stockQuantity,
            reservedQuantity,
            category->{title, "slug": slug.current},
            "heroImage": heroImage.asset->url,
            "secondaryImages": secondaryImages[].asset->url,
            variants[]{
              size,
              stockQuantity,
              reservedQuantity,
              stripePriceId
            }
          }
        `)
        setSanityProducts(products)
      } catch (error) {
        console.error('Failed to fetch products:', error)
      } finally {
        setLoading(false)
      }
    }

    if (cart.length > 0) {
      fetchProducts()
    } else {
      setLoading(false)
    }
  }, [cart.length])

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

      if (!response.ok) {
        console.error('Stock validation failed:', response.status, response.statusText)
        alert('Failed to validate stock. Please try again.')
        setCheckoutLoading(false)
        setCheckoutStep('idle')
        return
      }

      const stockValidation = await response.json()
      
      if (!stockValidation.allInStock) {
        const outOfStock = (stockValidation.stockChecks || [])
          .filter((check: Record<string, unknown>) => !check.inStock)
          .map((check: Record<string, unknown>) => `${check.productTitle}${check.size ? ` (${check.size})` : ''}`)
          .join(', ')
        
        alert(`Some items are no longer available: ${outOfStock}. Please update your cart.`)
        setCheckoutLoading(false)
        setCheckoutStep('idle')
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

      if (!checkoutResponse.ok) {
        console.error('Checkout response failed:', checkoutResponse.status, checkoutResponse.statusText)
        alert('Failed to create checkout session. Please try again.')
        setCheckoutLoading(false)
        setCheckoutStep('idle')
        return
      }

      const { sessionId, error } = await checkoutResponse.json()

      if (error) {
        console.error('Checkout error:', error)
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

  if (loading) {
    return <CartPageSkeleton />
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
      <div className="min-h-screen ">
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
              const sanityProduct = sanityProducts.find(p => p.slug === item.id || p.id === item.id)
              
              return (
                <div key={`${item.id}-${item.size || 'no-size'}`}>
                  <CartItem 
                    item={item} 
                    sanityProduct={sanityProduct}
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