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
            // --- LINKING OPTIONS (OPTIONAL) ---
            {
              name: "linkType",
              title: "🔗 Link Behavior",
              type: "string",
              options: {
                list: [
                  { title: "🚫 No Link (Display Only)", value: "none" },
                  { title: "🛍️ Link to Product", value: "product" },
                  { title: "🌐 Link to Custom URL", value: "custom" },
                ],
                layout: "radio",
              },
              initialValue: "none",
              description: "Choose if this content block should be clickable and where it should link",
            },
            {
              name: "linkedProduct",
              title: "🛍️ Product to Link To",
              type: "reference",
              to: [{ type: "product" }],
              description: "Choose a product from your store to link to",
              options: {
                filter: "defined(slug.current)",
                filterParams: {},
              },
              hidden: (context) => {
                const parent = context.parent as { linkType?: string } | undefined;
                return parent?.linkType !== "product";
              },
              validation: (Rule) =>
                Rule.custom((value, context) => {
                  const parent = context.parent as { linkType?: string } | undefined;
                  if (parent?.linkType === "product" && !value) {
                    return "Please select a product to link to";
                  }
                  return true;
                }),
            },
            {
              name: "customLink",
              title: "🌐 Custom Link Details",
              type: "object",
              description: "Link to external websites (like Melbourne Art Book Fair) or internal pages",
              hidden: (context) => {
                const parent = context.parent as { linkType?: string } | undefined;
                return parent?.linkType !== "custom";
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
                  placeholder: "https://melbourneartbookfair.com or /about-us",
                  description: "External URL (with https://) or internal path (starting with /)",
                },
                {
                  name: "text",
                  title: "Link Text (Optional)",
                  type: "string",
                  description: "Custom text for the link (if empty, uses the content title)",
                  placeholder: 'e.g. "Visit Event" or "Learn More"',
                },
                {
                  name: "openInNewTab",
                  title: "Open in New Tab",
                  type: "boolean",
                  description: "Open this link in a new browser tab (recommended for external links)",
                  initialValue: true,
                },
              ],
              validation: (Rule) =>
                Rule.custom((value, context) => {
                  const parent = context.parent as { linkType?: string } | undefined;
                  if (parent?.linkType === "custom" && (!value || !(value as any)?.url)) {
                    return "Please provide a URL for the custom link";
                  }
                  return true;
                }),
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
              linkType: "linkType",
              product: "linkedProduct.title",
              customUrl: "customLink.url",
              layout: "layout",
              caption: "caption",
            },
            prepare({
              title,
              leftImage,
              rightImage,
              linkType,
              product,
              customUrl,
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
              if (linkType === "product" && product) {
                linkInfo = ` • Links to: ${product}`;
              } else if (linkType === "custom" && customUrl) {
                const domain = customUrl.includes("://") 
                  ? customUrl.split("/")[2] 
                  : "Internal page";
                linkInfo = ` • Links to: ${domain}`;
              } else if (linkType === "none") {
                linkInfo = " • Display only";
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
