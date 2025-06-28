/**
 * Custom 404 Not Found Page
 * SEO-optimized with proper metadata, internal linking, and user guidance
 */

import Link from "next/link";
import { Layout } from "@/components/layout";
import { getCategories } from "@/lib/sanity/queries";
import { generateSEOMetadata } from "@/lib/seo/utils";
import { siteConfig } from "@/lib/seo/config";
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
      <div className="min-h-screen flex flex-col items-center justify-center text-center px-4">
        <div className="max-w-2xl mx-auto">
          {/* SEO: Proper heading hierarchy */}
          <h1 className="text-6xl font-normal mb-4 text-gray-900">404</h1>
          
          <h2 className="text-2xl mb-6 text-gray-800">
            Page Not Found
          </h2>
          
          <p className="text-lg text-gray-600 mb-8 leading-relaxed">
            The page you&apos;re looking for doesn&apos;t exist or has been moved. 
            Don&apos;t worry though – our collection of independent art books 
            and limited edition publications is still here.
          </p>

          {/* Internal linking strategy - SEO important */}
          <div className="space-y-6">
            {/* Primary CTA */}
            <div>
              <Link
                href="/products"
                className="inline-block px-8 py-3 bg-black text-white hover:bg-gray-800 transition-colors duration-200 uppercase text-sm font-medium rounded"
              >
                Browse All Books
              </Link>
            </div>

            {/* Secondary navigation options */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center text-sm">
              <Link
                href="/"
                className="text-gray-600 hover:text-black transition-colors underline"
              >
                Return to Homepage
              </Link>
              
              <span className="hidden sm:inline text-gray-400">•</span>
              
              <Link
                href="/products/category/Publications"
                className="text-gray-600 hover:text-black transition-colors underline"
              >
                Publications
              </Link>
              
              <span className="hidden sm:inline text-gray-400">•</span>
              
              <Link
                href="/products/category/apparel"
                className="text-gray-600 hover:text-black transition-colors underline"
              >
                Apparel
              </Link>
            </div>
          </div>

          {/* Search suggestion */}
          <div className="mt-12 p-6 bg-gray-50 rounded-lg">
            <h3 className="text-lg font-medium mb-3 text-gray-800">
              Looking for something specific?
            </h3>
            <p className="text-gray-600 mb-4">
              We&apos;re a curated independent publisher focused on limited edition artists&apos; books. 
              Our collection features unique works by contemporary artists.
            </p>
            <div className="flex flex-wrap gap-2 justify-center">
              <span className="text-sm text-gray-500">Popular searches:</span>
              <Link 
                href="/products" 
                className="text-sm text-blue-600 hover:text-blue-800 underline"
              >
                art books
              </Link>
              <span className="text-gray-400">•</span>
              <Link 
                href="/products" 
                className="text-sm text-blue-600 hover:text-blue-800 underline"
              >
                limited edition
              </Link>
              <span className="text-gray-400">•</span>
              <Link 
                href="/products" 
                className="text-sm text-blue-600 hover:text-blue-800 underline"
              >
                contemporary art
              </Link>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}