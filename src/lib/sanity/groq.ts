export const productQuery = `*[_type == "product" && slug.current == $slug][0]{
  "id": slug.current,
  title,
  author,
  description,
  richDescription,
  price,
  stockQuantity,
  reservedQuantity,
  hasSizes,
  category->{
    title,
    "slug": slug.current
  },
  "slug": slug.current,
  "heroImage": heroImage.asset->url,
  "secondaryImages": secondaryImages[].asset->url,
  variants[]{
    size,
    stockQuantity,
    reservedQuantity,
    stripePriceId
  }
}`

export const productsQuery = `*[_type == "product"]{
  "id": slug.current,
  title,
  author,
  description,
  richDescription,
  price,
  stockQuantity,
  reservedQuantity,
  hasSizes,
  category->{
    title,
    "slug": slug.current
  },
  "slug": slug.current,
  "heroImage": heroImage.asset->url,
  variants[]{
    size,
    stockQuantity,
    reservedQuantity,
    stripePriceId
  }
}`

export const productsByCategoryQuery = `*[_type == "product" && category->slug.current == $categorySlug]{
  "id": slug.current,
  title,
  author,
  description,
  richDescription,
  price,
  stockQuantity,
  reservedQuantity,
  hasSizes,
  category->{
    title,
    "slug": slug.current
  },
  "slug": slug.current,
  "heroImage": heroImage.asset->url,
  variants[]{
    size,
    stockQuantity,
    reservedQuantity,
    stripePriceId
  }
}`

export const categoriesQuery = `*[_type == "category"] | order(sortOrder asc, title asc){
  title,
  "slug": slug.current,
  description,
  sortOrder
}`

export const homepageQuery = `*[_type == "homepage"][0]{
  title,
  contentBlocks[]{
    _type,
    layout,
    title,
    caption,
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
      author,
      "slug": slug.current,
      category->{
        title,
        "slug": slug.current
      }
    },
    customLink{
      url,
      text
    }
  },
  heroSections[]{
    _type,
    layout,
    title,
    caption,
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
      author,
      "slug": slug.current,
      category->{
        title,
        "slug": slug.current
      }
    }
  }
}`