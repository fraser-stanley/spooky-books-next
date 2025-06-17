interface SkeletonProps {
  className?: string
}

function Skeleton({ className = "" }: SkeletonProps) {
  return (
    <div className={`animate-pulse bg-gray-200 rounded ${className}`} />
  )
}

export function CartItemSkeleton() {
  return (
    <div className="flex flex-col sm:flex-row sm:items-start gap-4 sm:gap-6 w-full">
      {/* Image skeleton */}
      <div className="w-full sm:w-24 sm:h-32">
        <Skeleton className="w-full h-auto sm:h-32 sm:w-24 rounded" />
      </div>
      
      {/* Content skeleton */}
      <div className="flex-1 min-w-0">
        {/* Title */}
        <div className="mb-1">
          <Skeleton className="h-4 w-3/4" />
        </div>
        
        {/* Price */}
        <div className="mb-2">
          <Skeleton className="h-4 w-16" />
        </div>

        {/* Quantity & Remove */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mb-2">
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-8" />
            <Skeleton className="h-8 w-24 rounded" />
          </div>
          
          <Skeleton className="h-7 w-16 rounded" />
        </div>
      </div>
      
      {/* Subtotal skeleton */}
      <div className="text-sm text-right sm:text-left sm:ml-auto mt-2 sm:mt-0 whitespace-nowrap">
        <Skeleton className="h-4 w-16" />
      </div>
    </div>
  )
}

export function OrderSummarySkeleton() {
  return (
    <div className="space-y-4">
      {/* Header */}
      <Skeleton className="h-4 w-24" />

      {/* Summary lines */}
      {[1, 2, 3].map((i) => (
        <div key={i} className="flex justify-between items-center">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-3 w-12" />
        </div>
      ))}

      {/* Divider */}
      <div className="border-b border-gray-200 my-4" />

      {/* Total */}
      <div className="flex justify-between items-center">
        <Skeleton className="h-4 w-8" />
        <Skeleton className="h-4 w-16" />
      </div>
    </div>
  )
}

export function CheckoutButtonSkeleton() {
  return (
    <div className="flex justify-end mt-8">
      <Skeleton className="h-9 w-48" />
    </div>
  )
}

export function CartHeaderSkeleton() {
  return (
    <div className="flex items-center justify-between mb-8">
      <Skeleton className="h-6 w-20" />
      <Skeleton className="h-4 w-16" />
    </div>
  )
}

export function CartPageSkeleton() {
  return (
    <div className="min-h-screen">
      <main className="max-w-4xl mx-auto p-6">
        {/* Header skeleton */}
        <CartHeaderSkeleton />

        {/* Cart items skeleton */}
        <div className="space-y-8">
          {[1, 2].map((i) => (
            <div key={i}>
              <CartItemSkeleton />
              {i < 2 && <div className="border-b border-gray-200 mt-8" />}
            </div>
          ))}
        </div>


        {/* Order summary skeleton */}
        <div className="mt-12">
          <div className="border-b border-gray-200 mb-6" />
          <OrderSummarySkeleton />
          <CheckoutButtonSkeleton />
          
          {/* Continue shopping skeleton */}
          <div className="flex justify-center mt-6">
            <Skeleton className="h-4 w-24" />
          </div>
        </div>
      </main>
    </div>
  )
}