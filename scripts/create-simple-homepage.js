const { createClient } = require('@sanity/client')

const client = createClient({
  projectId: '0gbx06x6',
  dataset: 'production', 
  apiVersion: '2023-01-01',
  token: 'skCnBuw04cFesFn1YhGeoyoH0JfyOfFRz2WRy37fopR5pfacLmatgXmZA2fieSTHrllDOO0KZVSxB9wQoLlkLHQVm5q94mDSyGVlQ1WOH1NYZdzaWuc1IcQPIVrxU7cj2AiyBvVo9xMdMd0o8oBxQpTfgRp4kOAF02AdWR8dpGgVDFhjpO4b',
  useCdn: false
})

async function createSimpleHomepage() {
  try {
    console.log('Creating simple homepage document...')
    
    // Get products
    const products = await client.fetch(`
      *[_type == "product"] | order(_createdAt asc) [0...2] {
        _id,
        title,
        slug,
        category->{slug, title}
      }
    `)
    
    console.log('Found products:', products.map(p => p.title))
    
    if (products.length === 0) {
      console.log('No products found. Please create some products first.')
      return
    }
    
    // Create simple homepage document without images for now
    // This will serve as placeholder content that can be edited in the studio
    const homepageDoc = {
      _id: 'homepage',
      _type: 'homepage',
      title: 'Spooky Books Homepage',
      heroSections: [
        // First hero pair - will need images added later
        {
          _type: 'heroPair',
          _key: 'hero1',
          title: products[0]?.title || 'Featured Publication',
          caption: 'A featured publication from our collection. Click to add images and customize in Sanity Studio.',
          linkedProduct: {
            _type: 'reference',
            _ref: products[0]?._id
          }
          // leftImage and rightImage will be null initially - user can add through studio
        }
      ]
    }
    
    // Add second section if we have more products
    if (products.length > 1) {
      homepageDoc.heroSections.push({
        _type: 'heroSingle',
        _key: 'hero2', 
        title: products[1]?.title || 'Another Publication',
        caption: 'Another featured work from our catalog. Add an image through the visual editor.',
        linkedProduct: {
          _type: 'reference',
          _ref: products[1]?._id
        }
        // image will be null initially - user can add through studio
      })
    }
    
    const result = await client.createOrReplace(homepageDoc)
    console.log('Simple homepage created successfully:', result._id)
    console.log('You can now add images through the Sanity Studio visual editor.')
    
  } catch (error) {
    console.error('Error creating homepage:', error)
  }
}

createSimpleHomepage()