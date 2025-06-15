// TODO: Replace with Sanity GROQ query
export interface ProductVariant {
  size: string
  stockQuantity: number
  stripePriceId?: string
}

export interface Product {
  id: string
  title: string
  slug: string
  price: number
  stockQuantity: number
  currency: string
  category: string
  images: Array<{
    url: string
    alt: string
  }>
  description: string
  variants?: ProductVariant[]
}

export const products: Product[] = [
  {
    id: "prod_001",
    title: "Niijima Gardens",
    slug: "niijima-gardens",
    price: 45,
    currency: "USD",
    category: "Fiction",
    images: [
      { url: "/images/niijima-gardens-cover.jpg", alt: "Cover of Niijima Gardens by Charlie Hillhouse" },
      { url: "/images/niijima-gardens-excerpt.jpg", alt: "Image from Niijima Gardens by Charlie Hillhouse" }
    ],
    description: "A photobook by Charlie Hillhouse",
    vendor: "Spooky Books"
  },
  {
    id: "prod_002",
    title: "Courier",
    slug: "courier",
    price: 35,
    currency: "USD",
    category: "Fiction",
    images: [
      { url: "/images/courier-cover.jpg", alt: "Cover of Courier by Julian Hutton" },
      { url: "/images/courier-excerpt.jpg", alt: "Image from Courier by Julian Hutton" }
    ],
    description: "A novel by Julian Hutton",
    vendor: "Spooky Books"
  },
  {
    id: "prod_003",
    title: "Let's Get Together",
    slug: "lets-get-together",
    price: 40,
    currency: "USD",
    category: "Poetry",
    images: [
      { url: "/images/lgt-cover.jpg", alt: "Cover of Let's Get Together by Lynette Letic" },
      { url: "/images/lgt-excerpt.jpg", alt: "Image from Let's Get Together by Lynette Letic" }
    ],
    description: "Poetry collection by Lynette Letic",
    vendor: "Spooky Books"
  },
  {
    id: "prod_004",
    title: "Ink Drawings",
    slug: "ink-drawings",
    price: 50,
    currency: "USD",
    category: "Horror",
    images: [
      { url: "/images/sk-spread.jpg", alt: "Photograph of person looking at book spread" }
    ],
    description: "Ink drawings by Scott Keim",
    vendor: "Spooky Books"
  },
  {
    id: "prod_005",
    title: "Tote Bag in Black",
    slug: "tote-bag-black",
    price: 25,
    currency: "USD",
    category: "Apparel",
    images: [
      { url: "/images/sb-tote-shot.jpg", alt: "Image of person holding black tote bag" },
      { url: "/images/sb-tote-blk.jpg", alt: "Black tote bag with white text" }
    ],
    description: "Black canvas tote bag with Spooky Books branding",
    vendor: "Spooky Books"
  }
]

// TODO: Replace with Sanity GROQ query
export const categories = ["All", "Fiction", "Poetry", "Horror", "Apparel"]