import { PortableTextBlock } from '@portabletext/types'

export interface SanityCategory {
  title: string
  slug: string
  description?: string
  sortOrder: number
}

export interface ProductVariant {
  size: string
  stockQuantity: number
  reservedQuantity?: number
  stripePriceId?: string
}

export interface SanityProduct {
  id: string
  title: string
  author: string
  slug: string
  description: string // Legacy plaintext description
  richDescription?: PortableTextBlock[] // New rich text description
  price: number
  stockQuantity: number
  reservedQuantity?: number
  stripePriceId?: string
  hasSizes?: boolean
  category: SanityCategory
  heroImage: string
  secondaryImages?: string[]
  variants?: ProductVariant[]
}

export interface SanityImage {
  asset: {
    _id: string
    url: string
    metadata: {
      dimensions: {
        width: number
        height: number
      }
    }
  }
  alt?: string
}

export interface SanityHeroPair {
  _type: 'heroPair'
  layout: 'two' | 'three'
  leftImage: SanityImage
  rightImage: SanityImage
  linkedProduct: {
    _id: string
    title: string
    author?: string
    slug: string
    category: SanityCategory
  }
  title: string
  caption?: string
}

export interface SanityHeroSingle {
  _type: 'heroSingle'
  image: SanityImage
  linkedProduct: {
    _id: string
    title: string
    author?: string
    slug: string
    category: SanityCategory
  }
  title: string
  caption?: string
}

export type SanityHeroSection = SanityHeroPair | SanityHeroSingle

export interface SanityHomepage {
  title: string
  heroSections: SanityHeroSection[]
}