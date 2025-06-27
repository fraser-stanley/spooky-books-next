// components/spinner.tsx
import * as React from "react";
import styles from "./progress.module.css";

export function Spinner({
  className = "",
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      role="status"
      aria-live="polite"
      aria-label="Loading"
      className={`${styles.spinner} ${className}`}
      {...props}
    />
  );
}
