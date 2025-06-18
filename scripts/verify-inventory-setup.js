#!/usr/bin/env node

/**
 * Verification script for inventory system setup
 * Checks that all products are properly configured for the autonomous inventory system
 * Usage: node scripts/verify-inventory-setup.js
 */

const { createClient } = require('@sanity/client')
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

async function verifyInventorySetup() {
  console.log('🔍 Verifying inventory system setup...')
  console.log('   This will check that all products are properly configured\n')

  const results = {
    totalProducts: 0,
    variantKeyIssues: [],
    reservedQuantityIssues: [],
    stockQuantityIssues: [],
    stripeIntegrationIssues: [],
    categoryIssues: []
  }

  try {
    // Get all products for comprehensive verification
    console.log('📦 Fetching all products for verification...')
    const products = await sanityClient.fetch(`
      *[_type == "product"] {
        _id,
        title,
        slug,
        stockQuantity,
        reservedQuantity,
        stripePriceId,
        stripeProductId,
        category->{title, "slug": slug.current},
        variants[]{
          _key,
          size,
          stockQuantity,
          reservedQuantity,
          stripePriceId
        }
      }
    `)

    results.totalProducts = products.length
    console.log(`   Found ${products.length} products to verify\n`)

    // Verification checks
    console.log('🔍 Running verification checks...\n')

    for (const product of products) {
      await verifyProduct(product, results)
    }

    // Print results
    printVerificationResults(results)

  } catch (error) {
    console.error('\n💥 Verification failed:', error)
    process.exit(1)
  }
}

async function verifyProduct(product, results) {
  const productName = product.title || `Product ${product._id}`

  // 1. Check variant _key properties
  if (product.variants && product.variants.length > 0) {
    for (const variant of product.variants) {
      if (!variant._key) {
        results.variantKeyIssues.push({
          product: productName,
          issue: `Variant ${variant.size} missing _key property`
        })
      }
    }
  }

  // 2. Check reservedQuantity fields
  if (product.reservedQuantity === undefined || product.reservedQuantity === null) {
    results.reservedQuantityIssues.push({
      product: productName,
      issue: 'Missing main reservedQuantity field'
    })
  }

  if (product.variants && product.variants.length > 0) {
    for (const variant of product.variants) {
      if (variant.reservedQuantity === undefined || variant.reservedQuantity === null) {
        results.reservedQuantityIssues.push({
          product: productName,
          issue: `Variant ${variant.size} missing reservedQuantity field`
        })
      }
    }
  }

  // 3. Check stockQuantity fields
  if (product.stockQuantity === undefined || product.stockQuantity === null) {
    results.stockQuantityIssues.push({
      product: productName,
      issue: 'Missing main stockQuantity field'
    })
  }

  if (product.variants && product.variants.length > 0) {
    for (const variant of product.variants) {
      if (variant.stockQuantity === undefined || variant.stockQuantity === null) {
        results.stockQuantityIssues.push({
          product: productName,
          issue: `Variant ${variant.size} missing stockQuantity field`
        })
      }
    }
  }

  // 4. Check Stripe integration
  const isApparel = product.category?.title?.toLowerCase() === 'apparel'
  const hasVariants = product.variants && product.variants.length > 0

  if (isApparel && hasVariants) {
    // For apparel with variants, check variant Stripe prices
    for (const variant of product.variants) {
      if (!variant.stripePriceId) {
        results.stripeIntegrationIssues.push({
          product: productName,
          issue: `Variant ${variant.size} missing Stripe price ID`
        })
      }
    }
  } else {
    // For simple products, check main Stripe price
    if (!product.stripePriceId) {
      results.stripeIntegrationIssues.push({
        product: productName,
        issue: 'Missing main Stripe price ID'
      })
    }
  }

  // 5. Check category assignment
  if (!product.category) {
    results.categoryIssues.push({
      product: productName,
      issue: 'No category assigned'
    })
  }
}

function printVerificationResults(results) {
  console.log('📊 Verification Results')
  console.log('========================\n')

  console.log(`Total Products: ${results.totalProducts}`)
  
  const totalIssues = results.variantKeyIssues.length + 
                     results.reservedQuantityIssues.length + 
                     results.stockQuantityIssues.length + 
                     results.stripeIntegrationIssues.length + 
                     results.categoryIssues.length

  if (totalIssues === 0) {
    console.log('\n✅ ALL CHECKS PASSED!')
    console.log('   Your inventory system is properly configured and ready to use.')
    console.log('   All products should work correctly with the autonomous inventory system.')
    return
  }

  console.log(`\n⚠️  Found ${totalIssues} issues that need attention:\n`)

  // Variant key issues (critical for Sanity Studio)
  if (results.variantKeyIssues.length > 0) {
    console.log(`❌ Variant Key Issues (${results.variantKeyIssues.length}):`)
    results.variantKeyIssues.forEach(issue => {
      console.log(`   • ${issue.product}: ${issue.issue}`)
    })
    console.log('   ⚡ Fix: Run the emergency fix script again\n')
  }

  // Reserved quantity issues (critical for inventory management)
  if (results.reservedQuantityIssues.length > 0) {
    console.log(`❌ Reserved Quantity Issues (${results.reservedQuantityIssues.length}):`)
    results.reservedQuantityIssues.forEach(issue => {
      console.log(`   • ${issue.product}: ${issue.issue}`)
    })
    console.log('   ⚡ Fix: Run the emergency fix script again\n')
  }

  // Stock quantity issues (important for inventory tracking)
  if (results.stockQuantityIssues.length > 0) {
    console.log(`⚠️  Stock Quantity Issues (${results.stockQuantityIssues.length}):`)
    results.stockQuantityIssues.forEach(issue => {
      console.log(`   • ${issue.product}: ${issue.issue}`)
    })
    console.log('   ⚡ Fix: Set stock quantities in Sanity Studio\n')
  }

  // Stripe integration issues (affects payment processing)
  if (results.stripeIntegrationIssues.length > 0) {
    console.log(`💳 Stripe Integration Issues (${results.stripeIntegrationIssues.length}):`)
    results.stripeIntegrationIssues.forEach(issue => {
      console.log(`   • ${issue.product}: ${issue.issue}`)
    })
    console.log('   ⚡ Fix: Trigger Sanity webhook by saving products in Studio\n')
  }

  // Category issues (affects product organization)
  if (results.categoryIssues.length > 0) {
    console.log(`🏷️  Category Issues (${results.categoryIssues.length}):`)
    results.categoryIssues.forEach(issue => {
      console.log(`   • ${issue.product}: ${issue.issue}`)
    })
    console.log('   ⚡ Fix: Assign categories in Sanity Studio\n')
  }

  console.log('🔧 Recommended Actions:')
  console.log('   1. Run: node scripts/fix-sanity-studio.js (if variant or reserved quantity issues)')
  console.log('   2. Visit Sanity Studio to set stock quantities and categories')
  console.log('   3. Save/republish products to trigger Stripe integration')
  console.log('   4. Run this verification again to confirm fixes\n')
}

// Run the verification
verifyInventorySetup()