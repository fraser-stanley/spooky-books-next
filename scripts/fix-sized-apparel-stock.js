#!/usr/bin/env node

/**
 * Fix sized apparel stock display by ensuring main stockQuantity is not used
 * This script sets the main stockQuantity to null for products with variants
 */

const fs = require('fs')
const path = require('path')

// Custom environment variable parsing (avoiding dotenv dependency)
function loadEnvVars() {
  const envPath = path.join(process.cwd(), '.env.local')
  if (fs.existsSync(envPath)) {
    const envFile = fs.readFileSync(envPath, 'utf8')
    envFile.split('\n').forEach(line => {
      const [key, ...valueParts] = line.split('=')
      if (key && valueParts.length > 0) {
        process.env[key.trim()] = valueParts.join('=').trim()
      }
    })
  }
}

loadEnvVars()

const { createClient } = require('@sanity/client')

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  token: process.env.SANITY_API_TOKEN,
  apiVersion: '2023-01-01',
  useCdn: false
})

async function fixSizedApparelStock() {
  console.log('🔧 Fixing sized apparel stock display...')

  try {
    // Get all products with variants
    const productsWithVariants = await client.fetch(`
      *[_type == "product" && defined(variants) && length(variants) > 0] {
        _id,
        title,
        stockQuantity,
        variants[] {
          size,
          stockQuantity,
          reservedQuantity
        }
      }
    `)

    console.log(`Found ${productsWithVariants.length} products with variants`)

    for (const product of productsWithVariants) {
      // For sized apparel, set main stockQuantity to null
      // The variants will handle all stock tracking
      await client
        .patch(product._id)
        .unset(['stockQuantity']) // Remove the main stockQuantity field
        .commit()

      console.log(`✅ Fixed ${product.title} - removed main stockQuantity`)
    }

    console.log('🎉 Successfully fixed all sized apparel products!')

  } catch (error) {
    console.error('❌ Error fixing sized apparel stock:', error)
    process.exit(1)
  }
}

fixSizedApparelStock()