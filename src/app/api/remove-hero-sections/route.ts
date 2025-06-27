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
    console.log("🧹 Removing legacy heroSections field...");

    // Get the current homepage document
    const homepage = await sanityClient.fetch(`
      *[_type == "homepage"][0]{
        _id,
        _rev,
        heroSections,
        contentBlocks
      }
    `);

    if (!homepage) {
      return NextResponse.json({
        success: false,
        message: "No homepage document found",
      });
    }

    if (!homepage.heroSections) {
      return NextResponse.json({
        success: true,
        message: "No heroSections field found to remove",
        contentBlocksCount: homepage.contentBlocks?.length || 0,
      });
    }

    console.log(`Found ${homepage.heroSections.length} heroSections to remove`);
    console.log(`Preserving ${homepage.contentBlocks?.length || 0} contentBlocks`);

    // Remove the heroSections field entirely
    const result = await sanityClient
      .patch(homepage._id)
      .unset(["heroSections"]) // Remove the legacy field
      .commit();

    console.log("✅ Successfully removed heroSections field");

    return NextResponse.json({
      success: true,
      message: `Successfully removed ${homepage.heroSections.length} legacy heroSections`,
      removedCount: homepage.heroSections.length,
      preservedContentBlocks: homepage.contentBlocks?.length || 0,
      result: result,
    });
  } catch (error) {
    console.error("Remove heroSections error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to remove heroSections",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

export async function GET() {
  try {
    // Check current state
    const homepage = await sanityClient.fetch(`
      *[_type == "homepage"][0]{
        _id,
        heroSections,
        contentBlocks[]
      }
    `);

    return NextResponse.json({
      message: "Remove legacy heroSections field endpoint",
      homepage: homepage,
      heroSectionsCount: homepage?.heroSections?.length || 0,
      contentBlocksCount: homepage?.contentBlocks?.length || 0,
      hasLegacyData: !!homepage?.heroSections,
      instructions: "POST to this endpoint to remove legacy heroSections field",
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