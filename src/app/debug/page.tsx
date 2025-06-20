import { getHomepage, getProducts } from "@/lib/sanity/queries"
import { getAvailableStock, getStockStatusText } from "@/lib/utils/stock-validation"

export const dynamic = 'force-dynamic'

export default async function DebugPage() {
  try {
    const [homepage, products] = await Promise.all([
      getHomepage(),
      getProducts()
    ])
    
    // Calculate stock information for each product
    const productsWithStock = products.map(product => {
      const baseStock = getAvailableStock(product)
      const stockStatus = getStockStatusText(product)
      
      let variantStockInfo = null
      if (product.variants && product.variants.length > 0) {
        variantStockInfo = product.variants.map(variant => ({
          size: variant.size,
          stockQuantity: variant.stockQuantity,
          reservedQuantity: variant.reservedQuantity || 0,
          availableStock: getAvailableStock(product, variant.size),
          stockStatus: getStockStatusText(product, variant.size)
        }))
      }
      
      return {
        title: product.title,
        slug: product.slug,
        category: product.category.title,
        baseStockQuantity: product.stockQuantity,
        baseReservedQuantity: product.reservedQuantity || 0,
        availableStock: baseStock,
        stockStatus,
        hasSizes: product.hasSizes,
        variantStockInfo
      }
    })
    
    return (
      <div className="p-8 max-w-6xl">
        <h1 className="text-3xl mb-6">Debug: Product Stock Information</h1>
        
        <div className="mb-8">
          <h2 className="text-2xl mb-4">Stock Summary</h2>
          <div className="grid gap-4">
            {productsWithStock.map(product => (
              <div key={product.slug} className="bg-white border rounded-lg p-4">
                <h3 className="text-xl font-semibold mb-2">{product.title}</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <strong>Category:</strong> {product.category}
                  </div>
                  <div>
                    <strong>Has Sizes:</strong> {product.hasSizes ? 'Yes' : 'No'}
                  </div>
                  <div>
                    <strong>Base Stock:</strong> {product.baseStockQuantity}
                  </div>
                  <div>
                    <strong>Reserved:</strong> {product.baseReservedQuantity}
                  </div>
                  <div>
                    <strong>Available:</strong> {product.availableStock}
                  </div>
                  <div>
                    <strong>Status:</strong> {product.stockStatus || 'IN STOCK'}
                  </div>
                </div>
                
                {product.variantStockInfo && product.variantStockInfo.length > 0 && (
                  <div className="mt-4">
                    <h4 className="font-semibold mb-2">Size Variants:</h4>
                    <div className="grid gap-2">
                      {product.variantStockInfo.map(variant => (
                        <div key={variant.size} className="bg-gray-50 p-2 rounded text-sm">
                          <span className="font-medium">Size {variant.size}:</span>
                          <span className="ml-2">Stock: {variant.stockQuantity}</span>
                          <span className="ml-2">Reserved: {variant.reservedQuantity}</span>
                          <span className="ml-2">Available: {variant.availableStock}</span>
                          <span className="ml-2">Status: {variant.stockStatus || 'IN STOCK'}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
        
        <details className="mb-8">
          <summary className="text-xl cursor-pointer mb-4">Raw Product Data</summary>
          <pre className="bg-gray-100 p-4 rounded overflow-auto text-xs">
            {JSON.stringify(products, null, 2)}
          </pre>
        </details>
        
        <details>
          <summary className="text-xl cursor-pointer mb-4">Homepage Data</summary>
          <pre className="bg-gray-100 p-4 rounded overflow-auto text-xs">
            {JSON.stringify(homepage, null, 2)}
          </pre>
        </details>
      </div>
    )
  } catch (error) {
    return (
      <div className="p-8">
        <h1 className="text-2xl mb-4">Debug: Error</h1>
        <pre className="bg-red-100 p-4 rounded">
          {error instanceof Error ? error.message : String(error)}
        </pre>
      </div>
    )
  }
}