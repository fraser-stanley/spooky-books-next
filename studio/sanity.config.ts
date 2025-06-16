import { defineConfig } from 'sanity'
import { structureTool } from 'sanity/structure'
import { visionTool } from '@sanity/vision'
import { presentationTool } from 'sanity/presentation'
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
      previewUrl: 'https://spooky-books-next.vercel.app',
    }),
    visionTool()
  ],
  schema: {
    types: schemaTypes,
  },
})