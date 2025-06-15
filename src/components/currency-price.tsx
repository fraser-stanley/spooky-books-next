"use client"

import { useState, useEffect } from "react"
import { useLocaleCurrency } from "@/lib/hooks/use-locale-currency"
import { formatPrice } from "@/lib/utils/format-price"

interface CurrencyPriceProps {
  price: number
  fallbackCurrency?: string
  fallbackLocale?: string
}

export function CurrencyPrice({ 
  price, 
  fallbackCurrency = "USD", 
  fallbackLocale = "en-US" 
}: CurrencyPriceProps) {
  const [isMounted, setIsMounted] = useState(false)
  const { locale, currency: detectedCurrency } = useLocaleCurrency()

  useEffect(() => {
    setIsMounted(true)
  }, [])

  // On server and initial client render, use fallback formatting
  if (!isMounted) {
    return <span>{formatPrice(price, fallbackCurrency, fallbackLocale)}</span>
  }

  // After hydration, use detected locale
  return <span>{formatPrice(price, detectedCurrency, locale)}</span>
}