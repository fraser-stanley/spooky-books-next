import { defineConfig } from 'sanity'
import { structureTool } from 'sanity/structure'
import { visionTool } from '@sanity/vision'
import { presentationTool } from '@sanity/presentation'
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
            // Regular documents
            ...S.documentTypeListItems().filter(
              (listItem) => !['homepage'].includes(listItem.getId()!)
            ),
          ])
    }),
    presentationTool({
      previewUrl: {
        origin: process.env.SANITY_STUDIO_PREVIEW_ORIGIN || 'http://localhost:3000',
        preview: '/',
        previewMode: {
          enable: '/api/draft-mode/enable',
        },
      },
      locate: (params, context) => {
        if (params.type === 'homepage') {
          return {
            message: 'This document is used on the homepage',
            tone: 'primary',
            locations: [
              {
                title: 'Homepage',
                href: '/',
              },
            ],
          }
        }
        
        if (params.type === 'product') {
          const slug = params.slug as string
          const category = context.document?.category as any
          const categorySlug = category?.slug?.current
          
          if (slug && categorySlug) {
            return {
              message: 'This product appears on multiple pages',
              tone: 'primary',
              locations: [
                {
                  title: 'Product Page',
                  href: `/products/${categorySlug}/${slug}/`,
                },
                {
                  title: 'Products Listing',
                  href: '/products/',
                },
                {
                  title: 'Category Page',
                  href: `/products/category/${categorySlug}/`,
                },
              ],
            }
          }
        }
        
        return null
      },
    }),
    visionTool()
  ],
  schema: {
    types: schemaTypes,
  },
})