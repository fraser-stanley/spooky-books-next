import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@sanity/client'

const sanityClient = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
  token: process.env.SANITY_API_TOKEN!,
  apiVersion: '2023-05-03',
  useCdn: false,
})

export async function POST(request: NextRequest) {
  try {
    // Check existing categories
    const existingCategories = await sanityClient.fetch(`
      *[_type == "category"] {
        _id,
        title,
        slug
      }
    `)

    console.log(`Found ${existingCategories.length} existing categories`)

    const results = []

    // Define the two categories we need
    const requiredCategories = [
      {
        title: 'Publications',
        slug: { current: 'publications' },
        description: 'Books, magazines, and other publications',
        sortOrder: 1
      },
      {
        title: 'Apparel',
        slug: { current: 'apparel' },
        description: 'T-shirts, hoodies, and clothing items',
        sortOrder: 2
      }
    ]

    for (const category of requiredCategories) {
      // Check if category already exists
      const existing = existingCategories.find(cat => cat.title === category.title)
      
      if (!existing) {
        console.log(`Creating category: ${category.title}`)
        
        const newCategory = await sanityClient.create({
          _type: 'category',
          ...category
        })

        results.push({
          title: category.title,
          status: 'created',
          id: newCategory._id
        })
      } else {
        console.log(`Category already exists: ${category.title}`)
        results.push({
          title: category.title,
          status: 'exists',
          id: existing._id
        })
      }
    }

    return NextResponse.json({
      success: true,
      message: `Setup complete. ${results.filter(r => r.status === 'created').length} categories created.`,
      categories: results,
      existing: existingCategories
    })

  } catch (error) {
    console.error('Category setup error:', error)
    
    return NextResponse.json(
      { 
        error: 'Failed to setup categories',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const categories = await sanityClient.fetch(`
      *[_type == "category"] | order(sortOrder asc) {
        _id,
        title,
        slug,
        description,
        sortOrder
      }
    `)

    return NextResponse.json({
      categories,
      count: categories.length
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch categories' },
      { status: 500 }
    )
  }
}