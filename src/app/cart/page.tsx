// app/cart/page.tsx
"use client"

// Layout is provided by cart/layout.tsx
import { useCart } from "@/components/cart-contex"
import { CurrencyPrice } from "@/components/currency-price"
import Image from "next/image"
import Link from "next/link"
import { useState } from "react"

export default function CartPage() {
  const { cart, removeItem, total } = useCart()
  const [discountCode, setDiscountCode] = useState("")

  const handleCheckout = async () => {
    try {
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ items: cart }),
      })

      const { sessionId, error } = await response.json()

      if (error) {
        console.error('Checkout error:', error)
        alert('Failed to create checkout session. Please try again.')
        return
      }

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
    }
  }

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0)

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
            {cart.map((item, index) => (
              <div key={item.id}>
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
                    <div className="text-sm text-gray-600 mb-1"><CurrencyPrice price={item.price} /></div>
                    <div className="text-sm text-gray-600 mb-4">Quantity: {item.quantity}</div>
                    <button
                      onClick={() => removeItem(item.id, item.size)}
                      className="text-xs px-4 py-1 border border-gray-300 hover:bg-gray-100 font-normal uppercase tracking-wide"
                    >
                      REMOVE
                    </button>
                  </div>
                  <div className="text-right">
                    <div className="text-sm"><CurrencyPrice price={item.price * item.quantity} /></div>
                  </div>
                </div>
                {index < cart.length - 1 && <div className="border-b border-gray-200 mt-8"></div>}
              </div>
            ))}
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
            <div className="flex justify-end mt-8">
              <button
                onClick={handleCheckout}
                className="px-8 py-2 bg-black text-white hover:bg-gray-800 font-normal text-xs uppercase tracking-wide"
              >
                PROCEED TO CHECKOUT
              </button>
            </div>

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
      </div>
  )
}