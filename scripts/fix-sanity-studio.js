#!/usr/bin/env node

/**
 * Emergency fix for Sanity Studio issues
 * Run this directly to fix missing _key properties and other issues
 * Usage: node scripts/fix-sanity-studio.js
 */

const { createClient } = require('@sanity/client')
const { v4: uuidv4 } = require('uuid')
const fs = require('fs')
const path = require('path')

// Load environment variables from .env.local
const envPath = path.join(__dirname, '..', '.env.local')
let envVars = {}

if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8')
  envContent.split('\n').forEach(line => {
    if (line.trim() && !line.startsWith('#')) {
      const [key, value] = line.split('=')
      if (key && value) {
        envVars[key.trim()] = value.trim()
      }
    }
  })
}

const sanityClient = createClient({
  projectId: envVars.NEXT_PUBLIC_SANITY_PROJECT_ID || '0gbx06x6',
  dataset: envVars.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: '2023-05-03',
  token: envVars.SANITY_API_TOKEN,
  useCdn: false,
})

async function fixSanityStudio() {
  console.log('🔧 Starting emergency Sanity Studio fix...')
  console.log('   This will fix missing _key properties and initialize required fields\n')

  try {
    // Step 1: Fix missing _key properties (critical for Sanity Studio editing)
    console.log('📝 Step 1: Fixing missing variant _key properties...')
    await fixVariantKeys()

    // Step 2: Initialize missing reservedQuantity fields  
    console.log('\n📦 Step 2: Initializing missing reservedQuantity fields...')
    await initializeReservedQuantities()

    // Step 3: Ensure stockQuantity fields exist
    console.log('\n📊 Step 3: Ensuring stockQuantity fields exist...')
    await ensureStockQuantities()

    console.log('\n✅ Emergency fix completed successfully!')
    console.log('   Your Sanity Studio should now work properly for editing products.')
    console.log('   The autonomous inventory system is ready to use.')

  } catch (error) {
    console.error('\n💥 Emergency fix failed:', error)
    process.exit(1)
  }
}

async function fixVariantKeys() {
  try {
    const products = await sanityClient.fetch(`
      *[_type == "product" && defined(variants)] {
        _id,
        title,
        variants[]
      }
    `)

    console.log(`   Found ${products.length} products with variants to check`)
    let fixedCount = 0

    for (const product of products) {
      if (!product.variants || product.variants.length === 0) continue

      let needsUpdate = false
      const updatedVariants = product.variants.map((variant) => {
        if (!variant._key) {
          needsUpdate = true
          console.log(`   Adding missing _key to ${product.title} variant ${variant.size}`)
          return {
            ...variant,
            _key: uuidv4()
          }
        }
        return variant
      })

      if (needsUpdate) {
        await sanityClient
          .patch(product._id)
          .set({ variants: updatedVariants })
          .commit()
        
        fixedCount++
        console.log(`   ✅ Fixed missing keys for: ${product.title}`)
      }
    }

    console.log(`   ✅ Fixed ${fixedCount} products with missing variant keys`)
  } catch (error) {
    console.error('   ❌ Failed to fix variant keys:', error)
    throw error
  }
}

async function initializeReservedQuantities() {
  try {
    const products = await sanityClient.fetch(`
      *[_type == "product"] {
        _id,
        title,
        reservedQuantity,
        variants[]{
          size,
          reservedQuantity
        }
      }
    `)

    console.log(`   Found ${products.length} products to check for reservedQuantity`)
    let fixedCount = 0

    for (const product of products) {
      const transaction = sanityClient.transaction()
      let needsUpdate = false

      // Main product reservedQuantity
      if (product.reservedQuantity === undefined || product.reservedQuantity === null) {
        transaction.patch(product._id, {
          setIfMissing: { reservedQuantity: 0 }
        })
        needsUpdate = true
      }

      // Variant reservedQuantity
      if (product.variants && product.variants.length > 0) {
        product.variants.forEach((variant, index) => {
          if (variant.reservedQuantity === undefined || variant.reservedQuantity === null) {
            transaction.patch(product._id, {
              setIfMissing: { [`variants[${index}].reservedQuantity`]: 0 }
            })
            needsUpdate = true
          }
        })
      }

      if (needsUpdate) {
        await transaction.commit()
        fixedCount++
        console.log(`   ✅ Initialized reservedQuantity for: ${product.title}`)
      }
    }

    console.log(`   ✅ Initialized reservedQuantity for ${fixedCount} products`)
  } catch (error) {
    console.error('   ❌ Failed to initialize reserved quantities:', error)
    throw error
  }
}

async function ensureStockQuantities() {
  try {
    const products = await sanityClient.fetch(`
      *[_type == "product"] {
        _id,
        title,
        stockQuantity,
        variants[]{
          size,
          stockQuantity
        }
      }
    `)

    console.log(`   Found ${products.length} products to check for stockQuantity`)
    let fixedCount = 0

    for (const product of products) {
      const transaction = sanityClient.transaction()
      let needsUpdate = false

      // Main product stockQuantity
      if (product.stockQuantity === undefined || product.stockQuantity === null) {
        transaction.patch(product._id, {
          setIfMissing: { stockQuantity: 0 }
        })
        needsUpdate = true
      }

      // Variant stockQuantity
      if (product.variants && product.variants.length > 0) {
        product.variants.forEach((variant, index) => {
          if (variant.stockQuantity === undefined || variant.stockQuantity === null) {
            transaction.patch(product._id, {
              setIfMissing: { [`variants[${index}].stockQuantity`]: 0 }
            })
            needsUpdate = true
          }
        })
      }

      if (needsUpdate) {
        await transaction.commit()
        fixedCount++
        console.log(`   ✅ Ensured stockQuantity for: ${product.title}`)
      }
    }

    console.log(`   ✅ Ensured stockQuantity for ${fixedCount} products`)
  } catch (error) {
    console.error('   ❌ Failed to ensure stock quantities:', error)
    throw error
  }
}

// Run the fix
fixSanityStudio()