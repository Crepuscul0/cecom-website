import { UploadedFile } from 'payload/types'
import { uploadFile, STORAGE_BUCKETS } from '../supabase/storage'

// Custom upload handler for Payload CMS to integrate with Supabase Storage
export const handleSupabaseUpload = async (
  file: UploadedFile,
  staticPath: string
): Promise<string> => {
  try {
    // Convert UploadedFile to File object
    const buffer = file.data
    const blob = new Blob([buffer], { type: file.mimetype })
    const fileObj = new File([blob], file.name, { type: file.mimetype })
    
    // Determine bucket based on file type
    let bucket = STORAGE_BUCKETS.MEDIA
    let folder = 'uploads'
    
    if (file.mimetype.startsWith('image/')) {
      if (staticPath.includes('logo')) {
        bucket = STORAGE_BUCKETS.LOGOS
        folder = 'vendor-logos'
      } else {
        bucket = STORAGE_BUCKETS.MEDIA
        folder = 'images'
      }
    } else if (file.mimetype === 'application/pdf') {
      bucket = STORAGE_BUCKETS.DOCUMENTS
      folder = 'documents'
    }
    
    // Upload to Supabase
    const result = await uploadFile(fileObj, bucket, folder)
    
    // Return the public URL
    return result.publicUrl
  } catch (error) {
    console.error('Error uploading to Supabase:', error)
    throw error
  }
}

// Helper function to get file URL from Payload media
export const getPayloadMediaUrl = (media: any): string | null => {
  if (!media) return null
  
  if (typeof media === 'string') {
    // If it's just an ID, we need to fetch the full media object
    return null
  }
  
  // Return the URL from the media object
  return media.url || null
}

// Helper function to get optimized image URL from Payload media
export const getPayloadImageUrl = (
  media: any,
  size: 'thumbnail' | 'card' | 'tablet' = 'card'
): string | null => {
  if (!media) return null
  
  if (typeof media === 'string') return null
  
  // Check if the media has sizes
  if (media.sizes && media.sizes[size]) {
    return media.sizes[size].url
  }
  
  // Fallback to original URL
  return media.url || null
}