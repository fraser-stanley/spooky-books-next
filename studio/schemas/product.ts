import { defineField, defineType } from 'sanity'

export const product = defineType({
  name: 'product',
  title: 'Product',
  type: 'document',
  fields: [
    defineField({ 
      name: 'title', 
      type: 'string', 
      title: 'Title',
      validation: Rule => Rule.required()
    }),
    defineField({ 
      name: 'author', 
      type: 'string', 
      title: 'Author' 
    }),
    defineField({ 
      name: 'slug', 
      type: 'slug', 
      title: 'Slug', 
      options: { source: 'title', maxLength: 96 },
      validation: Rule => Rule.required()
    }),
    defineField({ 
      name: 'description', 
      type: 'text', 
      title: 'Description (Legacy - will be removed)',
      description: 'Copy this text to Rich Description below, then delete this field content'
    }),
    defineField({
      name: 'richDescription',
      type: 'array',
      title: 'Rich Description',
      description: 'Rich text description with formatting support (bold, italics, paragraphs, etc.)',
      of: [
        {
          type: 'block',
          styles: [
            { title: 'Normal', value: 'normal' },
            { title: 'Heading 4', value: 'h4' },
            { title: 'Heading 5', value: 'h5' },
            { title: 'Quote', value: 'blockquote' }
          ],
          marks: {
            decorators: [
              { title: 'Strong', value: 'strong' },
              { title: 'Emphasis', value: 'em' }
            ],
            annotations: [
              {
                title: 'URL',
                name: 'link',
                type: 'object',
                fields: [
                  {
                    title: 'URL',
                    name: 'href',
                    type: 'url',
                    validation: Rule => Rule.uri({
                      scheme: ['http', 'https', 'mailto', 'tel']
                    })
                  },
                  {
                    title: 'Open in new tab',
                    name: 'blank',
                    type: 'boolean',
                    initialValue: true
                  }
                ]
              }
            ]
          }
        }
      ]
    }),
    defineField({ 
      name: 'price', 
      type: 'number', 
      title: 'Price (in major units)',
      validation: Rule => Rule.required().positive()
    }),
    defineField({
      name: 'category',
      type: 'reference',
      title: 'Category',
      to: [{ type: 'category' }],
      validation: Rule => Rule.required()
    }),
    defineField({
      name: 'hasSizes',
      type: 'boolean',
      title: 'Has Sizes?',
      description: 'Toggle ON for sized apparel (t-shirts, hoodies). Toggle OFF for non-sized items (tote bags, books, magazines).',
      initialValue: false,
      hidden: ({ document }: { document?: any }) => {
        // Only show this toggle for Apparel category
        return document?.category?._ref !== 'f16b392c-4089-4e48-8d5e-7401efb17902' // Apparel category ID
      }
    }),
    defineField({
      name: 'stockQuantity',
      type: 'number',
      title: 'Stock Quantity',
      description: 'Available inventory. Use this field for: Publications (books, magazines) and Non-sized Apparel (tote bags, stickers). For sized apparel (t-shirts), use Size Variants below instead.',
      validation: Rule => Rule.required().min(0).integer(),
      initialValue: 0,
      hidden: ({ document }: { document?: any }) => {
        // Hide stock quantity only for apparel products that have sizes enabled
        const isApparel = document?.category?._ref === 'f16b392c-4089-4e48-8d5e-7401efb17902'
        const hasSizesEnabled = document?.hasSizes === true
        return isApparel && hasSizesEnabled
      }
    }),
    defineField({
      name: 'reservedQuantity',
      type: 'number',
      title: 'Reserved Quantity',
      description: 'Items temporarily reserved during checkout process. Managed automatically by the system.',
      validation: Rule => Rule.min(0).integer(),
      initialValue: 0,
      readOnly: true,
      hidden: true // Always hidden from Studio UI - system managed field
    }),
    defineField({
      name: 'variants',
      title: 'Size Variants',
      type: 'array',
      description: 'Add different sizes (XS, S, M, L, XL) with individual stock levels for each size.',
      of: [
        {
          type: 'object',
          title: 'Size Variant',
          fields: [
            defineField({
              name: 'size',
              title: 'Size',
              type: 'string',
              options: {
                list: [
                  { title: 'XS', value: 'xs' },
                  { title: 'S', value: 's' },
                  { title: 'M', value: 'm' },
                  { title: 'L', value: 'l' },
                  { title: 'XL', value: 'xl' },
                  { title: 'XXL', value: 'xxl' },
                  { title: 'XXXL', value: 'xxxl' }
                ]
              },
              validation: Rule => Rule.required()
            }),
            defineField({
              name: 'stockQuantity',
              title: 'Stock for this size',
              type: 'number',
              validation: Rule => Rule.required().min(0).integer(),
              initialValue: 0
            }),
            defineField({
              name: 'reservedQuantity',
              title: 'Reserved for this size',
              type: 'number',
              description: 'Items temporarily reserved during checkout. Managed automatically by the system.',
              validation: Rule => Rule.min(0).integer(),
              initialValue: 0,
              readOnly: true,
              hidden: true // Always hidden from Studio UI - system managed field
            }),
            defineField({
              name: 'stripePriceId',
              title: 'Stripe Price ID',
              type: 'string',
              readOnly: true,
              hidden: true, // Always hidden - auto-managed by webhooks
            })
          ],
          preview: {
            select: {
              size: 'size',
              stock: 'stockQuantity'
            },
            prepare(selection) {
              const { size, stock } = selection
              return {
                title: `Size ${size?.toUpperCase()}`,
                subtitle: `Stock: ${stock || 0}`
              }
            }
          }
        }
      ],
      hidden: ({ document }: { document?: any }) => {
        // Only show variants for Apparel category with sizes enabled
        const isApparel = document?.category?._ref === 'f16b392c-4089-4e48-8d5e-7401efb17902'
        const hasSizesEnabled = document?.hasSizes === true
        return !(isApparel && hasSizesEnabled)
      }
    }),
    defineField({ 
      name: 'heroImage', 
      type: 'image', 
      title: 'Hero Image',
      options: {
        hotspot: true
      },
      validation: Rule => Rule.required()
    }),
    defineField({ 
      name: 'secondaryImages', 
      type: 'array', 
      title: 'Secondary Images', 
      of: [{ 
        type: 'image',
        options: {
          hotspot: true
        }
      }] 
    }),
    defineField({
      name: 'stripePriceId',
      title: 'Stripe Price ID',
      type: 'string',
      readOnly: true,
      hidden: true, // Always hidden - auto-managed by webhooks
    }),
    defineField({
      name: 'stripeProductId',
      title: 'Stripe Product ID',
      type: 'string',
      readOnly: true,
      hidden: true, // Always hidden - auto-managed by webhooks
    }),
  ],
  preview: {
    select: {
      title: 'title',
      author: 'author',
      category: 'category.title',
      media: 'heroImage'
    },
    prepare(selection) {
      const { title, author, category } = selection
      return {
        title: title,
        subtitle: author 
          ? `by ${author} • ${category || 'No category'}`
          : category || 'No category'
      }
    }
  }
})