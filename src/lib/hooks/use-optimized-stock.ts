"use client";

import { useState, useEffect, useCallback } from "react";
import type { SanityProduct } from "@/lib/sanity/types";
import { stockCache, createDebouncedFetch } from "@/lib/utils/stock-cache";

interface UseOptimizedStockResult {
  products: SanityProduct[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

// Debounced fetch function for products
const debouncedFetchProducts = createDebouncedFetch(
  async (): Promise<SanityProduct[]> => {
    const response = await fetch("/api/products-optimized");
    if (!response.ok) {
      throw new Error("Failed to fetch products");
    }
    return response.json();
  },
  300,
);

export function useOptimizedStock(): UseOptimizedStockResult {
  const [products, setProducts] = useState<SanityProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = useCallback(async () => {
    try {
      setError(null);

      // Check cache first
      const cached = stockCache.getAllProducts();
      if (cached) {
        setProducts(cached);
        setLoading(false);
        return;
      }

      // Fetch from API
      const fetchedProducts = await debouncedFetchProducts();

      // Cache the results
      stockCache.cacheAllProducts(fetchedProducts);
      setProducts(fetchedProducts);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, []);

  const refetch = useCallback(async () => {
    setLoading(true);
    stockCache.clear(); // Clear cache for fresh data
    await fetchProducts();
  }, [fetchProducts]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  return {
    products,
    loading,
    error,
    refetch,
  };
}
