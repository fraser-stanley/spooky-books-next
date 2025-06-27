import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { visionTool } from "@sanity/vision";
import { presentationTool, defineLocations } from "sanity/presentation";
import { schemaTypes } from "./schemas";

export default defineConfig({
  name: "default",
  title: "Spooky Books",
  projectId: "0gbx06x6",
  dataset: "production",
  plugins: [
    structureTool({
      structure: (S) =>
        S.list()
          .title("🏪 Spooky Books Store")
          .items([
            // Homepage singleton
            S.listItem()
              .title("🏠 Homepage Content")
              .icon(() => "🏠")
              .id("homepage")
              .child(
                S.document()
                  .schemaType("homepage")
                  .documentId("homepage")
                  .title("Homepage Content"),
              ),
            S.divider(),

            // Products section
            S.listItem()
              .title("📚 Products")
              .icon(() => "📚")
              .child(
                S.list()
                  .title("Products")
                  .items([
                    S.listItem()
                      .title("📖 All Products")
                      .child(
                        S.documentTypeList("product").title("All Products"),
                      ),
                    S.listItem()
                      .title("📚 Publications (Books & Magazines)")
                      .child(
                        S.documentList()
                          .title("Publications")
                          .filter(
                            '_type == "product" && category._ref == "f16b392c-4089-4e48-8d5e-7701efb17902"',
                          ),
                      ),
                    S.listItem()
                      .title("👕 Apparel (T-shirts & Merchandise)")
                      .child(
                        S.documentList()
                          .title("Apparel")
                          .filter(
                            '_type == "product" && category._ref == "f16b392c-4089-4e48-8d5e-7401efb17902"',
                          ),
                      ),
                  ]),
              ),

            // Categories
            S.listItem()
              .title("🏷️ Categories")
              .icon(() => "🏷️")
              .child(
                S.documentTypeList("category").title("Product Categories"),
              ),

            S.divider(),

            // System docs (collapsed by default)
            S.listItem()
              .title("⚙️ System Settings")
              .icon(() => "⚙️")
              .child(
                S.list()
                  .title("System")
                  .items([
                    ...S.documentTypeListItems().filter((listItem) =>
                      [
                        "stockReservation",
                        "idempotencyRecord",
                        "errorLog",
                      ].includes(listItem.getId()!),
                    ),
                  ]),
              ),
          ]),
    }),
    presentationTool({
      resolve: {
        locations: {
          homepage: defineLocations({
            select: {
              title: "title",
              slug: "slug.current",
            },
            resolve: (doc) => ({
              locations: [
                {
                  title: "Homepage",
                  href: "/",
                },
              ],
            }),
          }),
          product: defineLocations({
            select: {
              title: "title",
              slug: "slug.current",
              category: "category.title",
              author: "author",
              heroImage: "heroImage",
            },
            resolve: (doc) => ({
              locations: [
                {
                  title: doc?.title || "Untitled Product",
                  href: `/products/${doc?.slug}`,
                  icon: doc?.category === "Publications" ? "📚" : "👕",
                  description: doc?.author
                    ? `by ${doc?.author} • ${doc?.category || "Product"}`
                    : doc?.category || "Product",
                },
                {
                  title: `${doc?.title || "Product"} - Category View`,
                  href: "/products",
                  icon: "🏷️",
                  description: `View in ${doc?.category || "All"} products listing`,
                },
              ],
            }),
          }),
        },
      },
      previewUrl: {
        previewMode: {
          enable: "/api/draft-mode/enable",
        },
      },
    }),
    visionTool(),
  ],
  schema: {
    types: schemaTypes,
  },
});
