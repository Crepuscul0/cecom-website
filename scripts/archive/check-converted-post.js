#!/usr/bin/env node

require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

async function checkPost() {
  const { data, error } = await supabase
    .from('blog_posts')
    .select('title, content')
    .ilike('title', '%SA-2023-088%')
    .limit(1)
    .single()
  
  if (error) {
    console.error('Error:', error)
    return
  }
  
  console.log('Title:', data.title)
  console.log('\nContent type:', typeof data.content)
  console.log('Content length:', data.content.length)
  
  // Check for HTML tags
  const hasH1 = data.content.includes('<h1>')
  const hasP = data.content.includes('<p>')
  const hasUL = data.content.includes('<ul>')
  const hasStrong = data.content.includes('<strong>')
  
  console.log('\nHTML tag detection:')
  console.log('  <h1>:', hasH1)
  console.log('  <p>:', hasP)
  console.log('  <ul>:', hasUL)
  console.log('  <strong>:', hasStrong)
  
  console.log('\nContent preview (first 1000 chars):')
  console.log(data.content.substring(0, 1000))
  console.log('\n...')
  
  // Check if it's HTML
  const isHTML = hasH1 || hasP || hasUL
  console.log('\n✅ Content format:', isHTML ? 'HTML ✓' : 'Markdown/Plain Text ✗')
}

checkPost()
