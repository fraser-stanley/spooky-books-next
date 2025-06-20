// studio/schemas/homepage.ts
import { defineType, defineField } from 'sanity'

export default defineType({
  name: 'homepage',
  title: 'Homepage',
  type: 'document',
  __experimental_formPreviewTitle: false,
  fields: [
    defineField({
      name: 'title',
      title: 'Page Title',
      type: 'string',
      initialValue: 'Homepage',
      readOnly: true,
    }),
    defineField({
      name: 'contentBlocks',
      title: 'Content Blocks',
      type: 'array',
      of: [
        {
          type: 'object',
          name: 'contentBlock',
          title: 'Content Block',
          icon: () => '🎨',
          fields: [
            {
              name: 'layout',
              title: 'Layout Style',
              type: 'string',
              options: {
                list: [
                  { title: '2-Column: Images Side by Side (Text Below)', value: 'two' },
                  { title: '3-Column: Text | Image | Image', value: 'three' },
                  { title: 'Full Width: Single Image', value: 'full' },
                ],
              },
              initialValue: 'three',
              validation: Rule => Rule.required(),
              description: 'Choose how to display the content',
            },
            {
              name: 'title',
              title: 'Title',
              type: 'string',
              validation: Rule => Rule.required(),
              description: 'Main heading for this content block',
            },
            {
              name: 'caption',
              title: 'Caption (Optional)',
              type: 'text',
              rows: 2,
              description: 'Optional caption or description',
            },
            {
              name: 'linkedProduct',
              title: 'Linked Product (Optional)',
              type: 'reference',
              to: [{ type: 'product' }],
              description: 'Optionally link this content block to a product page',
            },
            {
              name: 'customLink',
              title: 'Custom Link (Optional)',
              type: 'object',
              description: 'Alternative to product link - use for external links or custom URLs',
              fields: [
                {
                  name: 'url',
                  title: 'URL',
                  type: 'url',
                  validation: Rule => Rule.uri({
                    allowRelative: true,
                    scheme: ['http', 'https', 'mailto', 'tel']
                  })
                },
                {
                  name: 'text',
                  title: 'Link Text',
                  type: 'string',
                  description: 'Text to display for the link (optional, defaults to title)'
                }
              ],
              hidden: ({ parent }) => !!parent?.linkedProduct,
            },
            {
              name: 'leftImage',
              title: 'Left Image',
              type: 'image',
              options: { hotspot: true },
              description: 'Primary image (or left image for 2/3-column layouts)',
              validation: Rule => Rule.required(),
            },
            {
              name: 'rightImage',
              title: 'Right Image',
              type: 'image',
              options: { hotspot: true },
              description: 'Right image (only used for 2 and 3-column layouts)',
              hidden: ({ parent }) => parent?.layout === 'full',
            },
          ],
          preview: {
            select: {
              title: 'title',
              leftImage: 'leftImage',
              rightImage: 'rightImage',
              product: 'linkedProduct.title',
              customLink: 'customLink.url',
              layout: 'layout',
            },
            prepare({ title, leftImage, rightImage, product, customLink, layout }) {
              const layoutLabels: Record<string, string> = {
                'two': '2-Column',
                'three': '3-Column',
                'full': 'Full Width'
              }
              const layoutLabel = layoutLabels[layout] || '3-Column'
              
              let linkInfo = 'No link'
              if (product) {
                linkInfo = `→ ${product}`
              } else if (customLink) {
                linkInfo = `→ Custom link`
              }
              
              return {
                title: title || 'Content Block',
                subtitle: `${layoutLabel} | ${linkInfo}`,
                media: leftImage || rightImage,
              }
            },
          },
        },
      ],
      validation: Rule => Rule.min(1).error('At least one content block is required'),
    }),
  ],
  preview: {
    prepare() {
      return {
        title: 'Homepage Content',
        subtitle: 'Hero sections and layout',
      }
    },
  },
})