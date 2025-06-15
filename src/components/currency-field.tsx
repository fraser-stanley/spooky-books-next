"use client"

import * as React from "react"
import styles from "./currency-field.module.css"

type CurrencyFieldProps = React.InputHTMLAttributes<HTMLInputElement> & {
  symbol: string
  symbolAtEnd?: boolean
  className?: string
}

export function CurrencyField({
  symbol,
  symbolAtEnd = false,
  className,
  style,
  ...props
}: CurrencyFieldProps) {
  return (
    <span
      className={[
        className,
        styles.wrap,
        symbolAtEnd ? styles.symbolAfter : "",
      ]
        .filter(Boolean)
        .join(" ")}
      style={style}
    >
      <span className={styles.currencySymbol}>{symbol}</span>
      <input
        type="numeric"
        className={styles.input}
        data-currency={symbol}
        {...props}
      />
    </span>
  )
}
