"use client"

import { useCart } from "@/components/cart-contex"
import Link from "next/link"

export default function TestPersistencePage() {
  const { cart, clearCart } = useCart()

  const handleReload = () => {
    window.location.reload()
  }

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl mb-6">🧪 Cart Persistence Test</h1>
        
        <div className="space-y-4 mb-8">
          <div className="p-4 border rounded">
            <h2 className="font-medium mb-2">Current Cart State:</h2>
            {cart.length > 0 ? (
              <ul className="space-y-1">
                {cart.map((item, index) => (
                  <li key={index} className="text-sm">
                    {item.title} - Qty: {item.quantity} {item.size && `(${item.size})`}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-black">Cart is empty</p>
            )}
          </div>
          
          <div className="flex gap-4">
            <Link 
              href="/cart/demo"
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Add Demo Items
            </Link>
            
            <button
              onClick={handleReload}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              🔄 Reload Page (Test Persistence)
            </button>
            
            <button
              onClick={clearCart}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Clear Cart
            </button>
          </div>
        </div>
        
        <div className="p-4 bg-gray-50 rounded">
          <h3 className="font-medium mb-2">Test Instructions:</h3>
          <ol className="text-sm space-y-1">
            <li>1. Click &ldquo;Add Demo Items&rdquo; to populate cart</li>
            <li>2. Click &ldquo;Reload Page&rdquo; to test persistence</li>
            <li>3. Cart should remain intact after reload</li>
            <li>4. Open developer console to see persistence logs</li>
          </ol>
        </div>
        
        <div className="mt-6">
          <Link href="/cart" className="text-blue-600 hover:underline">
            ← Back to Cart
          </Link>
        </div>
      </div>
    </div>
  )
}