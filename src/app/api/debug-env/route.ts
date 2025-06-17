import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
    dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
    hasApiToken: !!process.env.SANITY_API_TOKEN,
    hasViewerToken: !!process.env.SANITY_VIEWER_TOKEN,
    nodeEnv: process.env.NODE_ENV
  })
}