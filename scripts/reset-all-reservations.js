#!/usr/bin/env node

/**
 * Complete reset of all reservations across products and variants
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

async function resetAllReservations() {
  console.log('🔄 Resetting ALL reservations...')

  try {
    // Get ALL products
    const allProducts = await client.fetch(`
      *[_type == "product"] {
        _id,
        title,
        reservedQuantity,
        variants[] {
          _key,
          size,
          stockQuantity,
          reservedQuantity
        }
      }
    `)

    console.log(`Found ${allProducts.length} products`)

    for (const product of allProducts) {
      console.log(`\n🔧 Processing: ${product.title}`)
      
      // Always reset main product reservedQuantity to 0
      const updates = []
      
      if (product.reservedQuantity !== 0) {
        updates.push(['set', 'reservedQuantity', 0])
        console.log(`  - Reset main reservedQuantity: ${product.reservedQuantity} → 0`)
      }

      // Reset all variant reservedQuantity to 0
      if (product.variants && product.variants.length > 0) {
        product.variants.forEach((variant, index) => {
          if (variant.reservedQuantity !== 0) {
            updates.push(['set', `variants[${index}].reservedQuantity`, 0])
            console.log(`  - Reset ${variant.size} reservedQuantity: ${variant.reservedQuantity} → 0`)
          }
        })
      }

      if (updates.length > 0) {
        let patch = client.patch(product._id)
        updates.forEach(([action, path, value]) => {
          patch = patch.set({ [path]: value })
        })
        await patch.commit()
        console.log(`  ✅ Applied ${updates.length} updates`)
      } else {
        console.log(`  ✅ Already clean`)
      }
    }

    console.log('\n🎉 Successfully reset all reservations!')

  } catch (error) {
    console.error('❌ Error resetting reservations:', error)
    process.exit(1)
  }
}

resetAllReservations()