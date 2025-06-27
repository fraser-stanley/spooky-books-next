import { notFound } from "next/navigation";
import Image from "next/image";
import { Layout } from "@/components/layout";
import { getProduct, getCategories } from "@/lib/sanity/queries";
import { adaptSanityProduct } from "@/lib/sanity/adapters";
import { ProductPageClient } from "./product-page-client";
import { ProductDescription } from "@/components/portable-text";

interface ProductPageProps {
  params: Promise<{ slug: string }>;
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

  return (
    <Layout categories={categories}>
      <div className="grid grid-cols-12 gap-4 pt-24 md:min-h-screen pb-32 md:pb-0">
        {/* Product Images */}
        <div className="col-span-12 md:col-span-6">
          {product.images.map((image, index) => (
            <div key={index} className="mb-4">
              <Image
                src={image.url}
                alt={image.alt}
                width={600}
                height={600}
                className="w-full"
                priority={index === 0}
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
                <pre className="text-sm text-gray-600 font-mono whitespace-pre-wrap leading-relaxed bg-gray-50 p-3 rounded">
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
