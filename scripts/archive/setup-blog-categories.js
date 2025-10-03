#!/usr/bin/env node

/**
 * Script para crear las categorías iniciales del blog en PayloadCMS
 */

// Import using ES modules syntax for Next.js compatibility
async function getPayloadInstance() {
  const { getPayload } = await import('../src/lib/payload.js')
  return getPayload()
}

async function createBlogCategories() {
  try {
    console.log('🚀 Iniciando creación de categorías del blog...')
    
    const payload = await getPayloadInstance()
    
    // Categorías a crear
    const categories = [
      {
        name: { en: 'Cybersecurity', es: 'Ciberseguridad' },
        slug: 'cybersecurity',
        description: { 
          en: 'Security advisories, vulnerabilities, and cybersecurity best practices',
          es: 'Avisos de seguridad, vulnerabilidades y mejores prácticas de ciberseguridad'
        },
        color: '#dc2626' // Red color for security
      },
      {
        name: { en: 'Networking', es: 'Redes' },
        slug: 'networking',
        description: { 
          en: 'Network infrastructure, configurations, and best practices',
          es: 'Infraestructura de red, configuraciones y mejores prácticas'
        },
        color: '#2563eb' // Blue color for networking
      },
      {
        name: { en: 'Technology Solutions', es: 'Soluciones Tecnológicas' },
        slug: 'technology-solutions',
        description: { 
          en: 'Enterprise technology solutions and implementations',
          es: 'Soluciones tecnológicas empresariales e implementaciones'
        },
        color: '#059669' // Green color for solutions
      },
      {
        name: { en: 'Product Updates', es: 'Actualizaciones de Productos' },
        slug: 'product-updates',
        description: { 
          en: 'Latest product updates, releases, and announcements',
          es: 'Últimas actualizaciones, lanzamientos y anuncios de productos'
        },
        color: '#7c3aed' // Purple color for updates
      }
    ]
    
    const results = []
    
    for (const category of categories) {
      try {
        // Check if category already exists
        const existing = await payload.find({
          collection: 'blog-categories',
          where: {
            slug: { equals: category.slug }
          },
          limit: 1
        })
        
        if (existing.docs.length > 0) {
          console.log(`⚠️  Categoría '${category.slug}' ya existe, saltando...`)
          continue
        }
        
        // Create category
        const result = await payload.create({
          collection: 'blog-categories',
          data: category
        })
        
        results.push(result)
        console.log(`✅ Categoría creada: ${category.name.es} / ${category.name.en}`)
        
      } catch (error) {
        console.error(`❌ Error creando categoría ${category.slug}:`, error.message)
      }
    }
    
    console.log('\n📊 Resumen:')
    console.log(`✅ Categorías creadas: ${results.length}`)
    console.log(`📋 Total categorías: ${categories.length}`)
    
    return results
    
  } catch (error) {
    console.error('❌ Error general:', error.message)
    process.exit(1)
  }
}

// Ejecutar solo si es llamado directamente
if (require.main === module) {
  createBlogCategories()
}

module.exports = { createBlogCategories }
