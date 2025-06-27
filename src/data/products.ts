// TODO: Replace with Sanity GROQ query
export interface ProductVariant {
  size: string;
  stockQuantity: number;
  stripePriceId?: string;
}

export interface Product {
  id: string;
  title: string;
  slug: string;
  price: number;
  stockQuantity: number;
  currency: string;
  category: string;
  images: Array<{
    url: string;
    alt: string;
  }>;
  variants?: ProductVariant[];
}

export const products: Product[] = [
  {
    id: "prod_001",
    title: "Niijima Gardens",
    slug: "niijima-gardens",
    price: 45,
    stockQuantity: 10,
    currency: "USD",
    category: "Fiction",
    images: [
      {
        url: "/images/niijima-gardens-cover.jpg",
        alt: "Cover of Niijima Gardens by Charlie Hillhouse",
      },
      {
        url: "/images/niijima-gardens-excerpt.jpg",
        alt: "Image from Niijima Gardens by Charlie Hillhouse",
      },
    ],
  },
  {
    id: "prod_002",
    title: "Courier",
    slug: "courier",
    price: 35,
    stockQuantity: 8,
    currency: "USD",
    category: "Fiction",
    images: [
      {
        url: "/images/courier-cover.jpg",
        alt: "Cover of Courier by Julian Hutton",
      },
      {
        url: "/images/courier-excerpt.jpg",
        alt: "Image from Courier by Julian Hutton",
      },
    ],
  },
  {
    id: "prod_003",
    title: "Let's Get Together",
    slug: "lets-get-together",
    price: 40,
    stockQuantity: 12,
    currency: "USD",
    category: "Poetry",
    images: [
      {
        url: "/images/lgt-cover.jpg",
        alt: "Cover of Let's Get Together by Lynette Letic",
      },
      {
        url: "/images/lgt-excerpt.jpg",
        alt: "Image from Let's Get Together by Lynette Letic",
      },
    ],
  },
  {
    id: "prod_004",
    title: "Ink Drawings",
    slug: "ink-drawings",
    price: 50,
    stockQuantity: 5,
    currency: "USD",
    category: "Horror",
    images: [
      {
        url: "/images/sk-spread.jpg",
        alt: "Photograph of person looking at book spread",
      },
    ],
  },
  {
    id: "prod_005",
    title: "Tote Bag in Black",
    slug: "tote-bag-black",
    price: 25,
    stockQuantity: 0,
    currency: "USD",
    category: "Apparel",
    images: [
      {
        url: "/images/sb-tote-shot.jpg",
        alt: "Image of person holding black tote bag",
      },
      { url: "/images/sb-tote-blk.jpg", alt: "Black tote bag with white text" },
    ],
  },
];

// TODO: Replace with Sanity GROQ query
export const categories = ["All", "Fiction", "Poetry", "Horror", "Apparel"];
