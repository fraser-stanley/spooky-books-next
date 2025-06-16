import { defineField, defineType } from 'sanity'

export const errorLog = defineType({
  name: 'errorLog',
  title: 'Error Log',
  type: 'document',
  hidden: true, // Hide from studio UI - this is for system monitoring
  fields: [
    defineField({
      name: 'type',
      title: 'Error Type',
      type: 'string',
      options: {
        list: [
          { title: 'Stock Validation', value: 'stock_validation' },
          { title: 'Stock Reservation', value: 'stock_reservation' },
          { title: 'Stock Deduction', value: 'stock_deduction' },
          { title: 'Webhook Processing', value: 'webhook_processing' }
        ]
      },
      validation: Rule => Rule.required()
    }),
    defineField({
      name: 'message',
      title: 'Error Message',
      type: 'text',
      validation: Rule => Rule.required()
    }),
    defineField({
      name: 'details',
      title: 'Error Details',
      type: 'text',
      description: 'Additional error details in JSON format'
    }),
    defineField({
      name: 'sessionId',
      title: 'Session ID',
      type: 'string'
    }),
    defineField({
      name: 'productId',
      title: 'Product ID',
      type: 'string'
    }),
    defineField({
      name: 'userId',
      title: 'User ID',
      type: 'string'
    }),
    defineField({
      name: 'timestamp',
      title: 'Timestamp',
      type: 'datetime',
      validation: Rule => Rule.required()
    }),
    defineField({
      name: 'severity',
      title: 'Severity Level',
      type: 'string',
      options: {
        list: [
          { title: 'Low', value: 'low' },
          { title: 'Medium', value: 'medium' },
          { title: 'High', value: 'high' },
          { title: 'Critical', value: 'critical' }
        ]
      },
      validation: Rule => Rule.required()
    })
  ],
  preview: {
    select: {
      type: 'type',
      message: 'message',
      severity: 'severity',
      timestamp: 'timestamp'
    },
    prepare(selection: any) {
      const { type, message, severity, timestamp } = selection
      const severityEmojis: Record<string, string> = {
        low: '🟢',
        medium: '🟡',
        high: '🟠',
        critical: '🔴'
      }
      const severityEmoji = severityEmojis[severity] || '⚪'
      
      return {
        title: `${severityEmoji} ${type}: ${message?.slice(0, 50)}${message?.length > 50 ? '...' : ''}`,
        subtitle: `${severity.toUpperCase()} • ${new Date(timestamp).toLocaleString()}`
      }
    }
  }
})