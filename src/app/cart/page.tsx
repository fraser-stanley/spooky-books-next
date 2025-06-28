// app/cart/page.tsx
"use client";

// Layout is provided by cart/layout.tsx
import { useCart } from "@/components/cart-contex";
import { CurrencyPrice } from "@/components/currency-price";
import { CartItem } from "@/components/cart-item";
import Link from "next/link";
import { useState, useEffect } from "react";
import { liveClient } from "@/lib/sanity/client";
import type { SanityProduct } from "@/lib/sanity/types";
import { CartPageSkeleton } from "@/components/skeletons/cart-skeleton";
import { useLocaleCurrency } from "@/lib/hooks/use-locale-currency";
import type { Stripe } from "@stripe/stripe-js";

// Force dynamic rendering for this page
export const dynamic = "force-dynamic";

export default function CartPage() {
  const { cart, total } = useCart();
  const [sanityProducts, setSanityProducts] = useState<SanityProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [stripePromise, setStripePromise] =
    useState<Promise<Stripe | null> | null>(null);
  const { locale, currency } = useLocaleCurrency();

  // Preload Stripe.js on cart page mount for faster checkout
  useEffect(() => {
    const loadStripe = async () => {
      try {
        const { loadStripe } = await import("@stripe/stripe-js");
        const stripe = loadStripe(
          process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!,
        );
        setStripePromise(stripe);
      } catch (error) {
        console.error("Failed to preload Stripe.js:", error);
        // Fallback: set promise to null, will load on demand during checkout
        setStripePromise(null);
      }
    };

    if (cart.length > 0) {
      loadStripe();
    }
  }, [cart.length]);

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
        `);
        setSanityProducts(products);
      } catch (error) {
        console.error("Failed to fetch products:", error);
      } finally {
        setLoading(false);
      }
    };

    if (cart.length > 0) {
      fetchProducts();
    } else {
      setLoading(false);
    }
  }, [cart.length]);

  const handleCheckout = async () => {
    try {
      setCheckoutLoading(true);
      setCheckoutError(null);

      // Use new optimized checkout endpoint with product data from cart page
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          items: cart,
          productData: sanityProducts, // Reuse fetched data
          locale,
          currency,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        // Handle different error types
        if (result.type === "STOCK_ERROR") {
          const errorDetails = result.details || [];
          const errorMessage =
            errorDetails.length > 0
              ? `Some items are no longer available:\n${errorDetails.join("\n")}`
              : "Some items in your cart are no longer available.";
          setCheckoutError(errorMessage);
        } else if (result.type === "RESERVATION_ERROR") {
          setCheckoutError(
            "Sorry, someone else just grabbed one of these items! Please refresh the page and try again.",
          );
        } else if (result.type === "RATE_LIMIT_ERROR") {
          setCheckoutError(
            result.message ||
              "Too many checkout attempts. Please wait a moment and try again.",
          );
        } else {
          setCheckoutError(
            result.error || "Failed to process checkout. Please try again.",
          );
        }
        setCheckoutLoading(false);
        return;
      }

      const { sessionId } = result;

      // Use preloaded Stripe.js or fallback to on-demand loading
      let stripe;
      if (stripePromise) {
        stripe = await stripePromise;
      } else {
        const { loadStripe } = await import("@stripe/stripe-js");
        stripe = await loadStripe(
          process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!,
        );
      }

      if (stripe) {
        await stripe.redirectToCheckout({ sessionId });
      } else {
        throw new Error("Failed to load Stripe");
      }
    } catch (error) {
      console.error("Checkout error:", error);
      setCheckoutError("Failed to process checkout. Please try again.");
      setCheckoutLoading(false);
    }
  };

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  if (loading) {
    return <CartPageSkeleton />;
  }

  if (cart.length === 0) {
    return (
      <div className="min-h-screen">
        <div className="flex flex-col items-center justify-center text-center min-h-screen">
          <span className="text-lg mb-4 uppercase">Your cart is empty</span>
          <p className="text-sm text-black mb-8">
            Looks like you haven&apos;t added anything to your cart yet.
          </p>
          <Link
            href="/products"
            className="px-8 py-2 bg-black text-white hover:bg-gray-800 font-normal text-xs uppercase rounded"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    );
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
            const sanityProduct = sanityProducts.find(
              (p) => p.slug === item.id || p.id === item.id,
            );

            return (
              <div key={`${item.id}-${item.size || "no-size"}`}>
                <CartItem item={item} sanityProduct={sanityProduct} />
                {index < cart.length - 1 && (
                  <div className="border-b border-gray-200 mt-8"></div>
                )}
              </div>
            );
          })}
        </div>

        {/* Order Summary */}
        <div className="mt-12">
          <div className="border-b border-gray-200 mb-6"></div>
          <div className="space-y-4">
            <h2 className="text-sm uppercase">Order Summary</h2>

            <div className="flex justify-between items-center">
              <span className="text-sm text-black">
                Subtotal ({totalItems} items)
              </span>
              <span className="text-sm">
                <CurrencyPrice price={total} />
              </span>
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
              <span className="text-sm">
                <CurrencyPrice price={total} />
              </span>
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
                  relative overflow-hidden
                  w-full sm:w-auto
                  px-5 py-2
                  text-white bg-black
                  rounded-md
                  transition-all duration-300 ease-in-out
                  hover:bg-[rgb(32,32,32)]
                  active:scale-95
                  disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-300 disabled:text-gray-500
                "
            >
              <span 
                className={`
                  inline-block transition-all duration-300 ease-in-out
                  ${checkoutLoading ? 'opacity-0 transform translate-y-2' : 'opacity-100 transform translate-y-0'}
                `}
              >
                PROCEED TO CHECKOUT
              </span>
              <span 
                className={`
                  absolute inset-0 flex items-center justify-center
                  transition-all duration-300 ease-in-out
                  ${checkoutLoading ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform -translate-y-2'}
                `}
              >
                PROCESSING...
              </span>
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
  );
}
