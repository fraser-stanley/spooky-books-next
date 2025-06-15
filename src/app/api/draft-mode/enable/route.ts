// src/app/api/draft-mode/enable/route.ts
import { defineEnableDraftMode } from 'next-sanity/draft-mode'
import { sanityClient } from '@/lib/sanity/client'

export const { GET } = defineEnableDraftMode({
  client: sanityClient.withConfig({
    token: process.env.SANITY_VIEWER_TOKEN,
  }),
})