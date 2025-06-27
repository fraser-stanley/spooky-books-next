"use client";

import Link from "next/link";
import { useCart } from "./cart-contex";
import styles from "./cart-button.module.css";

export function CartButton() {
  const { cart } = useCart();
  const quantity = cart.reduce((total, item) => total + item.quantity, 0);

  return (
    <Link
      aria-label={`Shopping Bag with ${quantity} items`}
      href="/cart"
      className={styles.cartButton}
    >
      Cart{quantity > 0 && ` (${quantity})`}
    </Link>
  );
}
