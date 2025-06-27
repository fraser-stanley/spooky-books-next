// components/navigation.tsx

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./navigation.module.css";
import type { SanityCategory } from "@/lib/sanity/types";

interface NavigationProps {
  className?: string;
  categories: SanityCategory[];
}

export function Navigation({ className = "", categories }: NavigationProps) {
  const pathname = usePathname();

  // Create navigation items with "All" as first item
  const navItems = [
    { title: "All", slug: "" },
    ...categories.map((cat) => ({ title: cat.title, slug: cat.slug })),
  ];

  return (
    <nav className={`${styles.navStyle} ${className}`}>
      {navItems.map((item) => {
        const href = item.slug
          ? `/products/category/${item.slug}`
          : "/products";
        const isActive =
          pathname === href ||
          (item.title === "All" && pathname === "/products");

        return (
          <Link
            key={item.title}
            className={`${styles.navLink} ${isActive ? styles.activeLink : ""}`}
            href={href}
            aria-current={isActive ? "page" : undefined}
          >
            {item.title}
          </Link>
        );
      })}
    </nav>
  );
}
