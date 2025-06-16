const { createClient } = require('@sanity/client')

const client = createClient({
  projectId: '0gbx06x6',
  dataset: 'production', 
  apiVersion: '2023-01-01',
  token: 'skCnBuw04cFesFn1YhGeoyoH0JfyOfFRz2WRy37fopR5pfacLmatgXmZA2fieSTHrllDOO0KZVSxB9wQoLlkLHQVm5q94mDSyGVlQ1WOH1NYZdzaWuc1IcQPIVrxU7cj2AiyBvVo9xMdMd0o8oBxQpTfgRp4kOAF02AdWR8dpGgVDFhjpO4b',
  useCdn: false
})

async function checkProducts() {
  try {
    const products = await client.fetch(`
      *[_type == "product"] {
        _id,
        title,
        slug,
        category->{slug, title},
        images,
        "imageCount": length(images)
      }
    `)
    
    console.log('Products in Sanity:')
    products.forEach(product => {
      console.log(`- ${product.title}`)
      console.log(`  ID: ${product._id}`)
      console.log(`  Category: ${product.category?.title || 'No category'}`)
      console.log(`  Images: ${product.imageCount || 0}`)
      if (product.images && product.images.length > 0) {
        product.images.forEach((img, idx) => {
          console.log(`    Image ${idx + 1}: ${img.asset ? 'Has asset' : 'No asset'} - Alt: ${img.alt || 'No alt'}`)
        })
      }
      console.log('')
    })
    
  } catch (error) {
    console.error('Error checking products:', error)
  }
}

checkProducts()