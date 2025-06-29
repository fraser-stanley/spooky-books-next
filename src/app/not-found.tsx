/**
 * Custom 404 Not Found Page
 * Minimal design matching empty cart styling - mobile-first responsive
 */

import Link from "next/link";
import { Layout } from "@/components/layout";
import { getCategories } from "@/lib/sanity/queries";
import { generateSEOMetadata } from "@/lib/seo/utils";
import { siteConfig } from "@/lib/seo/config";
import styles from "@/components/add-to-cart.module.css";
import type { Metadata } from "next";

export const metadata: Metadata = generateSEOMetadata({
  title: "Page Not Found (404)",
  description: "The page you're looking for doesn't exist. Browse our collection of independent art books and limited edition publications at Spooky Books.",
  noindex: true, // Don't index 404 pages
  canonical: `${siteConfig.url}/404`,
});

export default async function NotFound() {
  // Get categories for navigation
  const categories = await getCategories();

  return (
    <Layout categories={categories}>
      <div className="min-h-screen">
        <div className="flex flex-col items-center justify-center text-center min-h-screen">
          <h1 className="text-lg mb-4 uppercase">That page cannot be found</h1>
          <p className="text-sm text-black mb-8">
            Go back to home
          </p>
          <Link
            href="/"
            className={`${styles.addToCart} inline-block text-center font-normal text-xs uppercase`}
          >
            GO TO HOME
          </Link>
        </div>
      </div>
    </Layout>
  );
}