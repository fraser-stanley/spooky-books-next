import { NextResponse } from "next/server";
import { sanityClient } from "@/lib/sanity/client";

export async function POST() {
  try {
    console.log("🔄 Starting homepage content migration...");

    // Fetch current homepage document
    const homepage = await sanityClient.fetch(`*[_type == "homepage"][0]`);

    if (!homepage) {
      return NextResponse.json(
        { error: "No homepage document found" },
        { status: 404 },
      );
    }

    console.log(
      `📋 Found homepage with ${homepage.heroSections?.length || 0} hero sections`,
    );

    if (!homepage.heroSections || homepage.heroSections.length === 0) {
      return NextResponse.json({ message: "No hero sections to migrate" });
    }

    // Convert heroSections to contentBlocks
    const contentBlocks = homepage.heroSections
      .map((section: any, index: number) => {
        console.log(`🔄 Converting section ${index + 1}: ${section._type}`);

        if (section._type === "heroPair") {
          return {
            _type: "contentBlock",
            _key: `migrated-${index}-${Date.now()}`,
            layout: section.layout || "three", // Use existing layout or default to 3-column
            title: section.title,
            caption: section.caption || undefined,
            leftImage: section.leftImage,
            rightImage: section.rightImage,
            linkedProduct: section.linkedProduct
              ? {
                  _type: "reference",
                  _ref: section.linkedProduct._id || section.linkedProduct._ref,
                }
              : undefined,
          };
        } else if (section._type === "heroSingle") {
          return {
            _type: "contentBlock",
            _key: `migrated-${index}-${Date.now()}`,
            layout: "full", // Single images become full-width
            title: section.title,
            caption: section.caption || undefined,
            leftImage: section.image, // Single image becomes leftImage
            linkedProduct: section.linkedProduct
              ? {
                  _type: "reference",
                  _ref: section.linkedProduct._id || section.linkedProduct._ref,
                }
              : undefined,
          };
        }
      })
      .filter(Boolean); // Remove any undefined entries

    console.log(
      `✅ Converted ${contentBlocks.length} sections to content blocks`,
    );

    // Update the homepage document using the client with proper token
    const client = sanityClient.withConfig({
      token: process.env.SANITY_API_TOKEN,
      useCdn: false,
    });

    const result = await client
      .patch(homepage._id)
      .set({ contentBlocks })
      .commit();

    console.log("✅ Migration completed successfully!");

    return NextResponse.json({
      success: true,
      message: `Successfully migrated ${contentBlocks.length} content blocks`,
      migratedBlocks: contentBlocks.length,
      homepage: result,
    });
  } catch (error) {
    console.error("❌ Migration failed:", error);
    return NextResponse.json(
      {
        error: "Migration failed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message:
      "Homepage migration endpoint. Use POST to migrate content from heroSections to contentBlocks.",
  });
}
