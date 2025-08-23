#!/usr/bin/env node

/**
 * Script simplificado para probar solo el fetch del RSS sin PayloadCMS
 */

const { XMLParser } = require('fast-xml-parser')

async function fetchExtremeNetworksRSS() {
  try {
    console.log('📡 Obteniendo feed RSS de Extreme Networks...')
    
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
    const items = Array.isArray(result.rss.channel.item) 
      ? result.rss.channel.item 
      : [result.rss.channel.item]
    
    return items.filter(item => item && item.title)
  } catch (error) {
    console.error('Error fetching RSS feed:', error)
    return []
  }
}

function parseRSSItemToPost(item, locale = 'es') {
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
  const tags = locale === 'es' ? ['seguridad', 'extreme-networks', 'vulnerabilidad'] : ['security', 'extreme-networks', 'vulnerability']
  if (cveMatch) {
    tags.push(cveMatch[0].toLowerCase())
  }

  const title = locale === 'es' ? 
    item.title.replace(/Security Advisory/gi, 'Aviso de Seguridad').replace(/Vulnerability/gi, 'Vulnerabilidad') :
    item.title

  return {
    title,
    slug: `${slug}-${locale}`,
    excerpt: cleanDescription.substring(0, 200) + '...',
    publishedDate: new Date(item.pubDate),
    tags,
    sourceUrl: item.link,
    readingTime: Math.ceil(cleanDescription.length / 1000)
  }
}

async function testRSSOnly() {
  try {
    console.log('🚀 Probando importación RSS (sin base de datos)...')
    console.log('=' .repeat(50))
    
    const rssItems = await fetchExtremeNetworksRSS()
    console.log(`✅ Encontrados ${rssItems.length} artículos en el feed`)
    
    if (rssItems.length === 0) {
      console.log('⚠️  No se encontraron artículos en el feed RSS')
      return
    }
    
    console.log('\n📋 Preview de los primeros 5 artículos:')
    const preview = rssItems.slice(0, 5)
    
    preview.forEach((item, index) => {
      console.log(`\n${index + 1}. ${item.title}`)
      console.log(`   📅 Fecha: ${new Date(item.pubDate).toLocaleDateString('es-DO')}`)
      console.log(`   🔗 URL: ${item.link}`)
      
      const spanishPost = parseRSSItemToPost(item, 'es')
      const englishPost = parseRSSItemToPost(item, 'en')
      
      console.log(`   🇪🇸 Título ES: ${spanishPost.title}`)
      console.log(`   🇺🇸 Título EN: ${englishPost.title}`)
      console.log(`   📝 Slug: ${spanishPost.slug}`)
      console.log(`   ⏱️  Tiempo lectura: ${spanishPost.readingTime} min`)
    })
    
    console.log('\n✅ Prueba del RSS completada exitosamente!')
    console.log('💡 El feed RSS funciona correctamente y el contenido se puede procesar.')
    
  } catch (error) {
    console.error('\n❌ Error durante la prueba:', error.message)
  }
}

testRSSOnly()
