import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@sanity/client";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-05-28.basil",
});

const sanityClient = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "0gbx06x6",
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || "production",
  token: process.env.SANITY_API_TOKEN!,
  apiVersion: "2023-05-03",
  useCdn: false,
});

export async function POST() {
  try {
    // Get all products without stripePriceId
    const products = await sanityClient.fetch(`
      *[_type == "product" && !defined(stripePriceId)] {
        _id,
        title,
        author,
        metadata,
        price,
        slug,
        vendor
      }
    `);

    console.log(`Found ${products.length} products to sync`);

    const results = [];

    for (const product of products) {
      try {
        console.log(`Syncing product: ${product.title}`);

        // Create Stripe product
        const productName = product.author
          ? `${product.title} by ${product.author}`
          : product.title;
        
        const stripeDescription = product.metadata?.trim() || `${productName} - Available from Spooky Books`;

        const stripeProduct = await stripe.products.create({
          name: productName,
          description: stripeDescription,
          metadata: {
            sanity_id: product._id,
            sanity_slug: product.slug?.current || "",
            vendor: product.vendor || "Spooky Books",
            ...(product.author && { author: product.author }),
          },
        });

        // Create Stripe price (convert to cents for USD)
        const stripePriceInCents = Math.round(product.price * 100);

        const stripePrice = await stripe.prices.create({
          product: stripeProduct.id,
          unit_amount: stripePriceInCents,
          currency: "usd",
          metadata: {
            sanity_id: product._id,
            sanity_slug: product.slug?.current || "",
          },
        });

        // Update Sanity document
        await sanityClient
          .patch(product._id)
          .set({
            stripePriceId: stripePrice.id,
            stripeProductId: stripeProduct.id,
          })
          .commit();

        results.push({
          sanityId: product._id,
          title: product.title,
          stripePriceId: stripePrice.id,
          stripeProductId: stripeProduct.id,
          status: "success",
        });

        console.log(`✅ Synced: ${product.title}`);
      } catch (error) {
        console.error(`❌ Failed to sync ${product.title}:`, error);
        results.push({
          sanityId: product._id,
          title: product.title,
          status: "error",
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: `Synced ${results.filter((r) => r.status === "success").length} of ${products.length} products`,
      results,
    });
  } catch (error) {
    console.error("Bulk sync error:", error);

    return NextResponse.json(
      {
        error: "Failed to sync products",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: "POST to this endpoint to sync all existing products to Stripe",
  });
}
