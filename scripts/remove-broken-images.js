#!/usr/bin/env node

/**
 * Script to remove broken placeholder images from RSS-fetched blog posts
 * This will set featured_image to NULL for posts with placeholder images
 */

require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

async function removeBrokenImages() {
  try {
    console.log('🚀 Starting broken image removal...')
    console.log('─'.repeat(50))
    
    // Fetch all RSS posts (identified by SA- prefix in title)
    const { data: posts, error } = await supabase
      .from('blog_posts')
      .select('id, title, featured_image, slug')
      .ilike('title', '%SA-%')
      .order('created_at', { ascending: false })
    
    if (error) {
      throw error
    }
    
    console.log(`📊 Found ${posts.length} RSS posts`)
    
    let removed = 0
    let skipped = 0
    let errors = 0
    
    for (const post of posts) {
      try {
        // Check if image is a broken placeholder
        const isBrokenImage = post.featured_image && (
          post.featured_image.includes('example.com') ||
          post.featured_image.includes('placeholder.jpg') ||
          post.featured_image.includes('placeholder.svg')
        )
        
        if (!isBrokenImage) {
          skipped++
          continue
        }
        
        console.log(`🔄 Removing image from "${post.title}"...`)
        console.log(`   Was: ${post.featured_image}`)
        
        // Update the post to remove the image
        const { error: updateError } = await supabase
          .from('blog_posts')
          .update({ featured_image: null })
          .eq('id', post.id)
        
        if (updateError) {
          throw updateError
        }
        
        console.log(`✅ Removed image from "${post.title}"`)
        removed++
        
      } catch (error) {
        console.error(`❌ Error processing "${post.title}":`, error.message)
        errors++
      }
    }
    
    console.log('─'.repeat(50))
    console.log('✅ Image removal completed!')
    console.log(`📝 Images removed: ${removed}`)
    console.log(`⏭️  Skipped: ${skipped}`)
    console.log(`❌ Errors: ${errors}`)
    
  } catch (error) {
    console.error('❌ Fatal error:', error.message)
    process.exit(1)
  }
}

// Run the removal
if (require.main === module) {
  removeBrokenImages()
}

module.exports = { removeBrokenImages }
