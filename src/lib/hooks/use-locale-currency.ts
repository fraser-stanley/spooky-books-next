"use client";

import { useMemo } from "react";

export interface LocaleCurrency {
  locale: string;
  currency: string;
}

export function useLocaleCurrency(): LocaleCurrency {
  return useMemo(() => {
    // Default fallback
    let locale = "en-US";
    let currency = "USD";

    // Only run in browser environment
    if (typeof navigator !== "undefined" && navigator.language) {
      const detectedLocale = navigator.language;
      locale = detectedLocale;

      // Map language to currency
      if (detectedLocale.startsWith("en-US")) {
        currency = "USD";
      } else if (detectedLocale.startsWith("en-AU")) {
        currency = "AUD";
      } else if (
        detectedLocale.startsWith("de") ||
        detectedLocale.startsWith("fr")
      ) {
        currency = "EUR";
        // Set appropriate locale for EUR
        if (detectedLocale.startsWith("de")) {
          locale = "de-DE";
        } else if (detectedLocale.startsWith("fr")) {
          locale = "fr-FR";
        }
      }
      // For any other locale, keep USD as default
    }

    return { locale, currency };
  }, []);
}
