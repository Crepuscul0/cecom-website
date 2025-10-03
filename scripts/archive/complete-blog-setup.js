#!/usr/bin/env node

/**
 * Script completo para configurar el blog con categorías, tags e importar contenido RSS
 */

const { createBlogCategories } = require('./setup-blog-categories')
const { createBlogTags } = require('./setup-blog-tags')
const { importRSSToPayload } = require('../src/lib/rss-importer')

async function completeBlogSetup() {
  console.log('🚀 Iniciando configuración completa del blog CECOM...')
  console.log('=' .repeat(60))
  
  try {
    // Paso 1: Crear categorías
    console.log('\n📁 PASO 1: Creando categorías del blog...')
    await createBlogCategories()
    
    // Paso 2: Crear tags
    console.log('\n🏷️  PASO 2: Creando tags del blog...')
    await createBlogTags()
    
    // Paso 3: Importar contenido RSS (modo prueba primero)
    console.log('\n📰 PASO 3: Probando importación RSS...')
    console.log('⚠️  Ejecutando en modo prueba primero...')
    
    // Importar solo 3 artículos como prueba
    const result = await importRSSToPayload(3)
    
    console.log('\n✅ CONFIGURACIÓN COMPLETADA!')
    console.log('=' .repeat(60))
    console.log(`📊 Artículos importados: ${result.imported}`)
    console.log(`📋 Total disponibles en RSS: ${result.total}`)
    
    if (result.imported > 0) {
      console.log('\n📝 Artículos importados:')
      result.results.forEach((item, index) => {
        console.log(`  ${index + 1}. ${item.spanish.title}`)
      })
    }
    
    console.log('\n🎉 ¡El blog está listo para usar!')
    console.log('💡 Próximos pasos:')
    console.log('   1. Revisar contenido importado en PayloadCMS admin')
    console.log('   2. Ajustar categorías y tags según necesidades')
    console.log('   3. Configurar importación automática (cron job)')
    console.log('   4. Personalizar contenido importado')
    
  } catch (error) {
    console.error('\n❌ Error durante la configuración:', error.message)
    console.error('🔧 Revisa la configuración de PayloadCMS y la base de datos')
    process.exit(1)
  }
}

// Ejecutar solo si es llamado directamente
if (require.main === module) {
  completeBlogSetup()
}

module.exports = { completeBlogSetup }
