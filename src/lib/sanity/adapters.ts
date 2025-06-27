import type { SanityProduct, SanityCategory } from "./types";
import type { Product } from "@/data/products";

/**
 * Convert Sanity product to existing Product interface format
 * Maintains compatibility with existing cart and UI components
 */
export function adaptSanityProduct(sanityProduct: SanityProduct): Product {
  return {
    id: sanityProduct.slug, // Use slug as ID for consistency
    title: sanityProduct.title,
    slug: sanityProduct.slug,
    price: sanityProduct.price,
    stockQuantity: sanityProduct.stockQuantity || 0, // Default to 0 for sized apparel
    currency: "USD", // Default currency, can be made configurable later
    category: sanityProduct.category.title,
    images: [
      {
        url: sanityProduct.heroImage,
        alt: `Cover of ${sanityProduct.title}${sanityProduct.author ? ` by ${sanityProduct.author}` : ""}`,
      },
      ...(sanityProduct.secondaryImages?.map((url, index) => ({
        url,
        alt: `Image ${index + 2} from ${sanityProduct.title}`,
      })) || []),
    ],
    description: sanityProduct.description,
    variants: sanityProduct.variants, // Pass through variants array
  };
}

/**
 * Convert multiple Sanity products to Product array
 */
export function adaptSanityProducts(
  sanityProducts: SanityProduct[],
): Product[] {
  return sanityProducts.map(adaptSanityProduct);
}

/**
 * Create categories array with "All" option for navigation
 */
export function adaptSanityCategories(
  sanityCategories: SanityCategory[],
): string[] {
  return ["All", ...sanityCategories.map((cat) => cat.title)];
}

/**
 * Get category slug from title, handling "All" special case
 */
export function getCategorySlug(
  categoryTitle: string,
  sanityCategories: SanityCategory[],
): string | null {
  if (categoryTitle === "All") return null;

  const category = sanityCategories.find((cat) => cat.title === categoryTitle);
  return category?.slug || null;
}
