import { XMLParser } from 'fast-xml-parser'
import { getPayload } from './payload'

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

export function parseRSSItemToPost(item: RSSItem, locale: 'en' | 'es' = 'en') {
  // Clean HTML from description
  const cleanDescription = item.description
    .replace(/<[^>]*>/g, '')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .trim()

  // Generate slug from title
  const slug = item.title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()

  // Extract CVE if present
  const cveMatch = item.title.match(/CVE-\d{4}-\d+/)
  const tags = ['seguridad', 'extreme-networks', 'vulnerabilidad']
  if (cveMatch) {
    tags.push(cveMatch[0].toLowerCase())
  }

  // Translate content based on locale
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
    readingTime: Math.ceil(translatedContent.content.length / 1000), // Rough estimate
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
    .replace(/Remote Code Execution/gi, 'Ejecución Remota de Código')
    .replace(/Denial of Service/gi, 'Denegación de Servicio')
    .replace(/Information Disclosure/gi, 'Divulgación de Información')
    .replace(/Authentication/gi, 'Autenticación')
    .replace(/Resource Exhaustion/gi, 'Agotamiento de Recursos')
}

function translateSecurityDescription(description: string): string {
  let translated = description
    .replace(/vulnerability/gi, 'vulnerabilidad')
    .replace(/attack/gi, 'ataque')
    .replace(/remote attackers/gi, 'atacantes remotos')
    .replace(/server-side/gi, 'del lado del servidor')
    .replace(/client-side/gi, 'del lado del cliente')
    .replace(/Products not listed/gi, 'Los productos no listados')
    .replace(/have not been evaluated/gi, 'no han sido evaluados')

  return translated.substring(0, 200) + '...'
}

function generateSpanishContent(item: RSSItem, description: string): string {
  const cveMatch = item.title.match(/CVE-\d{4}-\d+/)
  const saMatch = item.title.match(/SA-\d{4}-\d+/)
  
  return `# ${translateSecurityTitle(item.title)}

## Resumen de la Vulnerabilidad

${translateSecurityDescription(description)}

## Detalles Técnicos

Esta vulnerabilidad ha sido identificada por Extreme Networks y afecta a productos específicos de su portafolio. Como distribuidor autorizado de Extreme Networks en República Dominicana, CECOM recomienda revisar inmediatamente si sus equipos están afectados.

### Información de la Vulnerabilidad

${cveMatch ? `- **CVE ID:** ${cveMatch[0]}` : ''}
${saMatch ? `- **Security Advisory:** ${saMatch[0]}` : ''}
- **Fecha de Publicación:** ${new Date(item.pubDate).toLocaleDateString('es-DO')}
- **Fuente:** Extreme Networks Security Advisory

## Recomendaciones de CECOM

1. **Evaluación Inmediata**: Identifique si sus equipos Extreme Networks están afectados
2. **Actualización de Firmware**: Aplique las actualizaciones recomendadas por el fabricante
3. **Monitoreo**: Implemente monitoreo adicional en los equipos afectados
4. **Contacto con Soporte**: Contacte a CECOM para asistencia técnica especializada

## ¿Necesita Ayuda?

Nuestro equipo de expertos en seguridad está disponible para ayudarle a evaluar y mitigar esta vulnerabilidad en su infraestructura.

**Contacto CECOM:**
- **Teléfono:** +1 (809) 555-0123
- **Email:** seguridad@cecom.com.do
- **Soporte 24/7:** Disponible para clientes con contrato de soporte

---

*Para más detalles técnicos, consulte el [aviso oficial de Extreme Networks](${item.link}).*`
}

function generateEnglishContent(item: RSSItem, description: string): string {
  const cveMatch = item.title.match(/CVE-\d{4}-\d+/)
  const saMatch = item.title.match(/SA-\d{4}-\d+/)
  
  return `# ${item.title}

## Vulnerability Summary

${description}

## Technical Details

This vulnerability has been identified by Extreme Networks and affects specific products in their portfolio. As an authorized Extreme Networks distributor in the Dominican Republic, CECOM recommends immediately reviewing if your equipment is affected.

### Vulnerability Information

${cveMatch ? `- **CVE ID:** ${cveMatch[0]}` : ''}
${saMatch ? `- **Security Advisory:** ${saMatch[0]}` : ''}
- **Publication Date:** ${new Date(item.pubDate).toLocaleDateString('en-US')}
- **Source:** Extreme Networks Security Advisory

## CECOM Recommendations

1. **Immediate Assessment**: Identify if your Extreme Networks equipment is affected
2. **Firmware Updates**: Apply manufacturer-recommended updates
3. **Monitoring**: Implement additional monitoring on affected equipment
4. **Support Contact**: Contact CECOM for specialized technical assistance

## Need Help?

Our security expert team is available to help you assess and mitigate this vulnerability in your infrastructure.

**CECOM Contact:**
- **Phone:** +1 (809) 555-0123
- **Email:** security@cecom.com.do
- **24/7 Support:** Available for customers with support contracts

---

*For more technical details, see the [official Extreme Networks advisory](${item.link}).*`
}

export async function importRSSToPayload(limit: number = 10) {
  try {
    const payload = await getPayload()
    const rssItems = await fetchExtremeNetworksRSS()
    
    // Get or create categories
    const cybersecurityCategory = await getOrCreateCategory(payload, 'cybersecurity', {
      name: 'Ciberseguridad',
      slug: 'cybersecurity',
      description: 'Avisos de seguridad, vulnerabilidades y mejores prácticas de ciberseguridad',
      color: '#dc2626'
    })
    
    // Get existing posts to avoid duplicates
    const existingPosts = await payload.find({
      collection: 'blog-posts',
      where: {
        sourceUrl: { exists: true }
      },
      limit: 1000
    })
    
    const existingUrls = new Set(existingPosts.docs.map(post => (post as any).sourceUrl))
    const newItems = rssItems.filter(item => !existingUrls.has(item.link)).slice(0, limit)
    
    const results = []
    
    for (const item of newItems) {
      try {
        // Create Spanish version
        const spanishPost = parseRSSItemToPost(item, 'es')
        const spanishResult = await payload.create({
          collection: 'blog-posts',
          data: {
            ...spanishPost,
            category: cybersecurityCategory.id,
            locale: 'es'
          }
        })
        
        // Create English version
        const englishPost = parseRSSItemToPost(item, 'en')
        const englishResult = await payload.create({
          collection: 'blog-posts',
          data: {
            ...englishPost,
            category: cybersecurityCategory.id,
            locale: 'en'
          }
        })
        
        results.push({ spanish: spanishResult, english: englishResult })
        console.log(`Imported: ${item.title}`)
      } catch (error) {
        console.error(`Error importing ${item.title}:`, error)
      }
    }
    
    return {
      imported: results.length,
      total: rssItems.length,
      results
    }
  } catch (error) {
    console.error('Error importing RSS feed:', error)
    throw error
  }
}

async function getOrCreateCategory(payload: any, slug: string, categoryData: any) {
  // Try to find existing category
  const existing = await payload.find({
    collection: 'blog-categories',
    where: {
      slug: { equals: slug }
    },
    limit: 1
  })
  
  if (existing.docs.length > 0) {
    return existing.docs[0]
  }
  
  // Create new category
  return await payload.create({
    collection: 'blog-categories',
    data: categoryData
  })
}
