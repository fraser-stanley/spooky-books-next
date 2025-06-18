import { notFound } from "next/navigation"
import Image from "next/image"
import { Layout } from "@/components/layout"
import { getProduct, getCategories } from "@/lib/sanity/queries"
import { adaptSanityProduct } from "@/lib/sanity/adapters"
import { ProductPageClient } from "./product-page-client"
import { ProductDescription, LegacyDescription } from "@/components/portable-text"

interface ProductPageProps {
  params: Promise<{ slug: string }>
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params
  
  // Fetch product and categories from Sanity
  const [sanityProduct, categories] = await Promise.all([
    getProduct(slug),
    getCategories()
  ])
  
  if (!sanityProduct) {
    notFound()
  }
  
  const product = adaptSanityProduct(sanityProduct)

  return (
    <Layout categories={categories}>
      <div className="grid grid-cols-12 gap-4 pt-24">
        {/* Product Images */}
        <div className="col-span-12 md:col-span-6">
          {product.images.map((image, index) => (
            <div key={index} className="mb-4">
              <Image
                src={image.url}
                alt={image.alt}
                width={600}
                height={600}
                className="w-full rounded-md"
                priority={index === 0}
              />
            </div>
          ))}
        </div>

        {/* Product Details */}
        <div className="col-span-12 md:col-span-6">
          <div className="md:pl-8 text-pretty ">
            <h1 className="text-2xl">
              {product.title}
              {product.stockQuantity <= 0 && !product.variants && " (SOLD OUT)"}
              {product.stockQuantity === 1 && !product.variants && " (LAST ONE)"}
              {product.stockQuantity > 1 && product.stockQuantity <= 3 && !product.variants && ` (ONLY ${product.stockQuantity} LEFT)`}
            </h1>
            
            {sanityProduct?.author && (
              <div className="text-2xl mb-4">
                {sanityProduct.author}
              </div>
            )}
            
            <div className="mb-4">
              <span className="text-2xl">${product.price}</span>
            </div>


            {/* Rich text description (new) or fallback to legacy plaintext */}
            {sanityProduct?.richDescription ? (
              <ProductDescription value={sanityProduct.richDescription} />
            ) : (
              product.description?.trim() && (
                <LegacyDescription text={product.description} />
              )
            )}


            

            <ProductPageClient product={product} sanityProduct={sanityProduct} />
          </div>
        </div>
      </div>
    </Layout>
  )
}

// Generate static params for all products from Sanity
export async function generateStaticParams() {
  const { getProducts } = await import('@/lib/sanity/queries')
  const sanityProducts = await getProducts()
  
  return sanityProducts.map((product) => ({
    slug: product.slug,
  }))
}