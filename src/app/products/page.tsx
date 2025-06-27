import { Layout } from "@/components/layout";
import { ProductListing } from "@/components/product-listing";
import { getProducts, getCategories } from "@/lib/sanity/queries";
import { adaptSanityProducts } from "@/lib/sanity/adapters";

// Use webhook-only revalidation for new products (no ISR to save Vercel resources)

export default async function ProductsPage() {
  // Fetch products and categories from Sanity
  const [sanityProducts, categories] = await Promise.all([
    getProducts(),
    getCategories(),
  ]);

  const products = adaptSanityProducts(sanityProducts);

  return (
    <Layout categories={categories}>
      <ProductListing products={products} sanityProducts={sanityProducts} />
    </Layout>
  );
}
