import { supabaseAdmin } from './client'

// Storage bucket configuration
export const STORAGE_BUCKETS = {
  MEDIA: 'media',
  DOCUMENTS: 'documents', 
  LOGOS: 'logos',
} as const

export type StorageBucket = typeof STORAGE_BUCKETS[keyof typeof STORAGE_BUCKETS]

// File size limits (in bytes)
export const FILE_SIZE_LIMITS = {
  [STORAGE_BUCKETS.MEDIA]: 50 * 1024 * 1024, // 50MB
  [STORAGE_BUCKETS.DOCUMENTS]: 50 * 1024 * 1024, // 50MB
  [STORAGE_BUCKETS.LOGOS]: 10 * 1024 * 1024, // 10MB
} as const

// Allowed MIME types
export const ALLOWED_MIME_TYPES = {
  [STORAGE_BUCKETS.MEDIA]: [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'image/svg+xml',
    'application/pdf',
  ],
  [STORAGE_BUCKETS.DOCUMENTS]: [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  ],
  [STORAGE_BUCKETS.LOGOS]: [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'image/svg+xml',
  ],
} as const

// Validate file before upload
export const validateFile = (
  file: File,
  bucket: StorageBucket
): { valid: boolean; error?: string } => {
  // Check file size
  const maxSize = FILE_SIZE_LIMITS[bucket]
  if (file.size > maxSize) {
    return {
      valid: false,
      error: `File size exceeds limit of ${Math.round(maxSize / 1024 / 1024)}MB`,
    }
  }

  // Check MIME type
  const allowedTypes = ALLOWED_MIME_TYPES[bucket]
  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: `File type ${file.type} is not allowed for this bucket`,
    }
  }

  return { valid: true }
}

// Generate file path with timestamp and random suffix
export const generateFilePath = (
  originalName: string,
  folder?: string
): string => {
  const timestamp = Date.now()
  const randomSuffix = Math.random().toString(36).substring(2, 8)
  const extension = originalName.split('.').pop()
  const nameWithoutExt = originalName.replace(/\.[^/.]+$/, '')
  const sanitizedName = nameWithoutExt
    .replace(/[^a-zA-Z0-9]/g, '-')
    .toLowerCase()

  const fileName = `${sanitizedName}-${timestamp}-${randomSuffix}.${extension}`
  
  return folder ? `${folder}/${fileName}` : fileName
}

// Setup storage buckets (for initial setup)
export const setupStorageBuckets = async () => {
  try {
    const buckets = Object.values(STORAGE_BUCKETS)
    
    for (const bucketId of buckets) {
      // Check if bucket exists
      const { data: existingBuckets } = await supabaseAdmin.storage.listBuckets()
      const bucketExists = existingBuckets?.some(b => b.id === bucketId)
      
      if (!bucketExists) {
        // Create bucket
        const { error } = await supabaseAdmin.storage.createBucket(bucketId, {
          public: true,
          fileSizeLimit: FILE_SIZE_LIMITS[bucketId],
          allowedMimeTypes: ALLOWED_MIME_TYPES[bucketId],
        })
        
        if (error) {
          console.error(`Error creating bucket ${bucketId}:`, error)
        } else {
          console.log(`✅ Created storage bucket: ${bucketId}`)
        }
      } else {
        console.log(`✅ Storage bucket already exists: ${bucketId}`)
      }
    }
    
    return { success: true }
  } catch (error) {
    console.error('Error setting up storage buckets:', error)
    return { success: false, error }
  }
}

// Get bucket info
export const getBucketInfo = async (bucketId: StorageBucket) => {
  try {
    const { data, error } = await supabaseAdmin.storage.getBucket(bucketId)
    
    if (error) {
      throw error
    }
    
    return data
  } catch (error) {
    console.error(`Error getting bucket info for ${bucketId}:`, error)
    return null
  }
}

// List all files in a bucket
export const listBucketFiles = async (
  bucketId: StorageBucket,
  folder?: string,
  limit?: number
) => {
  try {
    const { data, error } = await supabaseAdmin.storage
      .from(bucketId)
      .list(folder, {
        limit,
        sortBy: { column: 'created_at', order: 'desc' },
      })
    
    if (error) {
      throw error
    }
    
    return data
  } catch (error) {
    console.error(`Error listing files in bucket ${bucketId}:`, error)
    return []
  }
}