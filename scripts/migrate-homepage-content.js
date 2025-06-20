/**
 * Migration script to convert existing heroSections to new contentBlocks format
 * Run this once to migrate your existing homepage content
 */

const { createClient } = require('@sanity/client')

// Hard-coded values for this migration script
const client = createClient({
  projectId: '0gbx06x6',
  dataset: 'production',
  useCdn: false,
  token: process.env.SANITY_API_TOKEN, // This should be available from your environment
  apiVersion: '2024-01-01',
})

async function migrateHomepageContent() {
  console.log('🔄 Starting homepage content migration...')
  
  try {
    // Fetch current homepage document
    const homepage = await client.fetch(`*[_type == "homepage"][0]`)
    
    if (!homepage) {
      console.log('❌ No homepage document found')
      return
    }
    
    console.log(`📋 Found homepage with ${homepage.heroSections?.length || 0} hero sections`)
    
    if (!homepage.heroSections || homepage.heroSections.length === 0) {
      console.log('ℹ️ No hero sections to migrate')
      return
    }
    
    // Convert heroSections to contentBlocks
    const contentBlocks = homepage.heroSections.map((section, index) => {
      console.log(`🔄 Converting section ${index + 1}: ${section._type}`)
      
      if (section._type === 'heroPair') {
        return {
          _type: 'contentBlock',
          _key: `migrated-${index}-${Date.now()}`,
          layout: section.layout || 'three', // Use existing layout or default to 3-column
          title: section.title,
          caption: section.caption || undefined,
          leftImage: section.leftImage,
          rightImage: section.rightImage,
          linkedProduct: section.linkedProduct ? {
            _type: 'reference',
            _ref: section.linkedProduct._id || section.linkedProduct._ref,
          } : undefined,
        }
      } else if (section._type === 'heroSingle') {
        return {
          _type: 'contentBlock',
          _key: `migrated-${index}-${Date.now()}`,
          layout: 'full', // Single images become full-width
          title: section.title,
          caption: section.caption || undefined,
          leftImage: section.image, // Single image becomes leftImage
          linkedProduct: section.linkedProduct ? {
            _type: 'reference',
            _ref: section.linkedProduct._id || section.linkedProduct._ref,
          } : undefined,
        }
      }
    }).filter(Boolean) // Remove any undefined entries
    
    console.log(`✅ Converted ${contentBlocks.length} sections to content blocks`)
    
    // Update the homepage document
    const result = await client
      .patch(homepage._id)
      .set({ contentBlocks })
      .commit()
    
    console.log('✅ Migration completed successfully!')
    console.log(`📊 Migrated ${contentBlocks.length} content blocks`)
    console.log('🎯 You can now use the new Content Blocks interface in Sanity Studio')
    console.log('📝 The old Hero Sections are preserved for safety - you can remove them later')
    
    return result
    
  } catch (error) {
    console.error('❌ Migration failed:', error)
    throw error
  }
}

// Run the migration
migrateHomepageContent()
  .then(() => {
    console.log('🎉 Migration script completed')
    process.exit(0)
  })
  .catch((error) => {
    console.error('💥 Migration script failed:', error)
    process.exit(1)
  })