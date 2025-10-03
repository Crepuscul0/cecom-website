#!/usr/bin/env node

require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

async function checkImages() {
  console.log('🔍 Checking RSS post images...\n')
  
  const { data, error } = await supabase
    .from('blog_posts')
    .select('id, title, featured_image, slug')
    .ilike('title', '%SA-%')
    .order('created_at', { ascending: false })
  
  if (error) {
    console.error('Error:', error)
    return
  }
  
  console.log(`Found ${data.length} RSS posts\n`)
  
  const imageStats = {
    withImage: 0,
    withoutImage: 0,
    brokenLinks: 0
  }
  
  data.forEach(post => {
    if (!post.featured_image || post.featured_image === null) {
      imageStats.withoutImage++
      console.log(`✅ No image (good): ${post.title}`)
    } else if (post.featured_image.includes('example.com') || 
               post.featured_image.includes('placeholder')) {
      imageStats.brokenLinks++
      console.log(`❌ Broken: ${post.title}`)
      console.log(`   Image: ${post.featured_image}`)
    } else {
      imageStats.withImage++
      console.log(`✅ Valid image: ${post.title}`)
      console.log(`   Image: ${post.featured_image}`)
    }
  })
  
  console.log('\n📊 Statistics:')
  console.log(`  ✅ Valid images: ${imageStats.withImage}`)
  console.log(`  ⚠️  No image (null): ${imageStats.withoutImage}`)
  console.log(`  ❌ Broken links: ${imageStats.brokenLinks}`)
}

checkImages()
