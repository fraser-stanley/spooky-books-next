import { defineField, defineType } from 'sanity'

export const category = defineType({
  name: 'category',
  title: 'Category',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      type: 'string',
      title: 'Category Name',
      options: {
        list: [
          { title: 'Publications', value: 'Publications' },
          { title: 'Apparel', value: 'Apparel' }
        ]
      },
      validation: Rule => Rule.required()
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
      title: 'Description',
      description: 'Brief description of this category'
    }),
    defineField({
      name: 'sortOrder',
      type: 'number',
      title: 'Sort Order',
      description: 'Lower numbers appear first in navigation',
      initialValue: 0
    })
  ],
  preview: {
    select: {
      title: 'title',
      subtitle: 'description'
    }
  },
  orderings: [
    {
      title: 'Sort Order',
      name: 'sortOrderAsc',
      by: [{ field: 'sortOrder', direction: 'asc' }]
    },
    {
      title: 'Title A-Z',
      name: 'titleAsc',
      by: [{ field: 'title', direction: 'asc' }]
    }
  ]
})