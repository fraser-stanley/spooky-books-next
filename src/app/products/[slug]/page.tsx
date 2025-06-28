import { notFound } from "next/navigation";
import Image from "next/image";
import { Layout } from "@/components/layout";
import { getProduct, getCategories } from "@/lib/sanity/queries";
import { adaptSanityProduct } from "@/lib/sanity/adapters";
import { ProductPageClient } from "./product-page-client";
import { ProductDescription } from "@/components/portable-text";
import { generateProductMetadata, generateProductSchema, generateBreadcrumbSchema, generateStructuredDataScript } from "@/lib/seo/utils";
import { siteConfig } from "@/lib/seo/config";
import type { Metadata } from "next";
import type { ProductMetadata } from "@/lib/seo/types";

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const sanityProduct = await getProduct(slug);

  if (!sanityProduct) {
    return generateProductMetadata({
      title: 'Product Not Found',
      description: 'The requested product could not be found.',
      price: 0,
      currency: 'USD',
      availability: 'OutOfStock',
      category: 'Unknown',
      images: [],
      publisher: siteConfig.name,
    });
  }

  // Convert rich description to plain text for meta description
  const plainDescription = sanityProduct.richDescription
    ? sanityProduct.richDescription
        .filter((block: any) => block._type === 'block')
        .map((block: any) => 
          block.children
            ?.filter((child: any) => child._type === 'span')
            .map((span: any) => span.text)
            .join('')
        )
        .join(' ')
    : '';

  const productMetadata: ProductMetadata = {
    title: sanityProduct.title,
    description: plainDescription || `${sanityProduct.title} - A unique publication from ${siteConfig.name}`,
    author: sanityProduct.author,
    price: sanityProduct.price,
    currency: 'USD',
    availability: sanityProduct.stockQuantity > 0 ? 'InStock' : 'OutOfStock',
    category: sanityProduct.category.title,
    images: [sanityProduct.heroImage, ...(sanityProduct.secondaryImages || [])].filter(Boolean),
    publisher: siteConfig.name,
  };

  return generateProductMetadata(productMetadata);
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;

  // Fetch product and categories from Sanity
  const [sanityProduct, categories] = await Promise.all([
    getProduct(slug),
    getCategories(),
  ]);

  if (!sanityProduct) {
    notFound();
  }

  const product = adaptSanityProduct(sanityProduct);

  // Generate structured data for the product
  const productUrl = `${siteConfig.url}/products/${slug}`;
  const plainDescription = sanityProduct.richDescription
    ? sanityProduct.richDescription
        .filter((block: any) => block._type === 'block')
        .map((block: any) => 
          block.children
            ?.filter((child: any) => child._type === 'span')
            .map((span: any) => span.text)
            .join('')
        )
        .join(' ')
    : '';

  const productMetadata: ProductMetadata = {
    title: sanityProduct.title,
    description: plainDescription || `${sanityProduct.title} - A unique publication from ${siteConfig.name}`,
    author: sanityProduct.author,
    price: sanityProduct.price,
    currency: 'USD',
    availability: sanityProduct.stockQuantity > 0 ? 'InStock' : 'OutOfStock',
    category: sanityProduct.category.title,
    images: [sanityProduct.heroImage, ...(sanityProduct.secondaryImages || [])].filter(Boolean),
    publisher: siteConfig.name,
  };

  const productSchema = generateProductSchema(productMetadata, productUrl);

  // Generate breadcrumb structured data
  const breadcrumbItems = [
    { name: 'Home', url: siteConfig.url },
    { name: 'Products', url: `${siteConfig.url}/products` },
    { name: sanityProduct.category.title, url: `${siteConfig.url}/products/category/${sanityProduct.category.slug}` },
    { name: sanityProduct.title, url: productUrl },
  ];
  const breadcrumbSchema = generateBreadcrumbSchema(breadcrumbItems);

  return (
    <Layout categories={categories}>
      <script
        {...generateStructuredDataScript([productSchema, breadcrumbSchema])}
      />
      <div className="grid grid-cols-12 gap-4 pt-24 md:min-h-screen pb-32 md:pb-0">
        {/* Product Images */}
        <div className="col-span-12 md:col-span-6">
          {product.images.map((image, index) => (
            <div key={index} className="mb-6">
              <Image
                src={image.url}
                alt={image.alt}
                width={1200}
                height={800}
                sizes="(max-width: 768px) 100vw, 50vw"
                quality={95}
                className="w-full h-auto"
                priority={index === 0}
                style={{ objectFit: 'cover' }}
              />
            </div>
          ))}
        </div>

        {/* Product Details */}
        <div className="col-span-12 md:col-span-6">
          <div className="md:pl-8 text-pretty md:sticky md:top-8 md:max-h-[calc(100vh-8rem)] md:overflow-y-auto">
            <h1 className="text-2xl">{product.title}</h1>

            {sanityProduct?.author && (
              <div className="text-2xl">{sanityProduct.author}</div>
            )}

            <div className="mb-4">
              <span className="text-2xl">${product.price}</span>
            </div>

            {/* Rich text description */}
            {sanityProduct?.richDescription && (
              <ProductDescription value={sanityProduct.richDescription} />
            )}

            {/* Product metadata with monospace styling */}
            {sanityProduct?.metadata?.trim() && (
              <div className="mt-4 mb-6">
                <pre className="whitespace-pre-wrap">
                  {sanityProduct.metadata}
                </pre>
              </div>
            )}

            <ProductPageClient
              product={product}
              sanityProduct={sanityProduct}
            />
          </div>
        </div>
      </div>
    </Layout>
  );
}

// Generate static params for all products from Sanity
export async function generateStaticParams() {
  const { getProducts } = await import("@/lib/sanity/queries");
  const sanityProducts = await getProducts();

  return sanityProducts.map((product) => ({
    slug: product.slug,
  }));
}
