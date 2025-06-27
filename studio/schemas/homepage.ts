// studio/schemas/homepage.ts
import { defineType, defineField } from "sanity";

export default defineType({
  name: "homepage",
  title: "Homepage",
  type: "document",
  __experimental_formPreviewTitle: false,
  fields: [
    defineField({
      name: "title",
      title: "Page Title",
      type: "string",
      initialValue: "Homepage",
      readOnly: true,
    }),
    defineField({
      name: "contentBlocks",
      title: "Content Blocks",
      type: "array",
      of: [
        {
          type: "object",
          name: "contentBlock",
          title: "Content Block",
          icon: () => "🎨",
          fields: [
            {
              name: "layout",
              title: "Layout Style",
              type: "string",
              options: {
                list: [
                  {
                    title: "📱 2-Column: Images Side by Side",
                    value: "two",
                    description:
                      "Two images displayed side by side with text below - great for product showcases",
                  },
                  {
                    title: "📊 3-Column: Text + Images",
                    value: "three",
                    description:
                      "Text on left, two images on right - balanced content and visuals",
                  },
                  {
                    title: "🖼️ Full Width: Hero Style",
                    value: "full",
                    description:
                      "Single large image spanning full width - perfect for hero sections",
                  },
                ],
                layout: "radio", // Better UX than dropdown
              },
              initialValue: "three",
              validation: (Rule) => Rule.required(),
              description:
                "⚡ Choose your layout style - this affects which image fields are shown below",
            },
            {
              name: "title",
              title: "📝 Content Title",
              type: "string",
              validation: (Rule) => Rule.required().min(3).max(60),
              description:
                "Main heading that will appear on your homepage (3-60 characters)",
              placeholder:
                'e.g. "New Horror Collection" or "Featured Author Spotlight"',
            },
            {
              name: "caption",
              title: "💬 Caption (Optional)",
              type: "text",
              rows: 3,
              validation: (Rule) => Rule.max(200),
              description:
                "Additional text to describe this content (up to 200 characters)",
              placeholder:
                'e.g. "Discover spine-chilling tales from emerging horror writers..."',
            },
            // --- LINKING OPTIONS ---
            {
              name: "linkedProduct",
              title: "🔗 Link to Product",
              type: "reference",
              to: [{ type: "product" }],
              description:
                "✨ Make this content clickable - choose a product from your store",
              options: {
                filter: "defined(slug.current)",
                filterParams: {},
              },
            },
            {
              name: "customLink",
              title: "🌐 Custom Link (Alternative)",
              type: "object",
              description:
                "🚀 Or link to any other page/website (only used if no product is selected above)",
              hidden: (context) => {
                const parent = context.parent as { linkedProduct?: unknown } | undefined;
                return !!parent?.linkedProduct;
              },
              fields: [
                {
                  name: "url",
                  title: "URL",
                  type: "url",
                  validation: (Rule) =>
                    Rule.uri({
                      allowRelative: true,
                      scheme: ["http", "https", "mailto", "tel"],
                    }),
                  placeholder: "https://example.com or /about-us",
                  description: "Full URL or relative path (e.g. /contact)",
                },
                {
                  name: "text",
                  title: "Link Text (Optional)",
                  type: "string",
                  description:
                    "Custom text for the link (if empty, uses the content title)",
                  placeholder: 'e.g. "Learn More" or "Shop Now"',
                },
              ],
            },
            // --- IMAGES ---
            {
              name: "leftImage",
              title: "🎨 Main Image",
              type: "image",
              options: {
                hotspot: true,
                accept: "image/*",
              },
              description: "🎯 Primary image for this content block. For full-width layout, this spans the entire width. For multi-column layouts, this appears on the left.",
              validation: (Rule) => Rule.required(),
            },
            {
              name: "rightImage",
              title: "🎨 Secondary Image",
              type: "image",
              options: {
                hotspot: true,
                accept: "image/*",
              },
              description: "✨ Secondary image to complement your main image. Only used for 2-column and 3-column layouts.",
              hidden: (context) => {
                const parent = context.parent as { layout?: string } | undefined;
                return parent?.layout === "full";
              },
              validation: (Rule) =>
                Rule.custom((value, context) => {
                  const parent = context.parent as { layout?: string } | undefined;
                  if (parent?.layout !== "full" && !value) {
                    return "Right image is required for 2-column and 3-column layouts";
                  }
                  return true;
                }),
            },
          ],
          preview: {
            select: {
              title: "title",
              leftImage: "leftImage",
              rightImage: "rightImage",
              product: "linkedProduct.title",
              customLink: "customLink.url",
              layout: "layout",
              caption: "caption",
            },
            prepare({
              title,
              leftImage,
              rightImage,
              product,
              customLink,
              layout,
              caption,
            }) {
              const layoutLabels: Record<string, string> = {
                two: "📱 2-Column: Side by Side",
                three: "📊 3-Column: Text + Images",
                full: "🖼️ Full Width: Hero Style",
              };
              const layoutLabel =
                layoutLabels[layout] || "📊 3-Column: Text + Images";

              let linkInfo = "";
              if (product) {
                linkInfo = ` • Links to: ${product}`;
              } else if (customLink) {
                linkInfo = ` • Has custom link`;
              }

              const hasCaption = caption ? " • Has caption" : "";
              const imageCount = rightImage ? "Both images" : "Left image only";

              return {
                title: title || "Untitled Content Block",
                subtitle: `${layoutLabel}${linkInfo}${hasCaption} • ${imageCount}`,
                media: leftImage || rightImage,
              };
            },
          },
        },
      ],
      validation: (Rule) =>
        Rule.min(1).error("At least one content block is required"),
    }),
  ],
  preview: {
    prepare() {
      return {
        title: "Homepage Content",
        subtitle: "Hero sections and layout",
      };
    },
  },
});
