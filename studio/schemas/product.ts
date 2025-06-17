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
      title: 'Description' 
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
      name: 'stockQuantity',
      type: 'number',
      title: 'Stock Quantity',
      description: 'Available inventory for publications and non-sized apparel (tote bags, etc). For sized apparel, use Size Variants below.',
      validation: Rule => Rule.required().min(0).integer(),
      initialValue: 0,
      hidden: ({ document }: { document?: any }) => {
        // Hide main stock only for apparel products that have size variants
        // Show for publications and non-sized apparel (tote bags, etc)
        const isApparel = document?.category?._ref === 'f16b392c-4089-4e48-8d5e-7401efb17902' // Apparel category ID
        const hasVariants = document?.variants && document.variants.length > 0
        return isApparel && hasVariants
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
      title: 'Size Variants (for sized Apparel)',
      type: 'array',
      description: 'Add different sizes with individual stock levels. Only use for apparel that comes in multiple sizes (t-shirts, etc). Leave empty for non-sized apparel (tote bags, etc).',
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
              hidden: true,
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
        // Only show variants for Apparel category
        // Show if category reference is to Apparel category
        return document?.category?._ref !== 'f16b392c-4089-4e48-8d5e-7401efb17902' // Apparel category ID
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
      hidden: true,
    }),
    defineField({
      name: 'stripeProductId',
      title: 'Stripe Product ID',
      type: 'string',
      readOnly: true,
      hidden: true,
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