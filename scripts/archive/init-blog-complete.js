#!/usr/bin/env node

/**
 * Script completo para inicializar el blog sin dependencias de PayloadCMS en desarrollo
 * Este script crea los datos necesarios directamente en la base de datos
 */

const fs = require('fs')
const path = require('path')

// Simulación de datos para desarrollo
const mockCategories = [
  {
    id: 'cat-cybersecurity',
    name: 'Ciberseguridad',
    slug: 'cybersecurity',
    description: 'Avisos de seguridad, vulnerabilidades y mejores prácticas de ciberseguridad',
    color: '#dc2626'
  },
  {
    id: 'cat-networking',
    name: 'Redes',
    slug: 'networking',
    description: 'Infraestructura de red, configuraciones y mejores prácticas',
    color: '#2563eb'
  },
  {
    id: 'cat-solutions',
    name: 'Soluciones Tecnológicas',
    slug: 'technology-solutions',
    description: 'Soluciones tecnológicas empresariales e implementaciones',
    color: '#059669'
  }
]

const mockTags = [
  { id: 'tag-security', name: 'Seguridad', slug: 'seguridad' },
  { id: 'tag-extreme', name: 'Extreme Networks', slug: 'extreme-networks' },
  { id: 'tag-vulnerability', name: 'Vulnerabilidad', slug: 'vulnerabilidad' },
  { id: 'tag-firewall', name: 'Firewall', slug: 'firewall' },
  { id: 'tag-enterprise', name: 'Empresas', slug: 'empresas' },
  { id: 'tag-dominican', name: 'República Dominicana', slug: 'republica-dominicana' }
]

async function createMockData() {
  try {
    console.log('🚀 Inicializando blog con datos de desarrollo...')
    
    // Crear directorio para datos mock si no existe
    const dataDir = path.join(__dirname, '..', 'data', 'blog')
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true })
    }
    
    // Guardar categorías
    fs.writeFileSync(
      path.join(dataDir, 'categories.json'),
      JSON.stringify(mockCategories, null, 2)
    )
    console.log('✅ Categorías creadas en data/blog/categories.json')
    
    // Guardar tags
    fs.writeFileSync(
      path.join(dataDir, 'tags.json'),
      JSON.stringify(mockTags, null, 2)
    )
    console.log('✅ Tags creados en data/blog/tags.json')
    
    // Crear posts de ejemplo usando el RSS
    const { XMLParser } = require('fast-xml-parser')
    
    console.log('📡 Obteniendo contenido del RSS...')
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
    
    // Procesar todos los artículos del feed
    const mockPosts = items.map((item, index) => {
      const cleanDescription = item.description
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
        .trim()

      const cveMatch = item.title.match(/CVE-\d{4}-\d+/)
      
      return {
        id: `post-${index + 1}`,
        title: item.title.replace(/Security Advisory/gi, 'Aviso de Seguridad').replace(/Vulnerability/gi, 'Vulnerabilidad'),
        slug: `${slug}-es`,
        excerpt: cleanDescription.substring(0, 200) + '...',
        content: generateSpanishContent(item, cleanDescription),
        publishedDate: item.pubDate,
        category: mockCategories[0].id, // Ciberseguridad
        tags: [mockTags[0].id, mockTags[1].id, mockTags[2].id], // Seguridad, Extreme Networks, Vulnerabilidad
        author: 'Equipo CECOM',
        readingTime: Math.ceil(cleanDescription.length / 1000),
        status: 'published',
        sourceUrl: item.link,
        featuredImage: '/blog/cybersecurity-placeholder.jpg',
        seo: {
          metaTitle: item.title,
          metaDescription: cleanDescription.substring(0, 160),
          keywords: `seguridad, extreme networks, vulnerabilidad${cveMatch ? ', ' + cveMatch[0] : ''}`
        }
      }
    })
    
    // Guardar posts
    fs.writeFileSync(
      path.join(dataDir, 'posts.json'),
      JSON.stringify(mockPosts, null, 2)
    )
    console.log(`✅ ${mockPosts.length} posts creados en data/blog/posts.json`)
    
    // Crear archivo de configuración del blog
    const blogConfig = {
      initialized: true,
      lastUpdate: new Date().toISOString(),
      totalCategories: mockCategories.length,
      totalTags: mockTags.length,
      totalPosts: mockPosts.length,
      rssSource: 'https://extreme-networks.my.site.com/apex/ExtrKnowledgeRSS',
      autoImport: false
    }
    
    fs.writeFileSync(
      path.join(dataDir, 'config.json'),
      JSON.stringify(blogConfig, null, 2)
    )
    console.log('✅ Configuración del blog guardada')
    
    console.log('\n🎉 ¡Blog inicializado exitosamente!')
    console.log('📊 Resumen:')
    console.log(`   📁 Categorías: ${mockCategories.length}`)
    console.log(`   🏷️  Tags: ${mockTags.length}`)
    console.log(`   📝 Posts: ${mockPosts.length}`)
    console.log('\n💡 Próximos pasos:')
    console.log('   1. Iniciar servidor de desarrollo: npm run dev')
    console.log('   2. Visitar /es/blog para ver el blog')
    console.log('   3. Configurar PayloadCMS para producción')
    
    return {
      categories: mockCategories.length,
      tags: mockTags.length,
      posts: mockPosts.length
    }
    
  } catch (error) {
    console.error('❌ Error durante la inicialización:', error.message)
    process.exit(1)
  }
}

function generateSpanishContent(item, description) {
  const cveMatch = item.title.match(/CVE-\d{4}-\d+/)
  const saMatch = item.title.match(/SA-\d{4}-\d+/)
  
  return `# ${item.title.replace(/Security Advisory/gi, 'Aviso de Seguridad').replace(/Vulnerability/gi, 'Vulnerabilidad')}

## Resumen de la Vulnerabilidad

${description.substring(0, 300)}...

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

// Ejecutar solo si es llamado directamente
if (require.main === module) {
  createMockData()
}

module.exports = { createMockData }
