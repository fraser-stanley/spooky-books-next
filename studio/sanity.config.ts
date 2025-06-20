import { defineConfig } from 'sanity'
import { structureTool } from 'sanity/structure'
import { visionTool } from '@sanity/vision'
import { presentationTool, defineLocations } from 'sanity/presentation'
import { schemaTypes } from './schemas'

export default defineConfig({
  name: 'default',
  title: 'Spooky Books',
  projectId: '0gbx06x6',
  dataset: 'production',
  plugins: [
    structureTool({
      structure: (S) =>
        S.list()
          .title('Content')
          .items([
            // Homepage singleton
            S.listItem()
              .title('Homepage')
              .id('homepage')
              .child(
                S.document()
                  .schemaType('homepage')
                  .documentId('homepage')
              ),
            S.divider(),
            // Regular documents (hiding system-managed types)
            ...S.documentTypeListItems().filter(
              (listItem) => !['homepage', 'stockReservation', 'idempotencyRecord', 'errorLog'].includes(listItem.getId()!)
            ),
          ])
    }),
    presentationTool({
      resolve: {
        locations: {
          homepage: defineLocations({
            select: {
              title: 'title',
              slug: 'slug.current',
            },
            resolve: (doc) => ({
              locations: [
                {
                  title: 'Homepage',
                  href: '/',
                },
              ],
            }),
          }),
          product: defineLocations({
            select: {
              title: 'title',
              slug: 'slug.current',
            },
            resolve: (doc) => ({
              locations: [
                {
                  title: doc?.title || 'Untitled',
                  href: `/products/${doc?.slug}`,
                },
              ],
            }),
          }),
        },
      },
      previewUrl: {
        previewMode: {
          enable: '/api/draft-mode/enable',
        },
      },
    }),
    visionTool()
  ],
  schema: {
    types: schemaTypes,
  },
})