// src/app/api/draft-mode/enable/route.ts
import { validatePreviewUrl } from '@sanity/preview-url-secret'
import { draftMode } from 'next/headers'
import { redirect } from 'next/navigation'
import { NextRequest } from 'next/server'
import { sanityClient } from '@/lib/sanity/client'

const token = process.env.SANITY_VIEWER_TOKEN!

export async function GET(request: NextRequest) {
  const { isValid, redirectTo = '/' } = await validatePreviewUrl(
    sanityClient.withConfig({ token }),
    request.url,
  )

  if (!isValid) {
    return new Response('Invalid secret', { status: 401 })
  }

  const draft = await draftMode()
  draft.enable()

  redirect(redirectTo)
}