#!/usr/bin/env node

/**
 * Script to convert existing blog posts from markdown to HTML
 * This will update all blog posts that have markdown content
 */

require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')
const { marked } = require('marked')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials')
  console.error('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? 'Set' : 'Missing')
  console.error('SUPABASE_SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? 'Set' : 'Missing')
  console.error('NEXT_PUBLIC_SUPABASE_ANON_KEY:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Set' : 'Missing')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

// Configure marked for better HTML output
marked.setOptions({
  breaks: true,
  gfm: true,
  headerIds: true,
  mangle: false
})

async function convertMarkdownToHTML() {
  try {
    console.log('🚀 Starting markdown to HTML conversion...')
    console.log('─'.repeat(50))
    
    // Fetch all blog posts
    const { data: posts, error } = await supabase
      .from('blog_posts')
      .select('id, title, content, slug')
      .order('created_at', { ascending: false })
    
    if (error) {
      throw error
    }
    
    console.log(`📊 Found ${posts.length} blog posts`)
    
    let converted = 0
    let skipped = 0
    let errors = 0
    
    for (const post of posts) {
      try {
        // Check if content is already HTML (contains HTML tags)
        const isAlreadyHTML = /<h[1-6]>|<p>|<ul>|<ol>|<li>|<strong>|<em>|<a\s/.test(post.content)
        
        if (isAlreadyHTML) {
          console.log(`⏭️  Skipping "${post.title}" - already HTML`)
          skipped++
          continue
        }
        
        // Check if content looks like markdown (contains #, ##, **, etc.)
        const hasMarkdownSyntax = /^#{1,6}\s|^\*\*|^##|^\*\s|\[.*\]\(.*\)/m.test(post.content)
        
        if (!hasMarkdownSyntax) {
          console.log(`⏭️  Skipping "${post.title}" - no markdown syntax detected`)
          skipped++
          continue
        }
        
        console.log(`🔄 Converting "${post.title}"...`)
        
        // Convert markdown to HTML
        const htmlContent = await marked(post.content)
        
        // Debug: Show before/after
        if (post.title.includes('SA-2023-088')) {
          console.log('  DEBUG - Original (first 200 chars):', post.content.substring(0, 200))
          console.log('  DEBUG - Converted (first 200 chars):', htmlContent.substring(0, 200))
        }
        
        // Update the post
        const { error: updateError } = await supabase
          .from('blog_posts')
          .update({ content: htmlContent })
          .eq('id', post.id)
        
        if (updateError) {
          throw updateError
        }
        
        console.log(`✅ Converted "${post.title}"`)
        converted++
        
      } catch (error) {
        console.error(`❌ Error converting "${post.title}":`, error.message)
        errors++
      }
    }
    
    console.log('─'.repeat(50))
    console.log('✅ Conversion completed!')
    console.log(`📝 Converted: ${converted}`)
    console.log(`⏭️  Skipped: ${skipped}`)
    console.log(`❌ Errors: ${errors}`)
    
  } catch (error) {
    console.error('❌ Fatal error:', error.message)
    process.exit(1)
  }
}

// Run the conversion
if (require.main === module) {
  convertMarkdownToHTML()
}

module.exports = { convertMarkdownToHTML }
