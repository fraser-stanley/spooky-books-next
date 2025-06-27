// app/page.tsx
import Image from "next/image";
import Link from "next/link";
import { Layout } from "@/components/layout";
import { getCategories } from "@/lib/sanity/queries";
import { sanityFetch } from "@/lib/sanity/live";
import { homepageQuery } from "@/lib/sanity/groq";
import type {
  SanityContentBlock,
  SanityHeroSection,
  SanityHeroPair,
  SanityHeroSingle,
} from "@/lib/sanity/types";

// Force dynamic rendering to ensure fresh data
export const dynamic = "force-dynamic";

export default async function HomePage() {
  const categories = await getCategories();
  const { data: homepage } = await sanityFetch({
    query: homepageQuery,
    tags: ["homepage"],
  });

  return (
    <Layout categories={categories}>
      <section className="text-md sm:text-sm grid grid-cols-12 gap-2 mb-12 xl:mb-24 mt-8 sm:mt-24">
        {!homepage ? (
          <div className="col-span-12 text-center py-12">
            <p>
              No homepage content found. Please create homepage content in
              Sanity Studio.
            </p>
          </div>
        ) : !homepage.contentBlocks && !homepage.heroSections ? (
          <div className="col-span-12 text-center py-12">
            <p>No content configured. Please add content in Sanity Studio.</p>
          </div>
        ) : homepage.contentBlocks?.length === 0 &&
          homepage.heroSections?.length === 0 ? (
          <div className="col-span-12 text-center py-12">
            <p>
              No content blocks configured. Please add content in Sanity Studio.
            </p>
          </div>
        ) : (
          <>
            {/* New unified content blocks */}
            {homepage.contentBlocks?.map(
              (block: SanityContentBlock, index: number) => (
                <ContentBlock key={`content-${index}`} block={block} />
              ),
            )}

            {/* Legacy hero sections for backward compatibility */}
            {homepage.heroSections?.map(
              (section: SanityHeroSection, index: number) => (
                <HeroSection key={`hero-${index}`} section={section} />
              ),
            )}
          </>
        )}
      </section>
    </Layout>
  );
}

// Unified content block component
function ContentBlock({ block }: { block: SanityContentBlock }) {
  // Determine the link URL and properties
  const getLink = () => {
    if (block.linkedProduct) {
      return {
        href: `/products/${block.linkedProduct.slug}/`,
        isExternal: false,
      };
    }
    if (block.customLink) {
      return {
        href: block.customLink.url,
        isExternal:
          !block.customLink.url.startsWith("/") &&
          !block.customLink.url.startsWith("#"),
      };
    }
    return null;
  };

  const link = getLink();
  const linkProps = link
    ? {
        ...(link.isExternal
          ? {
              target: "_blank",
              rel: "noopener noreferrer",
            }
          : {}),
        "aria-label": `View ${block.title}`,
      }
    : {};

  // Render based on layout
  if (block.layout === "full") {
    return (
      <ContentBlockFullWidth block={block} link={link} linkProps={linkProps} />
    );
  } else if (block.layout === "two") {
    return (
      <ContentBlockTwoColumn block={block} link={link} linkProps={linkProps} />
    );
  } else {
    return (
      <ContentBlockThreeColumn
        block={block}
        link={link}
        linkProps={linkProps}
      />
    );
  }
}

// Full-width layout component
function ContentBlockFullWidth({
  block,
  link,
  linkProps,
}: {
  block: SanityContentBlock;
  link: { href: string; isExternal: boolean } | null;
  linkProps: any;
}) {
  const content = (
    <>
      {/* Full-width image */}
      <div className="col-span-12">
        {block.leftImage?.asset?.url ? (
          <Image
            src={block.leftImage.asset.url}
            alt={block.leftImage.alt || block.title}
            width={1200}
            height={800}
            sizes="100vw"
            quality={85}
            className="w-full"
            priority
          />
        ) : (
          <div className="w-full h-96 bg-gray-100 flex items-center justify-center">
            <span className="text-gray-500 text-sm">
              Add image in Sanity Studio
            </span>
          </div>
        )}
      </div>

      {/* Title section */}
      <div className="col-span-12">
        <div className="inline-block normal-case mb-12 sm:mb-8">
          <h2 className="text-lg text-black font-normal leading-tight mb-2">
            {block.title}
          </h2>
          {block.linkedProduct?.author && (
            <div className="text-lg text-black font-normal mb-4">
              {block.linkedProduct.author}
            </div>
          )}
          {block.caption && (
            <p className="text-lg text-black font-normal leading-relaxed">
              {block.caption}
            </p>
          )}
        </div>
      </div>
    </>
  );

  return link ? (
    <Link href={link.href} className="contents" {...linkProps}>
      {content}
    </Link>
  ) : (
    content
  );
}

// Two-column layout component
function ContentBlockTwoColumn({
  block,
  link,
  linkProps,
}: {
  block: SanityContentBlock;
  link: { href: string; isExternal: boolean } | null;
  linkProps: any;
}) {
  const content = (
    <>
      {/* Left Image */}
      <div className="col-span-12 sm:col-span-6">
        {block.leftImage?.asset?.url ? (
          <Image
            src={block.leftImage.asset.url}
            alt={block.leftImage.alt || block.title}
            width={800}
            height={600}
            sizes="(max-width: 640px) 100vw, 50vw"
            quality={85}
            className="w-full"
            priority
          />
        ) : (
          <div className="w-full h-64 bg-gray-100 flex items-center justify-center">
            <span className="text-gray-500 text-sm">Add left image</span>
          </div>
        )}
      </div>

      {/* Right Image */}
      <div className="col-span-12 sm:col-span-6">
        {block.rightImage?.asset?.url ? (
          <Image
            src={block.rightImage.asset.url}
            alt={block.rightImage.alt || block.title}
            width={800}
            height={600}
            sizes="(max-width: 640px) 100vw, 50vw"
            quality={85}
            className="w-full"
          />
        ) : (
          <div className="w-full h-64 bg-gray-100 flex items-center justify-center">
            <span className="text-gray-500 text-sm">Add right image</span>
          </div>
        )}
      </div>

      {/* Text Content Below Images */}
      <div className="col-span-12">
        <div className="inline-block mb-12 sm:mb-8 normal-case">
          <h2 className="text-black font-normal">{block.title}</h2>
          {block.linkedProduct?.author && (
            <div className="text-black font-normal">
              {block.linkedProduct.author}
            </div>
          )}
          {block.caption && (
            <p className="text-black font-normal">{block.caption}</p>
          )}
        </div>
      </div>
    </>
  );

  return link ? (
    <Link href={link.href} className="contents" {...linkProps}>
      {content}
    </Link>
  ) : (
    content
  );
}

// Three-column layout component
function ContentBlockThreeColumn({
  block,
  link,
  linkProps,
}: {
  block: SanityContentBlock;
  link: { href: string; isExternal: boolean } | null;
  linkProps: any;
}) {
  const content = (
    <>
      {/* Column 1: Text Content */}
      <div className="col-span-12 lg:col-span-4 mb-6 lg:mb-0">
        <div className="inline-block normal-case">
          <h2 className="text-lg text-black font-normal leading-tight mb-2">
            {block.title}
          </h2>
          {block.linkedProduct?.author && (
            <div className="text-lg text-black font-normal mb-4">
              {block.linkedProduct.author}
            </div>
          )}
          {block.caption && (
            <p className="text-lg text-black font-normal leading-relaxed">
              {block.caption}
            </p>
          )}
        </div>
      </div>

      {/* Column 2: Left Image */}
      <div className="col-span-6 lg:col-span-4 pr-0.5">
        {block.leftImage?.asset?.url ? (
          <Image
            src={block.leftImage.asset.url}
            alt={block.leftImage.alt || block.title}
            width={600}
            height={800}
            sizes="(max-width: 1024px) 50vw, 33vw"
            quality={85}
            className="w-full"
            priority
          />
        ) : (
          <div className="w-full h-64 bg-gray-100 flex items-center justify-center">
            <span className="text-gray-500 text-sm">Add left image</span>
          </div>
        )}
      </div>

      {/* Column 3: Right Image */}
      <div className="col-span-6 lg:col-span-4 pl-0.5">
        {block.rightImage?.asset?.url ? (
          <Image
            src={block.rightImage.asset.url}
            alt={block.rightImage.alt || block.title}
            width={600}
            height={800}
            sizes="(max-width: 1024px) 50vw, 33vw"
            quality={85}
            className="w-full"
          />
        ) : (
          <div className="w-full h-64 bg-gray-100 flex items-center justify-center">
            <span className="text-gray-500 text-sm">Add right image</span>
          </div>
        )}
      </div>
    </>
  );

  return link ? (
    <Link href={link.href} className="contents" {...linkProps}>
      {content}
    </Link>
  ) : (
    content
  );
}

// Legacy hero section renderer (for backward compatibility)
function HeroSection({ section }: { section: SanityHeroSection }) {
  if (section._type === "heroPair") {
    return <HeroPair section={section} />;
  }

  if (section._type === "heroSingle") {
    return <HeroSingle section={section} />;
  }

  return null;
}

// HeroPair component with layout variants (2-column and 3-column)
function HeroPair({ section }: { section: SanityHeroPair }) {
  const productUrl = `/products/${section.linkedProduct.slug}/`;

  // Use layout field from Sanity, fallback to 'three' for existing content
  const layoutType = section.layout || "three";

  if (layoutType === "three") {
    return <HeroPairThreeColumn section={section} productUrl={productUrl} />;
  } else {
    return <HeroPairTwoColumn section={section} productUrl={productUrl} />;
  }
}

// Three-column layout: Text | Image | Image
function HeroPairThreeColumn({
  section,
  productUrl,
}: {
  section: SanityHeroPair;
  productUrl: string;
}) {
  return (
    <>
      {/* Column 1: Text Content */}
      <div className="col-span-12 lg:col-span-4 mb-6 lg:mb-0">
        <Link
          href={productUrl}
          className="inline-block normal-case"
          aria-label={`View ${section.title} product page`}
        >
          <h2 className="text-lg text-black font-normal leading-tight mb-2">
            {section.title}
          </h2>
          {section.linkedProduct.author && (
            <div className="text-lg text-black font-normal mb-4">
              {section.linkedProduct.author}
            </div>
          )}
          {section.caption && (
            <p className="text-lg text-black font-normal leading-relaxed">
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
  );
}

// Two-column layout: Image | Image (with text below) - Original layout
function HeroPairTwoColumn({
  section,
  productUrl,
}: {
  section: SanityHeroPair;
  productUrl: string;
}) {
  return (
    <>
      {/* Left Image */}
      <div className="col-span-12 sm:col-span-6">
        {section.leftImage?.asset?.url ? (
          <Link href={productUrl}>
            <Image
              src={section.leftImage.asset.url}
              alt={section.leftImage.alt || section.title}
              width={800}
              height={600}
              sizes="(max-width: 640px) 100vw, 50vw"
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

      {/* Right Image */}
      <div className="col-span-12 sm:col-span-6">
        {section.rightImage?.asset?.url ? (
          <Link href={productUrl}>
            <Image
              src={section.rightImage.asset.url}
              alt={section.rightImage.alt || section.title}
              width={800}
              height={600}
              sizes="(max-width: 640px) 100vw, 50vw"
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

      {/* Text Content Below Images */}
      <div className="col-span-12">
        <Link
          href={productUrl}
          className="inline-block mb-12 sm:mb-8 normal-case"
          aria-label={`View ${section.title} product page`}
        >
          <h2 className="text-lg text-black font-normal leading-tight mb-2">
            {section.title}
          </h2>
          {section.linkedProduct.author && (
            <div className="text-lg text-black font-normal mb-4">
              {section.linkedProduct.author}
            </div>
          )}
          {section.caption && (
            <p className="text-lg text-black font-normal leading-relaxed">
              {section.caption}
            </p>
          )}
        </Link>
      </div>
    </>
  );
}

// HeroSingle component for full-width content
function HeroSingle({ section }: { section: SanityHeroSingle }) {
  const productUrl = `/products/${section.linkedProduct.slug}/`;

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
            <span className="text-gray-500 text-sm">
              Add image in Sanity Studio
            </span>
          </div>
        )}
      </div>

      {/* Title section for full-width layout */}
      <div className="col-span-12">
        <Link
          href={productUrl}
          className="inline-block normal-case mb-12 sm:mb-8"
          aria-label={`View ${section.title} product page`}
        >
          <h2 className="text-lg text-black font-normal leading-tight mb-2">
            {section.title}
          </h2>
          {section.linkedProduct.author && (
            <div className="text-lg text-black font-normal mb-4">
              {section.linkedProduct.author}
            </div>
          )}
          {section.caption && (
            <p className="text-lg text-black font-normal leading-relaxed">
              {section.caption}
            </p>
          )}
        </Link>
      </div>
    </>
  );
}
