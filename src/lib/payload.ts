import { getPayloadHMR } from '@payloadcms/next/utilities'
import configPromise from '../../payload.config'

export const getPayload = async () => {
  const payload = await getPayloadHMR({ config: configPromise })
  return payload
}

// Blog Posts
export interface BlogPost {
  id: string
  title: string
  slug: string
  excerpt: string
  content: any
  featuredImage?: {
    url: string
    alt: string
  }
  category: {
    name: string
    slug: string
    color?: string
  }
  tags: Array<{
    name: string
    slug: string
  }>
  author: {
    firstName: string
    lastName: string
    email: string
  }
  publishedDate: string
  readingTime?: number
  status: 'draft' | 'published' | 'archived'
  seo?: {
    metaTitle?: string
    metaDescription?: string
    keywords?: string
  }
  createdAt: string
  updatedAt: string
}

export interface BlogCategory {
  id: string
  name: string
  slug: string
  description?: string
  color?: string
}

export interface BlogTag {
  id: string
  name: string
  slug: string
}

// Fetch blog posts with filtering and pagination
export async function getBlogPosts({
  locale = 'en',
  limit = 10,
  page = 1,
  category,
  tag,
  status = 'published',
  search,
}: {
  locale?: string
  limit?: number
  page?: number
  category?: string
  tag?: string
  status?: 'draft' | 'published' | 'archived'
  search?: string
} = {}): Promise<{
  docs: BlogPost[]
  totalDocs: number
  totalPages: number
  page: number
  hasNextPage: boolean
  hasPrevPage: boolean
}> {
  try {
    const payload = await getPayload()
    
    const where: any = {
      status: { equals: status }
    }

    // Filter by category
    if (category) {
      where['category.slug'] = { equals: category }
    }

    // Filter by tag
    if (tag) {
      where['tags.slug'] = { in: [tag] }
    }

    // Search functionality
    if (search) {
      where.or = [
        { title: { contains: search } },
        { excerpt: { contains: search } },
        { 'seo.keywords': { contains: search } }
      ]
    }

    const result = await payload.find({
      collection: 'blog-posts',
      where,
      limit,
      page,
      sort: '-publishedDate',
      locale,
      depth: 2
    })

    return {
      docs: result.docs as BlogPost[],
      totalDocs: result.totalDocs,
      totalPages: result.totalPages,
      page: result.page || 1,
      hasNextPage: result.hasNextPage || false,
      hasPrevPage: result.hasPrevPage || false,
    }
  } catch (error) {
    console.error('Error fetching blog posts:', error)
    return {
      docs: [],
      totalDocs: 0,
      totalPages: 0,
      page: 1,
      hasNextPage: false,
      hasPrevPage: false,
    }
  }
}

// Fetch single blog post by slug
export async function getBlogPost(slug: string, locale = 'en'): Promise<BlogPost | null> {
  try {
    const payload = await getPayload()
    
    const result = await payload.find({
      collection: 'blog-posts',
      where: {
        slug: { equals: slug },
        status: { equals: 'published' }
      },
      limit: 1,
      locale,
      depth: 2
    })

    return result.docs[0] as BlogPost || null
  } catch (error) {
    console.error('Error fetching blog post:', error)
    return null
  }
}

// Fetch blog categories
export async function getBlogCategories(locale = 'en'): Promise<BlogCategory[]> {
  try {
    const payload = await getPayload()
    
    const result = await payload.find({
      collection: 'blog-categories',
      limit: 100,
      sort: 'name',
      locale,
    })

    return result.docs as BlogCategory[]
  } catch (error) {
    console.error('Error fetching blog categories:', error)
    return []
  }
}

// Fetch blog tags
export async function getBlogTags(): Promise<BlogTag[]> {
  try {
    const payload = await getPayload()
    
    const result = await payload.find({
      collection: 'blog-tags',
      limit: 100,
      sort: 'name',
    })

    return result.docs as BlogTag[]
  } catch (error) {
    console.error('Error fetching blog tags:', error)
    return []
  }
}

// Fetch related posts
export async function getRelatedPosts(
  currentPostId: string,
  categorySlug: string,
  locale = 'en',
  limit = 3
): Promise<BlogPost[]> {
  try {
    const payload = await getPayload()
    
    const result = await payload.find({
      collection: 'blog-posts',
      where: {
        id: { not_equals: currentPostId },
        'category.slug': { equals: categorySlug },
        status: { equals: 'published' }
      },
      limit,
      sort: '-publishedDate',
      locale,
      depth: 2
    })

    return result.docs as BlogPost[]
  } catch (error) {
    console.error('Error fetching related posts:', error)
    return []
  }
}

// Fetch popular posts (most recent for now, can be enhanced with view counts later)
export async function getPopularPosts(locale = 'en', limit = 5): Promise<BlogPost[]> {
  try {
    const payload = await getPayload()
    
    const result = await payload.find({
      collection: 'blog-posts',
      where: {
        status: { equals: 'published' }
      },
      limit,
      sort: '-publishedDate',
      locale,
      depth: 2
    })

    return result.docs as BlogPost[]
  } catch (error) {
    console.error('Error fetching popular posts:', error)
    return []
  }
}
