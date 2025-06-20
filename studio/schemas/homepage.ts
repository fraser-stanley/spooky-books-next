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
      name: 'heroSections',
      title: 'Hero Sections',
      type: 'array',
      of: [
        {
          type: 'object',
          name: 'heroPair',
          title: 'Hero Pair (2 Images)',
          icon: () => '📖',
          fields: [
            {
              name: 'layout',
              title: 'Layout Style',
              type: 'string',
              options: {
                list: [
                  { title: '2-Column: Images Side by Side (Text Below)', value: 'two' },
                  { title: '3-Column: Text | Image | Image', value: 'three' },
                ],
              },
              initialValue: 'three',
              validation: Rule => Rule.required(),
              description: 'Choose how to display the images and text',
            },
            {
              name: 'leftImage',
              title: 'Left Image',
              type: 'image',
              options: { hotspot: true },
              description: 'Add image here',
            },
            {
              name: 'rightImage',
              title: 'Right Image',
              type: 'image',
              options: { hotspot: true },
              description: 'Add image here',
            },
            {
              name: 'linkedProduct',
              title: 'Linked Product',
              type: 'reference',
              to: [{ type: 'product' }],
              validation: Rule => Rule.required(),
            },
            {
              name: 'title',
              title: 'Hero Title',
              type: 'string',
              validation: Rule => Rule.required(),
            },
            {
              name: 'caption',
              title: 'Caption (Optional)',
              type: 'text',
              rows: 2,
              description: 'Optional caption displayed below the title',
            },
          ],
          preview: {
            select: {
              title: 'title',
              leftImage: 'leftImage',
              product: 'linkedProduct.title',
              layout: 'layout',
            },
            prepare({ title, leftImage, product, layout }) {
              const layoutLabel = layout === 'two' ? '2-Column' : '3-Column'
              return {
                title: title || 'Hero Pair',
                subtitle: `${layoutLabel} | Links to: ${product || 'No product selected'}`,
                media: leftImage,
              }
            },
          },
        },
        {
          type: 'object',
          name: 'heroSingle',
          title: 'Hero Single (Full Width)',
          icon: () => '🖼️',
          fields: [
            {
              name: 'image',
              title: 'Hero Image',
              type: 'image',
              options: { hotspot: true },
              description: 'Add image here',
            },
            {
              name: 'linkedProduct',
              title: 'Linked Product',
              type: 'reference',
              to: [{ type: 'product' }],
              validation: Rule => Rule.required(),
            },
            {
              name: 'title',
              title: 'Hero Title',
              type: 'string',
              validation: Rule => Rule.required(),
            },
            {
              name: 'caption',
              title: 'Caption (Optional)',
              type: 'text',
              rows: 2,
              description: 'Optional caption displayed below the title',
            },
          ],
          preview: {
            select: {
              title: 'title',
              image: 'image',
              product: 'linkedProduct.title',
            },
            prepare({ title, image, product }) {
              return {
                title: title || 'Hero Single',
                subtitle: `Links to: ${product || 'No product selected'}`,
                media: image,
              }
            },
          },
        },
      ],
      validation: Rule => Rule.min(1).error('At least one hero section is required'),
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