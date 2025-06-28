/**
 * Internal Linking Strategy Utilities
 * SEO-optimized anchor text and link recommendations for better site architecture
 */

import type { SanityProduct, SanityCategory } from '@/lib/sanity/types';

/**
 * Generate SEO-optimized anchor text for product links
 * Includes keywords and descriptive context for better search rankings
 */
export function generateProductLinkText(product: SanityProduct, context: 'grid' | 'related' | 'featured' = 'grid'): string {
  const baseText = product.title;
  const author = product.author ? ` by ${product.author}` : '';
  const category = product.category.title;
  
  switch (context) {
    case 'grid':
      return `${baseText}${author}`;
    case 'related':
      return `${baseText}${author} - ${category}`;
    case 'featured':
      return `Featured: ${baseText}${author}`;
    default:
      return `${baseText}${author}`;
  }
}

/**
 * Generate SEO-optimized anchor text for category links
 */
export function generateCategoryLinkText(category: SanityCategory, productCount?: number): string {
  const baseText = category.title;
  const countText = productCount ? ` (${productCount} items)` : '';
  
  if (category.slug === 'Publications') {
    return `${baseText} - Art Books & Limited Editions${countText}`;
  } else if (category.slug === 'apparel') {
    return `${baseText} - Artist Merchandise${countText}`;
  }
  
  return `${baseText}${countText}`;
}

/**
 * Generate contextual links for improved internal linking
 */
export function generateContextualLinks(currentProduct: SanityProduct, allProducts: SanityProduct[]) {
  // Same category products
  const relatedProducts = allProducts
    .filter(p => 
      p.slug !== currentProduct.slug && 
      p.category.slug === currentProduct.category.slug
    )
    .slice(0, 3);

  // Same author products
  const sameAuthorProducts = currentProduct.author 
    ? allProducts
        .filter(p => 
          p.slug !== currentProduct.slug && 
          p.author === currentProduct.author
        )
        .slice(0, 2)
    : [];

  return {
    relatedProducts,
    sameAuthorProducts,
  };
}

/**
 * Generate breadcrumb data with SEO-optimized text
 */
export function generateBreadcrumbData(
  currentPage: 'product' | 'category' | 'home',
  product?: SanityProduct,
  category?: SanityCategory
) {
  const breadcrumbs = [
    {
      name: 'Home',
      url: '/',
      description: 'Spooky Books Homepage'
    }
  ];

  if (currentPage === 'category' && category) {
    breadcrumbs.push({
      name: generateCategoryLinkText(category),
      url: `/products/category/${category.slug}`,
      description: `Browse ${category.title} collection`
    });
  }

  if (currentPage === 'product' && product) {
    // Add category breadcrumb
    breadcrumbs.push({
      name: generateCategoryLinkText(product.category),
      url: `/products/category/${product.category.slug}`,
      description: `Browse ${product.category.title} collection`
    });

    // Add current product
    breadcrumbs.push({
      name: generateProductLinkText(product, 'grid'),
      url: `/products/${product.slug}`,
      description: `${product.title} product page`
    });
  }

  return breadcrumbs;
}

/**
 * Internal link suggestions for content optimization
 */
export const internalLinkSuggestions = {
  // Homepage links
  homepage: [
    {
      anchor: 'independent art book publisher',
      url: '/products',
      description: 'Link to main product catalog'
    },
    {
      anchor: 'limited edition artists books',
      url: '/products/category/Publications',
      description: 'Link to publications category'
    },
    {
      anchor: 'contemporary artists',
      url: '/products',
      description: 'Link to featured artists'
    }
  ],
  
  // Product page links
  product: [
    {
      anchor: 'explore more books',
      url: '/products',
      description: 'Link to product catalog'
    },
    {
      anchor: 'similar publications',
      url: '/products/category/Publications',
      description: 'Link to category page'
    }
  ],
  
  // Category page links
  category: [
    {
      anchor: 'view all publications',
      url: '/products',
      description: 'Link to all products'
    },
    {
      anchor: 'featured artists',
      url: '/products',
      description: 'Link with keyword-rich anchor'
    }
  ]
};

/**
 * Generate schema markup for breadcrumbs
 */
export function generateBreadcrumbSchema(breadcrumbs: Array<{ name: string; url: string; description?: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: breadcrumbs.map((crumb, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: crumb.name,
      item: {
        '@type': 'WebPage',
        '@id': crumb.url,
        name: crumb.name,
        description: crumb.description
      }
    }))
  };
}