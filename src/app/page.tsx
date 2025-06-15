// app/page.tsx
import Image from "next/image"
import Link from "next/link"
import { draftMode } from "next/headers"
import { Layout } from "@/components/layout"
import { getCategories, getHomepage } from "@/lib/sanity/queries"
import type { SanityHeroSection, SanityHeroPair, SanityHeroSingle } from "@/lib/sanity/types"

export default async function HomePage() {
  const { isEnabled } = await draftMode()
  const categories = await getCategories()
  const homepage = await getHomepage(isEnabled)
  
  return (
    <Layout categories={categories}>
      <section className="text-md sm:text-sm grid grid-cols-12 gap-2 mb-12 xl:mb-24 mt-8 sm:mt-24">
        {homepage?.heroSections?.map((section, index) => (
          <HeroSection key={index} section={section} />
        ))}
      </section>
    </Layout>
  )
}

// Dynamic hero section renderer
function HeroSection({ section }: { section: SanityHeroSection }) {
  if (section._type === 'heroPair') {
    return <HeroPair section={section} />
  }
  
  if (section._type === 'heroSingle') {
    return <HeroSingle section={section} />
  }
  
  return null
}

// Updated HeroPair component with Sanity data
function HeroPair({ section }: { section: SanityHeroPair }) {
  const productUrl = `/products/${section.linkedProduct.category.slug}/${section.linkedProduct.slug}/`
  
  return (
    <>
      <div className="col-span-12 sm:col-span-6">
        <Link href={productUrl}>
          <Image
            src={section.leftImage.asset.url}
            alt={section.leftImage.alt || section.title}
            width={section.leftImage.asset.metadata.dimensions.width}
            height={section.leftImage.asset.metadata.dimensions.height}
            className="w-full"
            priority
          />
        </Link>
      </div>
      <div className="col-span-12 sm:col-span-6">
        <Link href={productUrl}>
          <Image
            src={section.rightImage.asset.url}
            alt={section.rightImage.alt || section.title}
            width={section.rightImage.asset.metadata.dimensions.width}
            height={section.rightImage.asset.metadata.dimensions.height}
            className="w-full"
            priority
          />
        </Link>
      </div>
      <TitleLink 
        href={productUrl} 
        title={section.title} 
        caption={section.caption}
      />
    </>
  )
}

// New HeroSingle component for full-width content
function HeroSingle({ section }: { section: SanityHeroSingle }) {
  const productUrl = `/products/${section.linkedProduct.category.slug}/${section.linkedProduct.slug}/`
  
  return (
    <>
      <div className="col-span-12">
        <Link href={productUrl}>
          <Image
            src={section.image.asset.url}
            alt={section.image.alt || section.title}
            width={section.image.asset.metadata.dimensions.width}
            height={section.image.asset.metadata.dimensions.height}
            className="w-full"
            quality={100}
            priority
          />
        </Link>
      </div>
      <TitleLink 
        href={productUrl} 
        title={section.title} 
        caption={section.caption}
      />
    </>
  )
}

// Enhanced TitleLink component with caption support
function TitleLink({ href, title, caption }: { href: string; title: string; caption?: string }) {
  return (
    <div className="col-span-12">
      <Link
        href={href}
        className="inline-block text-md sm:text-sm mb-12 sm:mb-8 normal-case"
        aria-label={`View product page`}
      >
        <h2>{title}</h2>
        {caption && (
          <p className="text-sm text-gray-600 mt-2 normal-case leading-relaxed">
            {caption}
          </p>
        )}
      </Link>
    </div>
  )
}
