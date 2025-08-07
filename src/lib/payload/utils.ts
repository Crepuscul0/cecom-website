import { Media } from './types'

// Helper function to get media URL
export const getMediaUrl = (media: Media | string | null | undefined): string | null => {
  if (!media) return null
  
  if (typeof media === 'string') {
    // If it's just an ID, we can't get the URL without fetching
    return null
  }
  
  return media.url || null
}

// Helper function to get optimized image URL
export const getOptimizedImageUrl = (
  media: Media | string | null | undefined,
  size: 'thumbnail' | 'card' | 'tablet' = 'card'
): string | null => {
  if (!media || typeof media === 'string') return null
  
  if (media.sizes && media.sizes[size]) {
    return media.sizes[size]!.url
  }
  
  return media.url || null
}

// Helper function to extract text from rich text content
export const extractTextFromRichText = (richText: any): string => {
  if (!richText) return ''
  
  if (typeof richText === 'string') return richText
  
  // Handle Slate.js rich text format
  if (Array.isArray(richText)) {
    return richText
      .map((node: any) => {
        if (node.text) return node.text
        if (node.children) return extractTextFromRichText(node.children)
        return ''
      })
      .join('')
  }
  
  return ''
}

// Helper function to format date
export const formatDate = (dateString: string, locale: string = 'en'): string => {
  const date = new Date(dateString)
  
  return date.toLocaleDateString(locale === 'es' ? 'es-ES' : 'en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

// Helper function to generate slug from text
export const generateSlug = (text: string): string => {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single
    .trim()
}

// Helper function to validate required environment variables
export const validateEnvironment = () => {
  const required = [
    'SUPABASE_DATABASE_URL',
    'PAYLOAD_SECRET',
  ]
  
  const missing = required.filter(key => !process.env[key])
  
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`)
  }
}

// Helper function to check if media is an image
export const isImage = (media: Media | string | null | undefined): boolean => {
  if (!media || typeof media === 'string') return false
  
  return media.mimeType?.startsWith('image/') || false
}

// Helper function to check if media is a PDF
export const isPDF = (media: Media | string | null | undefined): boolean => {
  if (!media || typeof media === 'string') return false
  
  return media.mimeType === 'application/pdf'
}