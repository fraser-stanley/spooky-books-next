const { createClient } = require('@sanity/client')

const client = createClient({
  projectId: '0gbx06x6',
  dataset: 'production', 
  apiVersion: '2023-01-01',
  token: 'skCnBuw04cFesFn1YhGeoyoH0JfyOfFRz2WRy37fopR5pfacLmatgXmZA2fieSTHrllDOO0KZVSxB9wQoLlkLHQVm5q94mDSyGVlQ1WOH1NYZdzaWuc1IcQPIVrxU7cj2AiyBvVo9xMdMd0o8oBxQpTfgRp4kOAF02AdWR8dpGgVDFhjpO4b',
  useCdn: false
})

async function createHomepage() {
  try {
    console.log('Creating homepage document...')
    
    // First, let's get some products to link to
    const products = await client.fetch(`
      *[_type == "product"] | order(_createdAt asc) [0...3] {
        _id,
        title,
        slug,
        category->{slug},
        images[0] {
          asset->,
          alt
        }
      }
    `)
    
    console.log('Found products:', products.map(p => p.title))
    
    if (products.length === 0) {
      console.log('No products found. Please create some products first.')
      return
    }
    
    // Filter products that have images
    const productsWithImages = products.filter(p => p.images && p.images.asset)
    
    if (productsWithImages.length === 0) {
      console.log('No products with images found. Cannot create homepage.')
      return
    }
    
    // Create homepage document with placeholder content based on original design
    const homepageDoc = {
      _id: 'homepage',
      _type: 'homepage',
      title: 'Spooky Books Homepage',
      heroSections: []
    }
    
    // Add first hero pair if we have a product with images
    if (productsWithImages[0]) {
      homepageDoc.heroSections.push({
        _type: 'heroPair',
        _key: 'hero1',
        title: productsWithImages[0].title,
        caption: 'A featured publication from our collection.',
        leftImage: {
          _type: 'image',
          asset: productsWithImages[0].images.asset,
          alt: productsWithImages[0].images.alt || 'Product image'
        },
        rightImage: {
          _type: 'image', 
          asset: productsWithImages[0].images.asset,
          alt: productsWithImages[0].images.alt || 'Product detail'
        },
        linkedProduct: {
          _type: 'reference',
          _ref: productsWithImages[0]._id
        }
      })
    }
    
    // Add second hero single if we have another product
    if (productsWithImages[1]) {
      homepageDoc.heroSections.push({
        _type: 'heroSingle',
        _key: 'hero2', 
        title: productsWithImages[1].title,
        caption: 'Another featured work from our catalog.',
        image: {
          _type: 'image',
          asset: productsWithImages[1].images.asset,
          alt: productsWithImages[1].images.alt || 'Product image'
        },
        linkedProduct: {
          _type: 'reference',
          _ref: productsWithImages[1]._id
        }
      })
    }
    
    const result = await client.createOrReplace(homepageDoc)
    console.log('Homepage created successfully:', result._id)
    
  } catch (error) {
    console.error('Error creating homepage:', error)
  }
}

createHomepage()