import { XMLParser } from 'fast-xml-parser'
import { createClient } from '@supabase/supabase-js'

interface RSSItem {
  title: string
  description: string
  link: string
  guid: string
  pubDate: string
}

interface RSSFeed {
  rss: {
    channel: {
      title: string
      description: string
      item: RSSItem[]
    }
  }
}

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

export async function fetchExtremeNetworksRSS(): Promise<RSSItem[]> {
  try {
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
    
    const result = parser.parse(xmlData) as RSSFeed
    const items = Array.isArray(result.rss.channel.item) 
      ? result.rss.channel.item 
      : [result.rss.channel.item]
    
    return items.filter(item => item && item.title)
  } catch (error) {
    console.error('Error fetching RSS feed:', error)
    return []
  }
}

export function parseRSSItemToPost(item: RSSItem, locale: 'en' | 'es' = 'es') {
  // Clean HTML from description
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
  const tags = ['seguridad', 'extreme-networks', 'vulnerabilidad']
  if (cveMatch) {
    tags.push(cveMatch[0].toLowerCase())
  }
  
  const translatedContent = locale === 'es' ? {
    title: translateSecurityTitle(item.title),
    excerpt: translateSecurityDescription(cleanDescription),
    content: generateSpanishContent(item, cleanDescription),
    category: 'ciberseguridad'
  } : {
    title: item.title,
    excerpt: cleanDescription.substring(0, 200) + '...',
    content: generateEnglishContent(item, cleanDescription),
    category: 'cybersecurity'
  }
  
  return {
    title: translatedContent.title,
    slug: `${slug}-${locale}`,
    excerpt: translatedContent.excerpt,
    content: translatedContent.content,
    publishedDate: new Date(item.pubDate),
    status: 'published' as const,
    category: translatedContent.category,
    tags: locale === 'es' ? tags : ['security', 'extreme-networks', 'vulnerability', ...(cveMatch ? [cveMatch[0].toLowerCase()] : [])],
    sourceUrl: item.link,
    readingTime: Math.ceil(translatedContent.content.length / 1000),
    seo: {
      metaTitle: translatedContent.title,
      metaDescription: translatedContent.excerpt,
      keywords: tags.join(', ')
    }
  }
}

function translateSecurityTitle(title: string): string {
  return title
    .replace(/Security Advisory/gi, 'Aviso de Seguridad')
    .replace(/Vulnerability/gi, 'Vulnerabilidad')
    .replace(/attack/gi, 'ataque')
    .replace(/Resource Exhaustion/gi, 'Agotamiento de Recursos')
    .replace(/authentication leak/gi, 'filtración de autenticación')
    .replace(/allows long exponents/gi, 'permite exponentes largos')
}

function translateSecurityDescription(description: string): string {
  const translations = {
    'remote attackers': 'atacantes remotos',
    'server-side': 'del lado del servidor',
    'calculations': 'cálculos',
    'vulnerability': 'vulnerabilidad',
    'authentication': 'autenticación',
    'third party': 'terceros',
    'HTTP server': 'servidor HTTP',
    'leak': 'filtración'
  }
  
  let translated = description
  Object.entries(translations).forEach(([en, es]) => {
    translated = translated.replace(new RegExp(en, 'gi'), es)
  })
  
  return translated.substring(0, 200) + '...'
}

function generateSpanishContent(item: RSSItem, cleanDescription: string): string {
  const cveMatch = item.title.match(/CVE-\d{4}-\d+/)
  const saMatch = item.title.match(/SA-\d{4}-\d+/)
  
  return `# ${translateSecurityTitle(item.title)}

## Resumen de la Vulnerabilidad

${translateSecurityDescription(cleanDescription)}

### Información de la Vulnerabilidad

${cveMatch ? `- **CVE ID:** ${cveMatch[0]}` : ''}
${saMatch ? `- **Security Advisory:** ${saMatch[0]}` : ''}
- **Fecha de Publicación:** ${new Date(item.pubDate).toLocaleDateString('es-ES')}
- **Fuente:** Extreme Networks Security Advisory

---

*Para más detalles técnicos, consulte el [aviso oficial de Extreme Networks](${item.link}).*`
}

function generateEnglishContent(item: RSSItem, cleanDescription: string): string {
  const cveMatch = item.title.match(/CVE-\d{4}-\d+/)
  const saMatch = item.title.match(/SA-\d{4}-\d+/)
  
  return `# ${item.title}

## Vulnerability Summary

${cleanDescription}

### Vulnerability Information

${cveMatch ? `- **CVE ID:** ${cveMatch[0]}` : ''}
${saMatch ? `- **Security Advisory:** ${saMatch[0]}` : ''}
- **Publication Date:** ${new Date(item.pubDate).toLocaleDateString('en-US')}
- **Source:** Extreme Networks Security Advisory

---

*For technical details, please refer to the [official Extreme Networks advisory](${item.link}).*`
}

export async function importRSSToSupabase(limit: number = 10): Promise<{
  imported: number
  total: number
  results: any[]
}> {
  try {
    console.log('🔄 Fetching RSS feed...')
    const rssItems = await fetchExtremeNetworksRSS()
    
    if (rssItems.length === 0) {
      console.log('⚠️  No RSS items found')
      return { imported: 0, total: 0, results: [] }
    }
    
    console.log(`📊 Found ${rssItems.length} RSS items, processing ${Math.min(limit, rssItems.length)}...`)
    
    // Get cybersecurity category ID
    const { data: categories } = await supabase
      .from('blog_categories')
      .select('id, name')
      .eq('name', 'Ciberseguridad')
      .single()
    
    const categoryId = categories?.id || 'f3c265c9-390a-4572-994a-db7d2ca5948b' // fallback
    
    const results = []
    let imported = 0
    
    for (let i = 0; i < Math.min(limit, rssItems.length); i++) {
      const item = rssItems[i]
      
      try {
        // Parse RSS item to blog post format
        const post = parseRSSItemToPost(item, 'es')
        
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
            meta_title: post.seo.metaTitle,
            meta_description: post.seo.metaDescription,
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
    
    return {
      imported,
      total: rssItems.length,
      results
    }
    
  } catch (error) {
    console.error('❌ Error in RSS import:', error)
    throw error
  }
}
