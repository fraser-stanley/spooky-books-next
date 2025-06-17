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
          <span className="text-lg mb-4 uppercase">Your cart is empty</span>
          <p className="text-sm text-gray-600 mb-8">Looks like you haven&apos;t added anything to your cart yet.</p>
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
                  PROCEED TO CHECKOUT
                </button>
              </div>
            )}

            {/* Continue Shopping */}
            <div className="flex justify-center mt-6">
              <Link
                href="/products"
                className="text-gray-600 hover:underline uppercase"
              >
                Return to store
              </Link>
            </div>
          </div>
        </main>
        
        {/* Stock validation overlay */}
        {checkoutStep === 'validating' && <StockValidationOverlay />}
      </div>
  )
}