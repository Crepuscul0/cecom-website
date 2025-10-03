#!/usr/bin/env node

require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')
const { XMLParser } = require('fast-xml-parser')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const supabase = createClient(supabaseUrl, supabaseServiceKey)

// Existing slugs in Supabase (from previous query)
const existingSlugs = new Set([
  'sa-2025-007-apache-tomcat-toctou-race-condition-vulnerability-cve-2024-50379-es',
  'sa-2023-059-dheat-attack-cve-2002-20001-es',
  'sa-2025-065-diffie-hellman-resource-exhaustion-cve-2024-41996-es',
  'sa-2023-088-diffie-hellman-key-allows-long-exponents-cve-2022-40735-es',
  'sa-2024-011-libcurl-http-authentication-leak-cve-2018-1000007-es',
  'mejores-practicas-ciberseguridad-empresas-2024',
  'infraestructura-red-moderna-empresas',
  'transformacion-digital-pymes-dominicanas'
])

function translateSecurityTitle(title) {
  return title
    .replace(/Vulnerability/gi, 'Vulnerabilidad')
    .replace(/Attack/gi, 'Ataque')
    .replace(/Resource Exhaustion/gi, 'Agotamiento de Recursos')
    .replace(/Race Condition/gi, 'Condición de Carrera')
    .replace(/Authentication leak/gi, 'Filtración de Autenticación')
    .replace(/allows long exponents/gi, 'permite exponentes largos')
    .replace(/Remote Code Execution/gi, 'Ejecución Remota de Código')
    .replace(/Cross-Site Scripting/gi, 'Scripting entre Sitios')
    .replace(/Privilege Escalation/gi, 'Escalación de Privilegios')
    .replace(/Memory Leak/gi, 'Fuga de Memoria')
    .replace(/Authentication Bypass/gi, 'Bypass de Autenticación')
    .replace(/Improper Authorization/gi, 'Autorización Inadecuada')
    .replace(/Heap Buffer Overflow/gi, 'Desbordamiento de Buffer de Heap')
    .replace(/Use After Free/gi, 'Uso Después de Liberación')
    .replace(/out-of-bounds read/gi, 'lectura fuera de límites')
    .replace(/trailer/gi, 'trailer')
    .replace(/Untrusted Library/gi, 'Biblioteca No Confiable')
}

function generateSpanishContent(item, cleanDescription) {
  const cveMatch = item.title.match(/CVE-\d{4}-\d+/)
  const saMatch = item.title.match(/SA-\d{4}-\d+/)
  
  return `
# ${translateSecurityTitle(item.title)}

## Resumen de la Vulnerabilidad

${cleanDescription}

## Detalles Técnicos

**Identificador:** ${cveMatch ? cveMatch[0] : 'N/A'}
**Boletín de Seguridad:** ${saMatch ? saMatch[0] : 'N/A'}
**Fecha de Publicación:** ${new Date(item.pubDate).toLocaleDateString('es-DO')}

## Recomendaciones

- Revise los productos afectados en el enlace oficial
- Aplique las actualizaciones de seguridad recomendadas
- Consulte con el equipo de CECOM para implementación

## Enlaces de Referencia

- [Boletín Original de Extreme Networks](${item.link})
- [Información del CVE](https://cve.mitre.org/cgi-bin/cvename.cgi?name=${cveMatch ? cveMatch[0] : ''})

---

*Este artículo es una traducción y resumen del boletín de seguridad original de Extreme Networks. Para información técnica detallada, consulte el enlace original.*
`.trim()
}

function parseRSSItemToPost(item) {
  const cleanDescription = item.description
    .replace(/<!\[CDATA\[/g, '')
    .replace(/\]\]>/g, '')
    .replace(/<[^>]*>/g, '')
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
    .trim() + '-es'

  const translatedTitle = translateSecurityTitle(item.title)
  const spanishContent = generateSpanishContent(item, cleanDescription)
  
  const cveMatch = item.title.match(/CVE-\d{4}-\d+/)
  const tags = ['seguridad', 'extreme-networks', 'vulnerabilidad']
  if (cveMatch) {
    tags.push(cveMatch[0].toLowerCase())
  }

  return {
    title: translatedTitle,
    slug: slug,
    excerpt: cleanDescription.substring(0, 200) + '...',
    content: spanishContent,
    published_date: new Date(item.pubDate).toISOString(),
    status: 'published',
    category_id: 'f3c265c9-390a-4572-994a-db7d2ca5948b', // Ciberseguridad category
    featured_image: '/blog/cybersecurity-placeholder.jpg',
    author: 'Equipo CECOM',
    source_url: item.link,
    reading_time: 5,
    meta_title: translatedTitle,
    meta_description: cleanDescription.substring(0, 160),
    meta_keywords: tags.join(', ')
  }
}

async function importMissingPosts() {
  console.log('🚀 IMPORTING MISSING RSS POSTS TO SUPABASE')
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
    
    console.log(`✅ Found ${rssItems.length} RSS items`)
    
    // 2. Filter missing posts
    const missingPosts = []
    
    rssItems.forEach(item => {
      const slug = item.title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim() + '-es'
      
      if (!existingSlugs.has(slug)) {
        missingPosts.push(parseRSSItemToPost(item))
      }
    })
    
    console.log(`📊 Found ${missingPosts.length} missing posts to import`)
    
    // 3. Import missing posts
    let imported = 0
    for (const post of missingPosts) {
      try {
        const { error } = await supabase
          .from('blog_posts')
          .insert([post])
        
        if (error) {
          console.error(`❌ Error importing "${post.title}":`, error.message)
        } else {
          console.log(`✅ Imported: ${post.title}`)
          imported++
        }
      } catch (err) {
        console.error(`❌ Exception importing "${post.title}":`, err.message)
      }
    }
    
    console.log(`\n🎯 IMPORT COMPLETE`)
    console.log(`✅ Successfully imported: ${imported} posts`)
    console.log(`❌ Failed to import: ${missingPosts.length - imported} posts`)
    console.log(`📊 Total posts should now be: ${8 + imported}`)
    
  } catch (error) {
    console.error('❌ Import error:', error)
  }
}

importMissingPosts()
