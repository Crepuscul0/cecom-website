import { getPayload } from 'payload'
import config from '../../../payload.config'

// Initialize Payload
let payload: any = null

const getPayloadInstance = async () => {
  if (!payload) {
    payload = await getPayload({ config })
  }
  return payload
}

// Categories API functions
export const getCategories = async (locale: 'en' | 'es' = 'en') => {
  const payloadInstance = await getPayloadInstance()
  
  const categories = await payloadInstance.find({
    collection: 'categories',
    locale,
    sort: 'order',
    limit: 100,
  })
  
  return categories.docs
}

export const getCategoryBySlug = async (slug: string, locale: 'en' | 'es' = 'en') => {
  const payloadInstance = await getPayloadInstance()
  
  const category = await payloadInstance.find({
    collection: 'categories',
    where: {
      slug: {
        equals: slug,
      },
    },
    locale,
    limit: 1,
  })
  
  return category.docs[0] || null
}

// Products API functions
export const getProducts = async (locale: 'en' | 'es' = 'en', categoryId?: string) => {
  const payloadInstance = await getPayloadInstance()
  
  const where: any = {
    active: {
      equals: true,
    },
  }
  
  if (categoryId) {
    where.category = {
      equals: categoryId,
    }
  }
  
  const products = await payloadInstance.find({
    collection: 'products',
    where,
    locale,
    sort: 'order',
    depth: 2, // Include related data
  })
  
  return products.docs
}

export const getProductById = async (id: string, locale: 'en' | 'es' = 'en') => {
  const payloadInstance = await getPayloadInstance()
  
  const product = await payloadInstance.findByID({
    collection: 'products',
    id,
    locale,
    depth: 2, // Include related data
  })
  
  return product
}

// Vendors API functions
export const getVendors = async () => {
  const payloadInstance = await getPayloadInstance()
  
  const vendors = await payloadInstance.find({
    collection: 'vendors',
    sort: 'name',
    depth: 1, // Include logo data
    limit: 100,
  })
  
  return vendors.docs
}

export const getVendorById = async (id: string, locale: 'en' | 'es' = 'en') => {
  const payloadInstance = await getPayloadInstance()
  
  const vendor = await payloadInstance.findByID({
    collection: 'vendors',
    id,
    locale,
    depth: 1, // Include logo data
  })
  
  return vendor
}

// Pages API functions
export const getPageBySlug = async (slug: string, locale: 'en' | 'es' = 'en') => {
  const payloadInstance = await getPayloadInstance()
  
  const page = await payloadInstance.find({
    collection: 'pages',
    where: {
      slug: {
        equals: slug,
      },
    },
    locale,
    limit: 1,
    depth: 1, // Include images data
  })
  
  return page.docs[0] || null
}

export const getPagesByType = async (type: string, locale: 'en' | 'es' = 'en') => {
  const payloadInstance = await getPayloadInstance()
  
  const pages = await payloadInstance.find({
    collection: 'pages',
    where: {
      type: {
        equals: type,
      },
    },
    locale,
    depth: 1, // Include images data
  })
  
  return pages.docs
}

// News articles API functions
export const getNewsArticles = async (vendorId?: string, limit: number = 10) => {
  const payloadInstance = await getPayloadInstance()
  
  const where: any = {}
  
  if (vendorId) {
    where.vendor = {
      equals: vendorId,
    }
  }
  
  const articles = await payloadInstance.find({
    collection: 'news-articles',
    where,
    sort: '-publishedAt',
    limit,
    depth: 1, // Include vendor and image data
  })
  
  return articles.docs
}

// Search function
export const searchContent = async (query: string, locale: 'en' | 'es' = 'en') => {
  const payloadInstance = await getPayloadInstance()
  
  // Search across products and pages
  const [products, pages] = await Promise.all([
    payloadInstance.find({
      collection: 'products',
      where: {
        and: [
          {
            active: {
              equals: true,
            },
          },
          {
            or: [
              {
                name: {
                  like: query,
                },
              },
              {
                description: {
                  like: query,
                },
              },
            ],
          },
        ],
      },
      locale,
      depth: 2, // Include category and vendor data
    }),
    payloadInstance.find({
      collection: 'pages',
      where: {
        or: [
          {
            title: {
              like: query,
            },
          },
          {
            content: {
              like: query,
            },
          },
        ],
      },
      locale,
      depth: 1,
    }),
  ])
  
  return {
    products: products.docs,
    pages: pages.docs,
  }
}

// Additional utility functions
export const getProductsByCategory = async (categorySlug: string, locale: 'en' | 'es' = 'en') => {
  const payloadInstance = await getPayloadInstance()
  
  // First get the category
  const category = await getCategoryBySlug(categorySlug, locale)
  if (!category) return []
  
  // Then get products in that category
  return getProducts(locale, category.id)
}

export const getProductsByVendor = async (vendorId: string, locale: 'en' | 'es' = 'en') => {
  const payloadInstance = await getPayloadInstance()
  
  const products = await payloadInstance.find({
    collection: 'products',
    where: {
      and: [
        {
          active: {
            equals: true,
          },
        },
        {
          vendor: {
            equals: vendorId,
          },
        },
      ],
    },
    locale,
    sort: 'order',
    depth: 2,
  })
  
  return products.docs
}

// Statistics and admin functions
export const getCollectionCounts = async () => {
  const payloadInstance = await getPayloadInstance()
  
  const collections = ['categories', 'vendors', 'products', 'pages', 'news-articles', 'media', 'users']
  const counts: Record<string, number> = {}
  
  for (const collection of collections) {
    const result = await payloadInstance.find({
      collection,
      limit: 0, // Just get count
    })
    counts[collection] = result.totalDocs
  }
  
  return counts
}