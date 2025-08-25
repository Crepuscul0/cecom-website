#!/usr/bin/env node

// Test the actual getBlogPosts function
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://kfhrhdhtngtmnescqcnv.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtmaHJoZGh0bmd0bW5lc2NxY252Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUwOTcyMTgsImV4cCI6MjA3MDY3MzIxOH0.cA8JGHk5b3Z18mHjhIge-2wA2UOMPW67i4dLxIFp6dY'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function testGetBlogPosts() {
  console.log('🔍 Testing getBlogPosts function...')
  
  try {
    const { data, error } = await supabase
      .from('blog_posts')
      .select(`
        *,
        blog_categories(name_es, name_en, slug)
      `)
      .eq('status', 'published')
      .order('published_date', { ascending: false })
      .limit(10)
    
    if (error) {
      console.error('❌ Supabase Error:', error)
      return
    }
    
    console.log(`✅ Raw data from Supabase: ${data?.length || 0} posts`)
    
    if (data && data.length > 0) {
      console.log('\n📋 Raw posts:')
      data.forEach((post, index) => {
        console.log(`${index + 1}. ${post.title}`)
        console.log(`   ID: ${post.id}`)
        console.log(`   Slug: ${post.slug}`)
        console.log(`   Category: ${post.blog_categories?.name_es || 'No category'}`)
        console.log(`   Status: ${post.status}`)
        console.log('')
      })
      
      // Transform data like the function does
      const transformedPosts = data.map(post => ({
        id: post.id,
        title: post.title,
        excerpt: post.excerpt || '',
        content: post.content,
        slug: post.slug,
        category: post.blog_categories?.slug || '',
        tags: [],
        featuredImage: post.featured_image,
        publishedDate: post.published_date,
        readingTime: 5,
        author: post.author,
        status: post.status,
        seo: post.meta_title || post.meta_description ? {
          metaTitle: post.meta_title || post.title,
          metaDescription: post.meta_description || post.excerpt || '',
          keywords: ''
        } : undefined
      }))
      
      console.log('\n🔄 Transformed posts:')
      transformedPosts.forEach((post, index) => {
        console.log(`${index + 1}. ${post.title}`)
        console.log(`   Category: ${post.category}`)
        console.log(`   Featured Image: ${post.featuredImage}`)
        console.log('')
      })
      
    } else {
      console.log('⚠️  No posts found in raw data')
    }
    
  } catch (error) {
    console.error('❌ Test Error:', error)
  }
}

testGetBlogPosts()
