import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { marked } from 'marked'

// Configure marked for better HTML output
marked.setOptions({
  breaks: true,
  gfm: true
})

export async function POST(request: Request) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    // Fetch all blog posts
    const { data: posts, error: fetchError } = await supabase
      .from('blog_posts')
      .select('id, title, content, slug')
      .order('created_at', { ascending: false })
    
    if (fetchError) {
      throw fetchError
    }
    
    let converted = 0
    let skipped = 0
    let errors = 0
    const results = []
    
    for (const post of posts) {
      try {
        // Check if content is already HTML
        const isAlreadyHTML = /<h[1-6]>|<p>|<ul>|<ol>|<li>|<strong>|<em>|<a\s/.test(post.content)
        
        if (isAlreadyHTML) {
          skipped++
          continue
        }
        
        // Check if content looks like markdown
        const hasMarkdownSyntax = /^#{1,6}\s|^\*\*|^##|^\*\s|\[.*\]\(.*\)/m.test(post.content)
        
        if (!hasMarkdownSyntax) {
          skipped++
          continue
        }
        
        // Convert markdown to HTML
        const htmlContent = await marked(post.content)
        
        // Update the post
        const { error: updateError } = await supabase
          .from('blog_posts')
          .update({ content: htmlContent })
          .eq('id', post.id)
        
        if (updateError) {
          throw updateError
        }
        
        converted++
        results.push({ id: post.id, title: post.title })
        
      } catch (error) {
        errors++
        console.error(`Error converting ${post.title}:`, error)
      }
    }
    
    return NextResponse.json({
      success: true,
      converted,
      skipped,
      errors,
      total: posts.length,
      results
    })
    
  } catch (error) {
    console.error('Error in convert-markdown API:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
