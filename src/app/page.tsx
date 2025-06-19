// app/page.tsx
import Image from "next/image"
import Link from "next/link"
import { draftMode } from "next/headers"
import { Layout } from "@/components/layout"
import { getCategories, getHomepage } from "@/lib/sanity/queries"
import type { SanityHeroSection, SanityHeroPair, SanityHeroSingle } from "@/lib/sanity/types"

// Force dynamic rendering to ensure fresh data
export const dynamic = 'force-dynamic'

export default async function HomePage() {
  const { isEnabled } = await draftMode()
  const categories = await getCategories()
  const homepage = await getHomepage(isEnabled)
  
  // Debug logging
  console.log('Homepage data:', homepage)
  console.log('Hero sections count:', homepage?.heroSections?.length)
  
  return (
    <Layout categories={categories}>
      <section className="text-md sm:text-sm grid grid-cols-12 gap-2 mb-12 xl:mb-24 mt-8 sm:mt-24">
        {!homepage?.heroSections ? (
          <div className="col-span-12 text-center py-12">
            <p>No homepage content found. Please create homepage content in Sanity Studio.</p>
          </div>
        ) : homepage.heroSections.length === 0 ? (
          <div className="col-span-12 text-center py-12">
            <p>No hero sections configured. Please add content in Sanity Studio.</p>
          </div>
        ) : (
          homepage.heroSections.map((section, index) => (
            <HeroSection key={index} section={section} />
          ))
        )}
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

// Updated HeroPair component with three-column layout
function HeroPair({ section }: { section: SanityHeroPair }) {
  const productUrl = `/products/${section.linkedProduct.slug}/`
  
  return (
    <>
      {/* Column 1: Text Content */}
      <div className="col-span-12 lg:col-span-4 mb-6 lg:mb-0">
        <Link
          href={productUrl}
          className="inline-block text-md sm:text-sm normal-case"
          aria-label={`View ${section.title} product page`}
        >
          <h2 className="text-2xl leading-tight mb-2">{section.title}</h2>
          {section.linkedProduct.author && (
            <div className="text-lg text-black mb-4">
              {section.linkedProduct.author}
            </div>
          )}
          {section.caption && (
            <p className="text-sm text-black leading-relaxed">
              {section.caption}
            </p>
          )}
        </Link>
      </div>

      {/* Column 2: Left Image */}
      <div className="col-span-6 lg:col-span-4 pr-0.5">
        {section.leftImage?.asset?.url ? (
          <Link href={productUrl}>
            <Image
              src={section.leftImage.asset.url}
              alt={section.leftImage.alt || section.title}
              width={600}
              height={800}
              sizes="(max-width: 1024px) 50vw, 33vw"
              quality={85}
              className="w-full"
              priority
            />
          </Link>
        ) : (
          <div className="w-full h-64 bg-gray-100 flex items-center justify-center">
            <span className="text-gray-500 text-sm">Add left image</span>
          </div>
        )}
      </div>

      {/* Column 3: Right Image */}
      <div className="col-span-6 lg:col-span-4 pl-0.5">
        {section.rightImage?.asset?.url ? (
          <Link href={productUrl}>
            <Image
              src={section.rightImage.asset.url}
              alt={section.rightImage.alt || section.title}
              width={600}
              height={800}
              sizes="(max-width: 1024px) 50vw, 33vw"
              quality={85}
              className="w-full"
            />
          </Link>
        ) : (
          <div className="w-full h-64 bg-gray-100 flex items-center justify-center">
            <span className="text-gray-500 text-sm">Add right image</span>
          </div>
        )}
      </div>
    </>
  )
}

// HeroSingle component for full-width content
function HeroSingle({ section }: { section: SanityHeroSingle }) {
  const productUrl = `/products/${section.linkedProduct.slug}/`
  
  return (
    <>
      {/* Full-width image */}
      <div className="col-span-12">
        {section.image?.asset?.url ? (
          <Link href={productUrl}>
            <Image
              src={section.image.asset.url}
              alt={section.image.alt || section.title}
              width={1200}
              height={800}
              sizes="100vw"
              quality={85}
              className="w-full"
              priority
            />
          </Link>
        ) : (
          <div className="w-full h-96 bg-gray-100 flex items-center justify-center">
            <span className="text-gray-500 text-sm">Add image in Sanity Studio</span>
          </div>
        )}
      </div>
      
      {/* Title section for full-width layout */}
      <div className="col-span-12">
        <Link
          href={productUrl}
          className="inline-block text-md sm:text-sm normal-case mb-12 sm:mb-8"
          aria-label={`View ${section.title} product page`}
        >
          <h2 className="text-2xl leading-tight mb-2">{section.title}</h2>
          {section.linkedProduct.author && (
            <div className="text-lg text-black mb-4">
              {section.linkedProduct.author}
            </div>
          )}
          {section.caption && (
            <p className="text-sm text-black leading-relaxed">
              {section.caption}
            </p>
          )}
        </Link>
      </div>
    </>
  )
}

