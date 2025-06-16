const { createClient } = require('@sanity/client')

const client = createClient({
  projectId: '0gbx06x6',
  dataset: 'production', 
  apiVersion: '2023-01-01',
  token: 'skCnBuw04cFesFn1YhGeoyoH0JfyOfFRz2WRy37fopR5pfacLmatgXmZA2fieSTHrllDOO0KZVSxB9wQoLlkLHQVm5q94mDSyGVlQ1WOH1NYZdzaWuc1IcQPIVrxU7cj2AiyBvVo9xMdMd0o8oBxQpTfgRp4kOAF02AdWR8dpGgVDFhjpO4b',
  useCdn: false
})

async function testHomepageQuery() {
  try {
    console.log('Testing homepage query...')
    
    const homepageQuery = `*[_type == "homepage"][0]{
      title,
      heroSections[]{
        _type,
        _type == "heroPair" => {
          leftImage{
            asset->{
              _id,
              url,
              metadata{
                dimensions
              }
            },
            alt
          },
          rightImage{
            asset->{
              _id,
              url,
              metadata{
                dimensions
              }
            },
            alt
          },
          linkedProduct->{
            _id,
            title,
            "slug": slug.current,
            category->{
              title,
              "slug": slug.current
            }
          },
          title,
          caption
        },
        _type == "heroSingle" => {
          image{
            asset->{
              _id,
              url,
              metadata{
                dimensions
              }
            },
            alt
          },
          linkedProduct->{
            _id,
            title,
            "slug": slug.current,
            category->{
              title,
              "slug": slug.current
            }
          },
          title,
          caption
        }
      }
    }`
    
    const homepage = await client.fetch(homepageQuery)
    console.log('Homepage data:', JSON.stringify(homepage, null, 2))
    
    if (!homepage) {
      console.log('No homepage document found!')
      return
    }
    
    if (!homepage.heroSections || homepage.heroSections.length === 0) {
      console.log('No hero sections found!')
      return
    }
    
    console.log(`Found ${homepage.heroSections.length} hero sections:`)
    homepage.heroSections.forEach((section, index) => {
      console.log(`Section ${index + 1}:`)
      console.log(`  Type: ${section._type}`)
      console.log(`  Title: ${section.title}`)
      console.log(`  Caption: ${section.caption}`)
      console.log(`  Linked Product: ${section.linkedProduct?.title}`)
      console.log('')
    })
    
  } catch (error) {
    console.error('Error testing homepage query:', error)
  }
}

testHomepageQuery()