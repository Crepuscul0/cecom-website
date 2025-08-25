#!/usr/bin/env node

require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://kfhrhdhtngtmnescqcnv.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtmaHJoZGh0bmd0bW5lc2NxY252Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUwOTcyMTgsImV4cCI6MjA3MDY3MzIxOH0.cA8JGHk5b3Z18mHjhIge-2wA2UOMPW67i4dLxIFp6dY'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function comprehensiveDebug() {
  console.log('🔍 COMPREHENSIVE BLOG DEBUG')
  console.log('=' * 50)
  
  try {
    // Test 1: Raw Supabase query
    console.log('\n1️⃣ Testing raw Supabase query...')
    const { data: rawPosts, error: rawError } = await supabase
      .from('blog_posts')
      .select('*')
      .eq('status', 'published')
      .order('published_date', { ascending: false })
    
    if (rawError) {
      console.error('❌ Raw query error:', rawError)
      return
    }
    
    console.log(`✅ Raw posts found: ${rawPosts?.length || 0}`)
    
    // Test 2: Query with category join
    console.log('\n2️⃣ Testing query with category join...')
    const { data: joinedPosts, error: joinError } = await supabase
      .from('blog_posts')
      .select(`
        *,
        blog_categories(name_es, name_en, slug)
      `)
      .eq('status', 'published')
      .order('published_date', { ascending: false })
    
    if (joinError) {
      console.error('❌ Join query error:', joinError)
    } else {
      console.log(`✅ Joined posts found: ${joinedPosts?.length || 0}`)
      
      if (joinedPosts && joinedPosts.length > 0) {
        console.log('\n📋 Sample joined post:')
        const sample = joinedPosts[0]
        console.log(`- ID: ${sample.id}`)
        console.log(`- Title: ${sample.title}`)
        console.log(`- Slug: ${sample.slug}`)
        console.log(`- Category: ${sample.blog_categories?.name_es || 'No category'}`)
        console.log(`- Status: ${sample.status}`)
        console.log(`- Published: ${sample.published_date}`)
      }
    }
    
    // Test 3: Check categories table
    console.log('\n3️⃣ Testing categories table...')
    const { data: categories, error: catError } = await supabase
      .from('blog_categories')
      .select('*')
    
    if (catError) {
      console.error('❌ Categories error:', catError)
    } else {
      console.log(`✅ Categories found: ${categories?.length || 0}`)
      categories?.forEach(cat => {
        console.log(`- ${cat.name_es} (${cat.slug}) - ID: ${cat.id}`)
      })
    }
    
    // Test 4: Simulate getBlogPosts function
    console.log('\n4️⃣ Simulating getBlogPosts function...')
    
    const transformedPosts = joinedPosts?.map(post => ({
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
    })) || []
    
    console.log(`✅ Transformed posts: ${transformedPosts.length}`)
    
    if (transformedPosts.length > 0) {
      console.log('\n📋 First 3 transformed posts:')
      transformedPosts.slice(0, 3).forEach((post, index) => {
        console.log(`${index + 1}. ${post.title}`)
        console.log(`   Slug: ${post.slug}`)
        console.log(`   Category: ${post.category}`)
        console.log(`   Image: ${post.featuredImage}`)
        console.log(`   Author: ${post.author}`)
        console.log('')
      })
    }
    
    // Test 5: Check for empty results after filtering
    console.log('\n5️⃣ Testing filtering logic...')
    
    // Simulate no filters
    let filteredPosts = transformedPosts
    console.log(`✅ No filters applied: ${filteredPosts.length} posts`)
    
    // Simulate pagination
    const currentPage = 1
    const postsPerPage = 6
    const startIndex = (currentPage - 1) * postsPerPage
    const paginatedPosts = filteredPosts.slice(startIndex, startIndex + postsPerPage)
    
    console.log(`✅ After pagination (page ${currentPage}): ${paginatedPosts.length} posts`)
    
    if (paginatedPosts.length === 0) {
      console.log('⚠️  ISSUE FOUND: No posts after pagination!')
    }
    
    // Test 6: Check for missing required fields
    console.log('\n6️⃣ Checking for missing required fields...')
    
    paginatedPosts.forEach((post, index) => {
      const missing = []
      if (!post.id) missing.push('id')
      if (!post.title) missing.push('title')
      if (!post.slug) missing.push('slug')
      if (!post.publishedDate) missing.push('publishedDate')
      
      if (missing.length > 0) {
        console.log(`❌ Post ${index + 1} missing: ${missing.join(', ')}`)
      } else {
        console.log(`✅ Post ${index + 1} has all required fields`)
      }
    })
    
    console.log('\n🎯 SUMMARY:')
    console.log(`- Raw posts in DB: ${rawPosts?.length || 0}`)
    console.log(`- Posts with categories: ${joinedPosts?.length || 0}`)
    console.log(`- Transformed posts: ${transformedPosts.length}`)
    console.log(`- Final paginated posts: ${paginatedPosts.length}`)
    
    if (paginatedPosts.length === 0) {
      console.log('\n❌ PROBLEM: No posts are making it to the final render!')
    } else {
      console.log('\n✅ Posts should be visible in the blog!')
    }
    
  } catch (error) {
    console.error('❌ Debug error:', error)
  }
}

comprehensiveDebug()
