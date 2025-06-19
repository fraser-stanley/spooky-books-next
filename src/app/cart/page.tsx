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
import { useLocaleCurrency } from "@/lib/hooks/use-locale-currency"
import type { Stripe } from "@stripe/stripe-js"

// Force dynamic rendering for this page
export const dynamic = 'force-dynamic'

export default function CartPage() {
  const { cart, total } = useCart()
  const [sanityProducts, setSanityProducts] = useState<SanityProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [checkoutLoading, setCheckoutLoading] = useState(false)
  const [checkoutError, setCheckoutError] = useState<string | null>(null)
  const [stripePromise, setStripePromise] = useState<Promise<Stripe | null> | null>(null)
  const { locale, currency } = useLocaleCurrency()

  // Preload Stripe.js on cart page mount for faster checkout
  useEffect(() => {
    console.log('🚀 Preloading Stripe.js for faster checkout')
    const loadStripe = async () => {
      try {
        const { loadStripe } = await import('@stripe/stripe-js')
        const stripe = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)
        setStripePromise(stripe)
        console.log('✅ Stripe.js preloaded successfully')
      } catch (error) {
        console.error('⚠️ Failed to preload Stripe.js:', error)
        // Fallback: set promise to null, will load on demand during checkout
        setStripePromise(null)
      }
    }

    if (cart.length > 0) {
      loadStripe()
    }
  }, [cart.length])

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
      setCheckoutError(null)

      console.log('🚀 Starting optimized checkout flow')

      // Use new optimized checkout endpoint with product data from cart page
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items: cart,
          productData: sanityProducts, // Reuse fetched data
          locale,
          currency
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        // Handle different error types
        if (result.type === 'STOCK_ERROR') {
          const errorDetails = result.details || []
          const errorMessage = errorDetails.length > 0 
            ? `Some items are no longer available:\n${errorDetails.join('\n')}`
            : 'Some items in your cart are no longer available.'
          setCheckoutError(errorMessage)
        } else if (result.type === 'RESERVATION_ERROR') {
          setCheckoutError('Sorry, someone else just grabbed one of these items! Please refresh the page and try again.')
        } else if (result.type === 'RATE_LIMIT_ERROR') {
          setCheckoutError(result.message || 'Too many checkout attempts. Please wait a moment and try again.')
        } else {
          setCheckoutError(result.error || 'Failed to process checkout. Please try again.')
        }
        setCheckoutLoading(false)
        return
      }

      const { sessionId } = result
      console.log('✅ Checkout session created:', sessionId)

      // Use preloaded Stripe.js or fallback to on-demand loading
      let stripe
      if (stripePromise) {
        console.log('🚀 Using preloaded Stripe.js')
        stripe = await stripePromise
      } else {
        console.log('⚠️ Stripe.js not preloaded, loading on demand')
        const { loadStripe } = await import('@stripe/stripe-js')
        stripe = await loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)
      }
      
      if (stripe) {
        await stripe.redirectToCheckout({ sessionId })
      } else {
        throw new Error('Failed to load Stripe')
      }
    } catch (error) {
      console.error('💥 Checkout error:', error)
      setCheckoutError('Failed to process checkout. Please try again.')
      setCheckoutLoading(false)
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
          <span className="text-lg mb-4 uppercase">Your cart is empty</span>
          <p className="text-sm text-black mb-8">Looks like you haven&apos;t added anything to your cart yet.</p>
          <Link 
            href="/products" 
            className="px-8 py-2 bg-black text-white hover:bg-gray-800 font-normal text-xs uppercase rounded"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    )
  }

  return (
      <div className="min-h-screen ">
        <main className="max-w-4xl mx-auto sm:p-6">
          {/* Cart Header */}
          <div className="flex items-center justify-between mb-8">
            <span className="uppercase">Your Cart</span>
            <span className="uppercase">Total {totalItems} items</span>
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


          {/* Order Summary */}
          <div className="mt-12">
            <div className="border-b border-gray-200 mb-6"></div>
            <div className="space-y-4">
              <h2 className="text-sm uppercase">Order Summary</h2>

              <div className="flex justify-between items-center">
                <span className="text-sm text-black">Subtotal ({totalItems} items)</span>
                <span className="text-sm"><CurrencyPrice price={total} /></span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm text-black">Shipping</span>
                <span className="text-sm">Free</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm text-black">Tax</span>
                <span className="text-sm">Calculated at checkout</span>
              </div>

              <div className="border-b border-gray-200 my-4"></div>

              <div className="flex justify-between items-center">
                <span className="text-sm">Total</span>
                <span className="text-sm"><CurrencyPrice price={total} /></span>
              </div>
            </div>

            {/* Error Message */}
            {checkoutError && (
              <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-md">
                <div className="text-sm text-red-800 whitespace-pre-line">
                  {checkoutError}
                </div>
                <button
                  onClick={() => setCheckoutError(null)}
                  className="mt-2 text-xs text-red-600 hover:text-red-800 underline"
                >
                  Dismiss
                </button>
              </div>
            )}

            {/* Checkout Button */}
            <div className="flex justify-end mt-8">
              <button
                onClick={handleCheckout}
                disabled={checkoutLoading}
                className="
                  w-full sm:w-auto
                  px-5 py-2
                  md:text-sm font-medium
                  text-white bg-black
                  rounded-md
                  transition-all duration-[581.71ms]
                  [transition-timing-function:linear(
                    0_0%,0.005927_1%,0.022466_2%,0.047872_3%,0.080554_4%,0.119068_5%,0.162116_6%,
                    0.208536_7.000000000000001%,0.2573_8%,0.3075_9%,0.358346_10%,0.409157_11%,
                    0.45935_12%,0.508438_13%,0.556014_14.000000000000002%,0.601751_15%,0.645389_16%,
                    0.686733_17%,0.72564_18%,0.762019_19%,0.795818_20%,0.827026_21%,0.855662_22%,
                    0.881772_23%,0.905423_24%,0.926704_25%,0.945714_26%,0.962568_27%,0.977386_28.000000000000004%,
                    0.990295_28.999999999999996%,1.001426_30%,1.010911_31%,1.018881_32%,1.025465_33%,
                    1.030792_34%,1.034982_35%,1.038155_36%,1.040423_37%,1.041892_38%,1.042662_39%,
                    1.042827_40%,1.042473_41%,1.04168_42%,1.040522_43%,1.039065_44%,1.037371_45%,
                    1.035493_46%,1.03348_47%,1.031376_48%,1.029217_49%,1.027037_50%,1.024864_51%,
                    1.022722_52%,1.020631_53%,1.018608_54%,1.016667_55.00000000000001%,1.014817_56.00000000000001%,
                    1.013067_56.99999999999999%,1.011422_57.99999999999999%,1.009887_59%,1.008462_60%,
                    1.007148_61%,1.005944_62%,1.004847_63%,1.003855_64%,1.002964_65%,1.002169_66%,
                    1.001466_67%,1.000848_68%,1.000311_69%,0.999849_70%,0.999457_71%,0.999128_72%,
                    0.998858_73%,0.99864_74%,0.99847_75%,0.998342_76%,0.998253_77%,0.998196_78%,
                    0.998169_79%,0.998167_80%,0.998186_81%,0.998224_82%,0.998276_83%,0.998341_84%,
                    0.998415_85%,0.998497_86%,0.998584_87%,0.998675_88%,0.998768_89%,0.998861_90%,
                    0.998954_91%,0.999045_92%,0.999134_93%,0.99922_94%,0.999303_95%,0.999381_96%,
                    0.999455_97%,0.999525_98%,0.999589_99%,0.99965_100%
                  )]
                  hover:bg-[rgb(32,32,32)]
                  active:scale-95
                  disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-300 disabled:text-gray-500
                "
              >
                {checkoutLoading ? 'PROCESSING...' : 'PROCEED TO CHECKOUT'}
              </button>
            </div>

            {/* Continue Shopping */}
            <div className="flex justify-center mt-6">
              <Link
                href="/products"
                className="text-black hover:underline uppercase"
              >
                Return to store
              </Link>
            </div>
          </div>
        </main>
      </div>
  )
}