import { PortableTextBlock } from "@portabletext/types";

export interface SanityCategory {
  title: string;
  slug: string;
  description?: string;
  sortOrder: number;
}

export interface ProductVariant {
  size: string;
  stockQuantity: number;
  reservedQuantity?: number;
  stripePriceId?: string;
}

export interface SanityProduct {
  id: string;
  title: string;
  author: string;
  slug: string;
  richDescription?: PortableTextBlock[]; // Rich text description
  metadata?: string; // Technical details like ISBN, size, materials, binding, etc.
  price: number;
  stockQuantity: number;
  reservedQuantity?: number;
  stripePriceId?: string;
  hasSizes?: boolean;
  category: SanityCategory;
  heroImage: string;
  secondaryImages?: string[];
  variants?: ProductVariant[];
}

export interface SanityImage {
  asset: {
    _id: string;
    url: string;
    metadata: {
      dimensions: {
        width: number;
        height: number;
      };
    };
  };
  alt?: string;
}

export interface SanityContentBlock {
  _type: "contentBlock";
  layout: "two" | "three" | "full";
  title: string;
  caption?: string;
  leftImage: SanityImage;
  rightImage?: SanityImage;
  linkType?: "none" | "product" | "custom";
  linkedProduct?: {
    _id: string;
    title: string;
    slug: string;
    category: SanityCategory;
  };
  customLink?: {
    url: string;
    text?: string;
    openInNewTab?: boolean;
  };
}

export interface SanityHomepage {
  title: string;
  contentBlocks?: SanityContentBlock[];
}
