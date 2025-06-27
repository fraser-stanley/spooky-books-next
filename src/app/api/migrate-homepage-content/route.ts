import { NextResponse } from "next/server";
import { createClient } from "@sanity/client";

const sanityClient = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "0gbx06x6",
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || "production",
  token: process.env.SANITY_API_TOKEN!,
  apiVersion: "2023-05-03",
  useCdn: false,
});

export async function POST() {
  try {
    console.log("🔄 Starting homepage content migration...");

    // Get the current homepage document
    const homepage = await sanityClient.fetch(`
      *[_type == "homepage"][0]{
        _id,
        _rev,
        title,
        heroSections[]{
          _key,
          _type,
          title,
          caption,
          layout,
          leftImage,
          rightImage,
          image,
          linkedProduct
        },
        contentBlocks[]
      }
    `);

    if (!homepage) {
      return NextResponse.json({
        success: false,
        message: "No homepage document found",
      });
    }

    console.log(`Found homepage with ${homepage.heroSections?.length || 0} heroSections and ${homepage.contentBlocks?.length || 0} contentBlocks`);

    // If no heroSections or contentBlocks already exist, nothing to migrate
    if (!homepage.heroSections || homepage.heroSections.length === 0) {
      return NextResponse.json({
        success: true,
        message: "No heroSections to migrate",
        homepage: homepage,
      });
    }

    if (homepage.contentBlocks && homepage.contentBlocks.length > 0) {
      return NextResponse.json({
        success: false,
        message: "ContentBlocks already exist. Manual migration required to avoid data loss.",
        heroSectionsCount: homepage.heroSections.length,
        contentBlocksCount: homepage.contentBlocks.length,
      });
    }

    // Convert heroSections to contentBlocks format
    const contentBlocks = homepage.heroSections.map((heroSection: any) => {
      // Generate a new key for the content block
      const newKey = `migrated-${heroSection._key || Math.random().toString(36).substr(2, 9)}`;
      
      if (heroSection._type === "heroPair") {
        return {
          _key: newKey,
          _type: "contentBlock",
          layout: heroSection.layout || "three", // Default to three-column if not specified
          title: heroSection.title,
          caption: heroSection.caption || "",
          linkType: heroSection.linkedProduct ? "product" : "none",
          linkedProduct: heroSection.linkedProduct || undefined,
          leftImage: heroSection.leftImage,
          rightImage: heroSection.rightImage,
        };
      } else if (heroSection._type === "heroSingle") {
        return {
          _key: newKey,
          _type: "contentBlock", 
          layout: "full", // Single images become full-width
          title: heroSection.title,
          caption: heroSection.caption || "",
          linkType: heroSection.linkedProduct ? "product" : "none",
          linkedProduct: heroSection.linkedProduct || undefined,
          leftImage: heroSection.image, // Single image becomes leftImage
          rightImage: undefined, // No right image for full layout
        };
      }
      
      // Fallback for unknown types
      return {
        _key: newKey,
        _type: "contentBlock",
        layout: "full",
        title: heroSection.title || "Untitled",
        caption: heroSection.caption || "",
        linkType: "none",
        leftImage: heroSection.leftImage || heroSection.image,
      };
    });

    console.log(`Converting ${homepage.heroSections.length} heroSections to ${contentBlocks.length} contentBlocks`);

    // Update the homepage document with contentBlocks and remove heroSections
    const result = await sanityClient
      .patch(homepage._id)
      .set({ contentBlocks })
      .unset(["heroSections"]) // Remove the legacy field entirely
      .commit();

    console.log("✅ Homepage migration completed successfully");

    return NextResponse.json({
      success: true,
      message: `Successfully migrated ${homepage.heroSections.length} heroSections to contentBlocks format`,
      migratedCount: contentBlocks.length,
      contentBlocks: contentBlocks,
      result: result,
    });
  } catch (error) {
    console.error("Homepage migration error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to migrate homepage content",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

export async function GET() {
  try {
    // Preview what would be migrated
    const homepage = await sanityClient.fetch(`
      *[_type == "homepage"][0]{
        _id,
        heroSections[]{
          _key,
          _type,
          title,
          caption,
          layout
        },
        contentBlocks[]
      }
    `);

    return NextResponse.json({
      message: "Homepage content migration endpoint",
      homepage: homepage,
      heroSectionsCount: homepage?.heroSections?.length || 0,
      contentBlocksCount: homepage?.contentBlocks?.length || 0,
      readyToMigrate: (homepage?.heroSections?.length || 0) > 0 && (homepage?.contentBlocks?.length || 0) === 0,
      instructions: "POST to this endpoint to migrate heroSections to contentBlocks format",
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Failed to check homepage content",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}