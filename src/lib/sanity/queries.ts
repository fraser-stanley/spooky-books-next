import { safeSanityFetch } from "./live";
import {
  categoriesQuery,
  productsQuery,
  productsByCategoryQuery,
  productQuery,
  homepageQuery,
} from "./groq";
import type { SanityCategory, SanityProduct, SanityHomepage } from "./types";

export async function getCategories(): Promise<SanityCategory[]> {
  return safeSanityFetch({
    query: categoriesQuery,
    tags: ["categories"],
  });
}

export async function getProducts(): Promise<SanityProduct[]> {
  return safeSanityFetch({
    query: productsQuery,
    tags: ["products"],
  });
}

export async function getProductsByCategory(
  categorySlug: string,
): Promise<SanityProduct[]> {
  return safeSanityFetch({
    query: productsByCategoryQuery,
    params: { categorySlug },
    tags: [`products-${categorySlug}`],
  });
}

export async function getProduct(slug: string): Promise<SanityProduct | null> {
  return safeSanityFetch({
    query: productQuery,
    params: { slug },
    tags: [`product-${slug}`],
  });
}

export async function getHomepage(): Promise<SanityHomepage | null> {
  // Always use safeSanityFetch for proper visual editing integration
  // The live client handles draft mode automatically based on presentation context
  return safeSanityFetch({
    query: homepageQuery,
    tags: ["homepage"],
  });
}
