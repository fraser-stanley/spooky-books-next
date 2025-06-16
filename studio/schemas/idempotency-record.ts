import { defineField, defineType } from 'sanity'

export const idempotencyRecord = defineType({
  name: 'idempotencyRecord',
  title: 'Idempotency Record',
  type: 'document',
  hidden: true, // Hide from studio UI - this is for system use only
  fields: [
    defineField({
      name: 'key',
      title: 'Idempotency Key',
      type: 'string',
      validation: Rule => Rule.required()
    }),
    defineField({
      name: 'result',
      title: 'Stored Result',
      type: 'text',
      description: 'JSON string of the operation result'
    }),
    defineField({
      name: 'createdAt',
      title: 'Created At',
      type: 'datetime',
      validation: Rule => Rule.required()
    }),
    defineField({
      name: 'expiresAt',
      title: 'Expires At',
      type: 'datetime',
      validation: Rule => Rule.required()
    })
  ],
  preview: {
    select: {
      key: 'key',
      createdAt: 'createdAt',
      expiresAt: 'expiresAt'
    },
    prepare(selection: any) {
      const { key, createdAt, expiresAt } = selection
      
      return {
        title: `Idempotency: ${key}`,
        subtitle: `Created: ${new Date(createdAt).toLocaleString()} • Expires: ${new Date(expiresAt).toLocaleString()}`
      }
    }
  }
})