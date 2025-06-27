import { NextResponse } from "next/server";
import { sanityClient } from "@/lib/sanity/client";

export async function GET() {
  try {
    console.log("🔍 Debugging homepage data...");

    // First, let's see what homepage data exists
    const homepage = await sanityClient.fetch(`*[_type == "homepage"][0]`);

    console.log("📋 Homepage data:", JSON.stringify(homepage, null, 2));

    // Also check all documents of type homepage
    const allHomepages = await sanityClient.fetch(`*[_type == "homepage"]`);

    return NextResponse.json({
      success: true,
      homepage,
      allHomepages,
      hasHomepage: !!homepage,
      hasHeroSections: !!homepage?.heroSections,
      heroSectionsCount: homepage?.heroSections?.length || 0,
      hasContentBlocks: !!homepage?.contentBlocks,
      contentBlocksCount: homepage?.contentBlocks?.length || 0,
      debug: {
        homepageKeys: homepage ? Object.keys(homepage) : [],
        heroSectionsData: homepage?.heroSections || null,
      },
    });
  } catch (error) {
    console.error("❌ Debug failed:", error);
    return NextResponse.json(
      {
        error: "Debug failed",
        details: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : null,
      },
      { status: 500 },
    );
  }
}
