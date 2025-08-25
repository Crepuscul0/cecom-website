import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Initialize Supabase client with service role key
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseServiceKey)

interface RSSItem {
  title: string
  description: string
  link: string
  guid: string
  pubDate: string
}

async function fetchExtremeNetworksRSS(): Promise<RSSItem[]> {
  try {
    const response = await fetch('https://extreme-networks.my.site.com/apex/ExtrKnowledgeRSS')
    const xmlData = await response.text()
    
    const { XMLParser } = await import('fast-xml-parser')
    const parser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: '@_',
      textNodeName: '#text',
      parseTagValue: false,
      parseAttributeValue: false,
      trimValues: true,
    })
    
    const result = parser.parse(xmlData) as any
    const items = Array.isArray(result.rss.channel.item) 
      ? result.rss.channel.item 
      : [result.rss.channel.item]
    
    return items.filter((item: any) => item && item.title)
  } catch (error) {
    console.error('Error fetching RSS feed:', error)
    return []
  }
}

function parseRSSItemToPost(item: RSSItem) {
  const cleanDescription = item.description
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .trim()
  
  const slug = item.title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
  
  const cveMatch = item.title.match(/CVE-\d{4}-\d+/)
  const saMatch = item.title.match(/SA-\d{4}-\d+/)
  
  const translatedTitle = item.title
    .replace(/Security Advisory/gi, 'Aviso de Seguridad')
    .replace(/Vulnerability/gi, 'Vulnerabilidad')
    .replace(/attack/gi, 'ataque')
    .replace(/Resource Exhaustion/gi, 'Agotamiento de Recursos')
    .replace(/authentication leak/gi, 'filtración de autenticación')
    .replace(/allows long exponents/gi, 'permite exponentes largos')
  
  const translatedExcerpt = cleanDescription
    .replace(/remote attackers/gi, 'atacantes remotos')
    .replace(/server-side/gi, 'del lado del servidor')
    .replace(/calculations/gi, 'cálculos')
    .replace(/vulnerability/gi, 'vulnerabilidad')
    .substring(0, 200) + '...'
  
  const content = `# ${translatedTitle}

## Resumen de la Vulnerabilidad

${translatedExcerpt}

### Información de la Vulnerabilidad

${cveMatch ? `- **CVE ID:** ${cveMatch[0]}` : ''}
${saMatch ? `- **Security Advisory:** ${saMatch[0]}` : ''}
- **Fecha de Publicación:** ${new Date(item.pubDate).toLocaleDateString('es-ES')}
- **Fuente:** Extreme Networks Security Advisory

---

*Para más detalles técnicos, consulte el [aviso oficial de Extreme Networks](${item.link}).*`
  
  return {
    title: translatedTitle,
    slug: `${slug}-es`,
    excerpt: translatedExcerpt,
    content,
    publishedDate: new Date(item.pubDate),
    sourceUrl: item.link,
    metaTitle: translatedTitle,
    metaDescription: translatedExcerpt
  }
}

export async function POST(request: NextRequest) {
  try {
    const { limit = 10 } = await request.json()
    
    console.log('🔄 Fetching RSS feed...')
    const rssItems = await fetchExtremeNetworksRSS()
    
    if (rssItems.length === 0) {
      return NextResponse.json({ 
        success: false, 
        message: 'No RSS items found',
        imported: 0,
        total: 0
      })
    }
    
    // Get cybersecurity category ID
    const { data: categories } = await supabase
      .from('blog_categories')
      .select('id, name')
      .eq('name', 'Ciberseguridad')
      .single()
    
    const categoryId = categories?.id || 'f3c265c9-390a-4572-994a-db7d2ca5948b'
    
    const results = []
    let imported = 0
    
    for (let i = 0; i < Math.min(limit, rssItems.length); i++) {
      const item = rssItems[i]
      
      try {
        const post = parseRSSItemToPost(item)
        
        // Check if post already exists
        const { data: existingPost } = await supabase
          .from('blog_posts')
          .select('id')
          .eq('slug', post.slug)
          .single()
        
        if (existingPost) {
          console.log(`⏭️  Skipping existing post: ${post.title}`)
          continue
        }
        
        // Insert new post
        const { data: insertedPost, error } = await supabase
          .from('blog_posts')
          .insert({
            title: post.title,
            content: post.content,
            excerpt: post.excerpt,
            slug: post.slug,
            category_id: categoryId,
            featured_image: '/blog/cybersecurity-placeholder.jpg',
            published_date: post.publishedDate.toISOString(),
            status: 'published',
            author: 'Equipo CECOM',
            meta_title: post.metaTitle,
            meta_description: post.metaDescription,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .select()
          .single()
        
        if (error) {
          console.error(`❌ Error inserting post "${post.title}":`, error.message)
          continue
        }
        
        console.log(`✅ Imported: ${post.title}`)
        results.push({ post, insertedPost })
        imported++
        
      } catch (error) {
        console.error(`❌ Error processing RSS item "${item.title}":`, error)
      }
    }
    
    return NextResponse.json({
      success: true,
      message: `Successfully imported ${imported} posts`,
      imported,
      total: rssItems.length,
      results: results.map(r => ({
        title: r.post.title,
        slug: r.post.slug,
        publishedDate: r.post.publishedDate
      }))
    })
    
  } catch (error) {
    console.error('❌ Error in RSS import API:', error)
    return NextResponse.json({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'RSS Import API - Use POST to import RSS feeds',
    usage: 'POST /api/admin/import-rss with { "limit": 10 }'
  })
}
