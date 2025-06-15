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
          title: 'Hero Pair (2 Images - Side by Side)',
          icon: () => '📖',
          fields: [
            {
              name: 'leftImage',
              title: 'Left Image',
              type: 'image',
              options: { hotspot: true },
              validation: Rule => Rule.required(),
            },
            {
              name: 'rightImage',
              title: 'Right Image',
              type: 'image',
              options: { hotspot: true },
              validation: Rule => Rule.required(),
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
            },
            prepare({ title, leftImage, product }) {
              return {
                title: title || 'Hero Pair',
                subtitle: `Links to: ${product || 'No product selected'}`,
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
              validation: Rule => Rule.required(),
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