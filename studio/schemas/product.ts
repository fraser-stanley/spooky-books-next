import { defineField, defineType } from "sanity";

export const product = defineType({
  name: "product",
  title: "Product",
  type: "document",
  fields: [
    defineField({
      name: "title",
      type: "string",
      title: "📖 Product Title",
      validation: (Rule) => Rule.required().min(3).max(80),
      description:
        "The name of your product as it will appear on your website (3-80 characters)",
      placeholder:
        'e.g. "The Haunting of Hill House" or "Horror Stories T-Shirt"',
    }),
    defineField({
      name: "author",
      type: "string",
      title: "✍️ Author/Creator",
      description: "Author name for books, or designer/brand for merchandise",
      placeholder: 'e.g. "Stephen King" or "Spooky Books Design"',
    }),
    defineField({
      name: "slug",
      type: "slug",
      title: "🔗 URL Slug (Auto-generated)",
      description:
        '🤖 This creates the web address for your product. Click "Generate" to create from title.',
      options: {
        source: "title",
        maxLength: 96,
        slugify: (input: string) =>
          input
            .toLowerCase()
            .replace(/\s+/g, "-")
            .replace(/[^\w\-]+/g, "")
            .replace(/\-\-+/g, "-")
            .replace(/^-+/, "")
            .replace(/-+$/, ""),
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "richDescription",
      type: "array",
      title: "Rich Description",
      description:
        "Rich text description with formatting support (bold, italics, paragraphs, etc.)",
      of: [
        {
          type: "block",
          styles: [
            { title: "Normal", value: "normal" },
            { title: "Heading 4", value: "h4" },
            { title: "Heading 5", value: "h5" },
            { title: "Quote", value: "blockquote" },
          ],
          marks: {
            decorators: [
              { title: "Strong", value: "strong" },
              { title: "Emphasis", value: "em" },
            ],
            annotations: [
              {
                title: "URL",
                name: "link",
                type: "object",
                fields: [
                  {
                    title: "URL",
                    name: "href",
                    type: "url",
                    validation: (Rule) =>
                      Rule.uri({
                        scheme: ["http", "https", "mailto", "tel"],
                      }),
                  },
                  {
                    title: "Open in new tab",
                    name: "blank",
                    type: "boolean",
                    initialValue: true,
                  },
                ],
              },
            ],
          },
        },
      ],
    }),
    defineField({
      name: "metadata",
      type: "text",
      title: "📋 Product Metadata (Optional)",
      description: "Technical details like ISBN, size, materials, binding, publication date, etc. Will be displayed in monospace font below the description.",
      placeholder: `ISBN: 978-0-123456-78-9
Size: 6" × 9" (15cm × 23cm)
Pages: 320
Binding: Perfect bound
Published: October 2024
Materials: 100% organic cotton`,
      rows: 8,
      validation: (Rule) => Rule.max(1000),
    }),
    defineField({
      name: "price",
      type: "number",
      title: "💰 Price",
      description:
        "💵 Enter the price in dollars (e.g. 29.99 for $29.99). Don't include currency symbol.",
      validation: (Rule) => Rule.required().positive().precision(2),
      placeholder: "29.99",
    }),
    defineField({
      name: "category",
      type: "reference",
      title: "🏷️ Product Category",
      description:
        "📋 Choose Publications or Apparel for clothing/merchandise",
      to: [{ type: "category" }],
      validation: (Rule) => Rule.required(),
      options: {
        filter: "defined(title)",
        filterParams: {},
      },
    }),
    // --- INVENTORY MANAGEMENT ---
    defineField({
      name: "hasSizes",
      type: "boolean",
      title: "👕 Does This Apparel Come in Different Sizes?",
      description:
        "✅ Turn ON for t-shirts, hoodies, etc. that have XS/S/M/L/XL sizing\n❌ Turn OFF for tote bags, stickers, or items without size variants",
      initialValue: false,
      hidden: (context) => {
        // Only show this toggle for Apparel category
        const document = context.document as { category?: { _ref?: string } } | undefined;
        return (
          document?.category?._ref !== "f16b392c-4089-4e48-8d5e-7401efb17902"
        ); // Apparel category ID
      },
    }),
    defineField({
      name: "stockQuantity",
      type: "number",
      title: "📦 How Many Do You Have in Stock?",
      description: "📦 Enter the total quantity you have in stock. For publications and non-sized apparel (tote bags, stickers), use this field. For sized apparel (t-shirts), use the Size Variants section below.",
      validation: (Rule) => Rule.required().min(0).integer(),
      initialValue: 10,
      placeholder: "10",
      hidden: (context) => {
        // Hide stock quantity only for apparel products that have sizes enabled
        const document = context.document as { category?: { _ref?: string }; hasSizes?: boolean } | undefined;
        const isApparel =
          document?.category?._ref === "f16b392c-4089-4e48-8d5e-7401efb17902";
        const hasSizesEnabled = document?.hasSizes === true;
        return isApparel && hasSizesEnabled;
      },
    }),
    defineField({
      name: "reservedQuantity",
      type: "number",
      title: "Reserved Quantity",
      description:
        "Items temporarily reserved during checkout process. Managed automatically by the system.",
      validation: (Rule) => Rule.min(0).integer(),
      initialValue: 0,
      readOnly: true,
      hidden: true, // Always hidden from Studio UI - system managed field
    }),
    defineField({
      name: "variants",
      title: "👕 Size Variants (Only for Sized Apparel)",
      type: "array",
      description:
        '📏 Add each size you offer (XS, S, M, L, XL) and set how many you have in stock for each size. Click "Add item" to add a new size.',
      of: [
        {
          type: "object",
          title: "Size Variant",
          icon: () => "👕",
          fields: [
            defineField({
              name: "size",
              title: "📏 Size",
              type: "string",
              options: {
                list: [
                  { title: "XS (Extra Small)", value: "xs" },
                  { title: "S (Small)", value: "s" },
                  { title: "M (Medium)", value: "m" },
                  { title: "L (Large)", value: "l" },
                  { title: "XL (Extra Large)", value: "xl" },
                  { title: "XXL (2X Large)", value: "xxl" },
                  { title: "XXXL (3X Large)", value: "xxxl" },
                ],
                layout: "dropdown",
              },
              validation: (Rule) => Rule.required(),
              description: "Choose the size for this variant",
            }),
            defineField({
              name: "stockQuantity",
              title: "📦 Stock for This Size",
              type: "number",
              validation: (Rule) => Rule.required().min(0).integer(),
              initialValue: 5,
              placeholder: "5",
              description:
                "How many of this specific size do you have in stock?",
            }),
            defineField({
              name: "reservedQuantity",
              title: "Reserved for this size",
              type: "number",
              description:
                "Items temporarily reserved during checkout. Managed automatically by the system.",
              validation: (Rule) => Rule.min(0).integer(),
              initialValue: 0,
              readOnly: true,
              hidden: true, // Always hidden from Studio UI - system managed field
            }),
            defineField({
              name: "stripePriceId",
              title: "Stripe Price ID",
              type: "string",
              readOnly: true,
              hidden: true, // Always hidden - auto-managed by webhooks
            }),
          ],
          preview: {
            select: {
              size: "size",
              stock: "stockQuantity",
            },
            prepare(selection) {
              const { size, stock } = selection;
              return {
                title: `Size ${size?.toUpperCase()}`,
                subtitle: `Stock: ${stock || 0}`,
              };
            },
          },
        },
      ],
      hidden: (context) => {
        // Only show variants for Apparel category with sizes enabled
        const document = context.document as { category?: { _ref?: string }; hasSizes?: boolean } | undefined;
        const isApparel =
          document?.category?._ref === "f16b392c-4089-4e48-8d5e-7401efb17902";
        const hasSizesEnabled = document?.hasSizes === true;
        return !(isApparel && hasSizesEnabled);
      },
    }),
    // --- PRODUCT IMAGES ---
    defineField({
      name: "heroImage",
      type: "image",
      title: "📸 Main Product Image",
      description:
        "🌟 This is the primary image that customers will see first. Make it high-quality and eye-catching!",
      options: {
        hotspot: true,
        accept: "image/*",
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "secondaryImages",
      type: "array",
      title: "🖼️ Additional Images (Optional)",
      description:
        "📚 Add more photos to showcase different angles, details, or related content. Customers can view these in a gallery.",
      of: [
        {
          type: "image",
          options: {
            hotspot: true,
            accept: "image/*",
          },
        },
      ],
    }),
    defineField({
      name: "stripePriceId",
      title: "Stripe Price ID",
      type: "string",
      readOnly: true,
      hidden: true, // Always hidden - auto-managed by webhooks
    }),
    defineField({
      name: "stripeProductId",
      title: "Stripe Product ID",
      type: "string",
      readOnly: true,
      hidden: true, // Always hidden - auto-managed by webhooks
    }),
  ],
  preview: {
    select: {
      title: "title",
      author: "author",
      category: "category.title",
      media: "heroImage",
    },
    prepare(selection) {
      const { title, author, category } = selection;
      return {
        title: title,
        subtitle: author
          ? `by ${author} • ${category || "No category"}`
          : category || "No category",
      };
    },
  },
});
