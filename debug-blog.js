#!/usr/bin/env node

require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

console.log('🔍 Debug Blog Posts')
console.log('Supabase URL:', supabaseUrl ? 'Set' : 'Missing')
console.log('Service Key:', supabaseServiceKey ? 'Set' : 'Missing')

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function debugBlogPosts() {
  try {
    console.log('\n📊 Testing direct Supabase query...')
    
    // Test 1: Direct query
    const { data: posts, error } = await supabase
      .from('blog_posts')
      .select(`
        id,
        title,
        slug,
        status,
        published_date,
        blog_categories(name_es, name_en, slug)
      `)
      .eq('status', 'published')
      .order('published_date', { ascending: false })
      .limit(10)
    
    if (error) {
      console.error('❌ Error:', error)
      return
    }
    
    console.log(`✅ Found ${posts?.length || 0} posts`)
    
    if (posts && posts.length > 0) {
      console.log('\n📋 Posts found:')
      posts.forEach((post, index) => {
        console.log(`${index + 1}. ${post.title}`)
        console.log(`   Slug: ${post.slug}`)
        console.log(`   Status: ${post.status}`)
        console.log(`   Category: ${post.blog_categories?.name_es || 'No category'}`)
        console.log(`   Date: ${post.published_date}`)
        console.log('')
      })
    } else {
      console.log('⚠️  No posts found')
    }
    
    // Test 2: Check categories
    console.log('\n🏷️  Testing categories...')
    const { data: categories, error: catError } = await supabase
      .from('blog_categories')
      .select('*')
    
    if (catError) {
      console.error('❌ Category Error:', catError)
    } else {
      console.log(`✅ Found ${categories?.length || 0} categories`)
      categories?.forEach(cat => {
        console.log(`- ${cat.name_es} (${cat.slug})`)
      })
    }
    
  } catch (error) {
    console.error('❌ Debug Error:', error)
  }
}

debugBlogPosts()
