import { defineField, defineType } from "sanity";

export const stockReservation = defineType({
  name: "stockReservation",
  title: "Stock Reservation",
  type: "document",
  hidden: true, // Hide from studio UI - this is for system use only
  fields: [
    defineField({
      name: "sessionId",
      title: "Stripe Session ID",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "operations",
      title: "Stock Operations",
      type: "array",
      of: [
        {
          type: "object",
          title: "Stock Operation",
          fields: [
            defineField({
              name: "productId",
              title: "Product ID",
              type: "string",
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: "quantity",
              title: "Quantity",
              type: "number",
              validation: (Rule) => Rule.required().positive().integer(),
            }),
            defineField({
              name: "size",
              title: "Size (for apparel)",
              type: "string",
            }),
          ],
        },
      ],
      validation: (Rule) => Rule.required().min(1),
    }),
    defineField({
      name: "expiresAt",
      title: "Expires At",
      type: "datetime",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "createdAt",
      title: "Created At",
      type: "datetime",
      validation: (Rule) => Rule.required(),
    }),
  ],
  preview: {
    select: {
      sessionId: "sessionId",
      expiresAt: "expiresAt",
      operationsCount: "operations",
    },
    prepare(selection) {
      const { sessionId, expiresAt, operationsCount } = selection;
      const itemCount = Array.isArray(operationsCount)
        ? operationsCount.length
        : 0;

      return {
        title: `Reservation: ${sessionId?.slice(-8)}`,
        subtitle: `${itemCount} items • Expires: ${new Date(expiresAt).toLocaleString()}`,
      };
    },
  },
});
