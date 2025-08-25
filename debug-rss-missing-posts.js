#!/usr/bin/env node

require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')
const { XMLParser } = require('fast-xml-parser')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function debugMissingPosts() {
  console.log('🔍 DEBUGGING MISSING RSS POSTS')
  console.log('=' * 50)
  
  try {
    // 1. Fetch RSS feed
    console.log('\n1️⃣ Fetching RSS feed...')
    const response = await fetch('https://extreme-networks.my.site.com/apex/ExtrKnowledgeRSS')
    const xmlData = await response.text()
    
    const parser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: '@_',
      textNodeName: '#text',
      parseTagValue: false,
      parseAttributeValue: false,
      trimValues: true,
    })
    
    const result = parser.parse(xmlData)
    const rssItems = Array.isArray(result.rss.channel.item) 
      ? result.rss.channel.item 
      : [result.rss.channel.item]
    
    console.log(`✅ RSS feed has ${rssItems.length} items`)
    
    // 2. Get existing posts from Supabase
    console.log('\n2️⃣ Getting existing posts from Supabase...')
    const { data: existingPosts, error } = await supabase
      .from('blog_posts')
      .select('slug, title')
      .eq('status', 'published')
    
    if (error) {
      console.error('❌ Error fetching existing posts:', error)
      return
    }
    
    console.log(`✅ Supabase has ${existingPosts.length} posts`)
    
    // 3. Compare RSS vs Supabase
    console.log('\n3️⃣ Comparing RSS items vs Supabase posts...')
    
    const existingSlugs = new Set(existingPosts.map(p => p.slug))
    const missingPosts = []
    
    rssItems.forEach((item, index) => {
      const slug = item.title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim() + '-es'
      
      if (!existingSlugs.has(slug)) {
        missingPosts.push({
          index: index + 1,
          title: item.title,
          slug: slug,
          pubDate: item.pubDate,
          link: item.link
        })
      }
    })
    
    console.log(`📊 Missing posts: ${missingPosts.length}`)
    
    if (missingPosts.length > 0) {
      console.log('\n📋 Missing posts from RSS feed:')
      missingPosts.forEach(post => {
        console.log(`${post.index}. ${post.title}`)
        console.log(`   Slug: ${post.slug}`)
        console.log(`   Date: ${post.pubDate}`)
        console.log(`   Link: ${post.link}`)
        console.log('')
      })
    }
    
    // 4. Show existing posts
    console.log('\n4️⃣ Existing posts in Supabase:')
    existingPosts.forEach((post, index) => {
      console.log(`${index + 1}. ${post.title}`)
      console.log(`   Slug: ${post.slug}`)
      console.log('')
    })
    
    // 5. Summary
    console.log('\n🎯 SUMMARY:')
    console.log(`- RSS feed items: ${rssItems.length}`)
    console.log(`- Supabase posts: ${existingPosts.length}`)
    console.log(`- Missing posts: ${missingPosts.length}`)
    
    if (missingPosts.length > 0) {
      console.log('\n⚠️  ACTION NEEDED: Import missing posts to see all 20 posts on the blog')
    } else {
      console.log('\n✅ All RSS posts are already in Supabase')
    }
    
  } catch (error) {
    console.error('❌ Debug error:', error)
  }
}

debugMissingPosts()
