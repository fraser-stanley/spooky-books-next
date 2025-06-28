import { notFound } from "next/navigation";
import { Layout } from "@/components/layout";
import { ProductListing } from "@/components/product-listing";
import { getProductsByCategory, getCategories } from "@/lib/sanity/queries";
import { adaptSanityProducts } from "@/lib/sanity/adapters";
import { generateCategoryMetadata } from "@/lib/seo/utils";
import { siteConfig } from "@/lib/seo/config";
import type { Metadata } from "next";
import type { CategoryMetadata } from "@/lib/seo/types";

// Use webhook-only revalidation for new products (no ISR to save Vercel resources)

interface CategoryPageProps {
  params: Promise<{ categorySlug: string }>;
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { categorySlug } = await params;
  
  // Get category details
  const categories = await getCategories();
  const category = categories.find((cat) => cat.slug === categorySlug);
  
  if (!category) {
    return generateCategoryMetadata({
      title: 'Category Not Found',
      description: 'The requested category could not be found.',
      slug: categorySlug,
    });
  }

  // Get product count for this category
  const products = await getProductsByCategory(categorySlug);
  
  const categoryMetadata: CategoryMetadata = {
    title: category.title,
    description: category.description || `Browse our curated collection of ${category.title.toLowerCase()} from ${siteConfig.name}.`,
    slug: categorySlug,
    productCount: products.length,
  };

  return generateCategoryMetadata(categoryMetadata);
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { categorySlug } = await params;

  // Fetch products for this category and all categories
  const [sanityProducts, categories] = await Promise.all([
    getProductsByCategory(categorySlug),
    getCategories(),
  ]);

  // Check if category exists
  const categoryExists = categories.some((cat) => cat.slug === categorySlug);
  if (!categoryExists) {
    notFound();
  }

  const products = adaptSanityProducts(sanityProducts);

  return (
    <Layout categories={categories}>
      <ProductListing products={products} sanityProducts={sanityProducts} />
    </Layout>
  );
}

// Generate static params for all categories
export async function generateStaticParams() {
  const { getCategories } = await import("@/lib/sanity/queries");
  const categories = await getCategories();

  return categories.map((category) => ({
    categorySlug: category.slug,
  }));
}
