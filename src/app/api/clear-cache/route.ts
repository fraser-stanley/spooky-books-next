import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { path } = body;

    if (!path) {
      return NextResponse.json({ error: "Path is required" }, { status: 400 });
    }

    console.log(`🗑️ Manual cache clear requested for: ${path}`);

    revalidatePath(path);

    console.log(`✅ Cache cleared for: ${path}`);

    return NextResponse.json({
      success: true,
      message: `Cache cleared for ${path}`,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Cache clear error:", error);
    return NextResponse.json(
      { error: "Failed to clear cache" },
      { status: 500 },
    );
  }
}
