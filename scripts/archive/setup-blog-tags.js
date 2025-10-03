#!/usr/bin/env node

/**
 * Script para crear los tags iniciales del blog en PayloadCMS
 */

const { getPayload } = require('../src/lib/payload')

async function createBlogTags() {
  try {
    console.log('🚀 Iniciando creación de tags del blog...')
    
    const payload = await getPayload()
    
    // Tags a crear
    const tags = [
      { name: 'Seguridad', slug: 'seguridad' },
      { name: 'Security', slug: 'security' },
      { name: 'Extreme Networks', slug: 'extreme-networks' },
      { name: 'WatchGuard', slug: 'watchguard' },
      { name: 'Vulnerabilidad', slug: 'vulnerabilidad' },
      { name: 'Vulnerability', slug: 'vulnerability' },
      { name: 'Firewall', slug: 'firewall' },
      { name: 'Antivirus', slug: 'antivirus' },
      { name: 'Redes', slug: 'redes' },
      { name: 'Networking', slug: 'networking' },
      { name: 'Empresas', slug: 'empresas' },
      { name: 'Enterprise', slug: 'enterprise' },
      { name: 'República Dominicana', slug: 'republica-dominicana' },
      { name: 'Dominican Republic', slug: 'dominican-republic' },
      { name: 'CECOM', slug: 'cecom' },
      { name: 'Tecnología', slug: 'tecnologia' },
      { name: 'Technology', slug: 'technology' },
      { name: 'Soluciones', slug: 'soluciones' },
      { name: 'Solutions', slug: 'solutions' }
    ]
    
    const results = []
    
    for (const tag of tags) {
      try {
        // Check if tag already exists
        const existing = await payload.find({
          collection: 'blog-tags',
          where: {
            slug: { equals: tag.slug }
          },
          limit: 1
        })
        
        if (existing.docs.length > 0) {
          console.log(`⚠️  Tag '${tag.slug}' ya existe, saltando...`)
          continue
        }
        
        // Create tag
        const result = await payload.create({
          collection: 'blog-tags',
          data: tag
        })
        
        results.push(result)
        console.log(`✅ Tag creado: ${tag.name}`)
        
      } catch (error) {
        console.error(`❌ Error creando tag ${tag.slug}:`, error.message)
      }
    }
    
    console.log('\n📊 Resumen:')
    console.log(`✅ Tags creados: ${results.length}`)
    console.log(`📋 Total tags: ${tags.length}`)
    
    return results
    
  } catch (error) {
    console.error('❌ Error general:', error.message)
    process.exit(1)
  }
}

// Ejecutar solo si es llamado directamente
if (require.main === module) {
  createBlogTags()
}

module.exports = { createBlogTags }
