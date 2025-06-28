// app/page.tsx
import { ProgressiveImage } from "@/components/progressive-image";
import Link from "next/link";
import { Layout } from "@/components/layout";
import { getCategories } from "@/lib/sanity/queries";
import { sanityFetch } from "@/lib/sanity/live";
import { homepageQuery } from "@/lib/sanity/groq";
import type { SanityContentBlock } from "@/lib/sanity/types";
import { generateSEOMetadata } from "@/lib/seo/utils";
import { siteConfig } from "@/lib/seo/config";
import type { Metadata } from "next";

export const metadata: Metadata = generateSEOMetadata({
  title: siteConfig.title,
  description: siteConfig.description,
  canonical: siteConfig.url,
  ogType: 'website',
});

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
      {/* SEO: Main page heading - visually hidden but accessible to screen readers and search engines */}
      <h1 className="sr-only">Spooky Books - Independent Art Book Publisher</h1>
      <section className="text-md sm:text-sm grid grid-cols-12 gap-2 mb-12 xl:mb-24 mt-8 sm:mt-24">
        {!homepage ? (
          <div className="col-span-12 text-center py-12">
            <p>
              No homepage content found. Please create homepage content in
              Sanity Studio.
            </p>
          </div>
        ) : !homepage.contentBlocks ? (
          <div className="col-span-12 text-center py-12">
            <p>No content configured. Please add content in Sanity Studio.</p>
          </div>
        ) : homepage.contentBlocks?.length === 0 ? (
          <div className="col-span-12 text-center py-12">
            <p>
              No content blocks configured. Please add content in Sanity Studio.
            </p>
          </div>
        ) : (
          <>
            {/* Unified content blocks */}
            {homepage.contentBlocks?.map(
              (block: SanityContentBlock, index: number) => (
                <ContentBlock key={`content-${index}`} block={block} />
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
  // Determine the link URL and properties based on new linkType system
  const getLink = () => {
    if (block.linkType === "product" && block.linkedProduct) {
      return {
        href: `/products/${block.linkedProduct.slug}/`,
        isExternal: false,
        openInNewTab: false,
      };
    }
    if (block.linkType === "custom" && block.customLink?.url) {
      const isExternal = 
        !block.customLink.url.startsWith("/") &&
        !block.customLink.url.startsWith("#") &&
        !block.customLink.url.startsWith("mailto:") &&
        !block.customLink.url.startsWith("tel:");
      
      return {
        href: block.customLink.url,
        isExternal,
        openInNewTab: block.customLink.openInNewTab ?? isExternal, // Default to true for external links
      };
    }
    // linkType === "none" or no linkType means no link
    return null;
  };

  const link = getLink();
  const linkProps = link
    ? {
        ...(link.isExternal || link.openInNewTab
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
  link: { href: string; isExternal: boolean; openInNewTab: boolean } | null;
  linkProps: any;
}) {
  const content = (
    <>
      {/* Full-width image */}
      <div className="col-span-12">
        {block.leftImage?.asset?.url ? (
          <ProgressiveImage
            src={block.leftImage.asset.url}
            alt={block.leftImage.alt || block.title}
            width={1920}
            height={1280}
            sizes="100vw"
            quality={95}
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
          <h2 className="mb-2">
            {block.title}
          </h2>
          {block.caption && (
            <p className="mb-2">
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
  link: { href: string; isExternal: boolean; openInNewTab: boolean } | null;
  linkProps: any;
}) {
  const content = (
    <>
      {/* Left Image */}
      <div className="col-span-12 sm:col-span-6">
        {block.leftImage?.asset?.url ? (
          <ProgressiveImage
            src={block.leftImage.asset.url}
            alt={block.leftImage.alt || block.title}
            width={800}
            height={600}
            sizes="(max-width: 640px) 100vw, 50vw"
            quality={95}
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
          <ProgressiveImage
            src={block.rightImage.asset.url}
            alt={block.rightImage.alt || block.title}
            width={800}
            height={600}
            sizes="(max-width: 640px) 100vw, 50vw"
            quality={95}
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
        <div className="inline-block mb-4 normal-case">
          <h2>{block.title}</h2>
          {block.caption && (
            <p>{block.caption}</p>
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
  link: { href: string; isExternal: boolean; openInNewTab: boolean } | null;
  linkProps: any;
}) {
  const content = (
    <>
      {/* Column 1: Text Content */}
      <div className="col-span-12 lg:col-span-4">
        <div className="inline-block normal-case">
          <h2 className="mb-2">
            {block.title}
          </h2>
          {block.caption && (
            <p>
              {block.caption}
            </p>
          )}
        </div>
      </div>

      {/* Column 2: Left Image */}
      <div className="col-span-6 lg:col-span-4">
        {block.leftImage?.asset?.url ? (
          <ProgressiveImage
            src={block.leftImage.asset.url}
            alt={block.leftImage.alt || block.title}
            width={600}
            height={800}
            sizes="(max-width: 1024px) 50vw, 33vw"
            quality={95}
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
      <div className="col-span-6 lg:col-span-4">
        {block.rightImage?.asset?.url ? (
          <ProgressiveImage
            src={block.rightImage.asset.url}
            alt={block.rightImage.alt || block.title}
            width={600}
            height={800}
            sizes="(max-width: 1024px) 50vw, 33vw"
            quality={95}
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

