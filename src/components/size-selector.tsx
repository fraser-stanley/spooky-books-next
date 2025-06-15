"use client"

import type { ProductVariant } from "@/data/products"

interface SizeSelectorProps {
  variants: ProductVariant[]
  selectedSize?: string
  onSizeChange: (size: string, variant: ProductVariant) => void
}

export function SizeSelector({ variants, selectedSize, onSizeChange }: SizeSelectorProps) {
  if (!variants || variants.length === 0) {
    return null
  }

  return (
    <div className="mb-6">
      <h3 className="text-sm font-medium mb-3">Size</h3>
      <div className="grid grid-cols-4 gap-2">
        {variants.map((variant) => {
          const isSelected = selectedSize === variant.size
          const isOutOfStock = variant.stockQuantity <= 0
          
          return (
            <button
              key={variant.size}
              onClick={() => !isOutOfStock && onSizeChange(variant.size, variant)}
              disabled={isOutOfStock}
              className={`
                border px-3 py-2 text-sm font-medium rounded
                ${isSelected 
                  ? 'border-black bg-black text-white' 
                  : 'border-gray-300 hover:border-gray-400'
                }
                ${isOutOfStock 
                  ? 'opacity-50 cursor-not-allowed line-through' 
                  : 'cursor-pointer'
                }
                transition-colors
              `}
            >
              {variant.size.toUpperCase()}
            </button>
          )
        })}
      </div>
      
      {selectedSize && (
        <div className="mt-3 text-sm">
          {(() => {
            const selected = variants.find(v => v.size === selectedSize)
            if (!selected) return null
            
            if (selected.stockQuantity <= 0) {
              return <span>Size {selectedSize.toUpperCase()} (SOLD OUT)</span>
            }
            
            if (selected.stockQuantity <= 5) {
              return <span>Size {selectedSize.toUpperCase()} (ONLY {selected.stockQuantity} LEFT)</span>
            }
            
            return <span>Size {selectedSize.toUpperCase()}</span>
          })()}
        </div>
      )}
    </div>
  )
}