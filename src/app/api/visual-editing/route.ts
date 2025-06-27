import { NextResponse } from "next/server";

export async function GET() {
  try {
    // Simple visual editing endpoint that confirms the connection
    return NextResponse.json({
      message: "Visual editing API ready",
      timestamp: Date.now(),
    });
  } catch (error) {
    console.error("Visual editing API error:", error);
    return new NextResponse("Internal server error", { status: 500 });
  }
}
