export function CheckoutLoadingSkeleton() {
  return (
    <div className="flex justify-end mt-8">
      <div className="px-8 py-2 bg-gray-100 text-gray-400 font-normal text-xs uppercase tracking-wide flex items-center gap-2">
        <div className="animate-spin rounded-full h-3 w-3 border border-gray-400 border-t-transparent"></div>
        VALIDATING STOCK...
      </div>
    </div>
  );
}

export function CheckoutProcessingSkeleton() {
  return (
    <div className="flex justify-end mt-8">
      <div className="px-8 py-2 bg-gray-100 text-gray-400 font-normal text-xs uppercase tracking-wide flex items-center gap-2">
        <div className="animate-spin rounded-full h-3 w-3 border border-gray-400 border-t-transparent"></div>
        CREATING CHECKOUT...
      </div>
    </div>
  );
}

export function StockValidationOverlay() {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-20 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg flex items-center gap-3">
        <div className="animate-spin rounded-full h-5 w-5 border border-gray-400 border-t-transparent"></div>
        <span className="text-sm text-gray-600">
          Validating stock availability...
        </span>
      </div>
    </div>
  );
}
