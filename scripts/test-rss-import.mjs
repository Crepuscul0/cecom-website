#!/usr/bin/env node

/**
 * Script simplificado para probar la importación RSS usando ES modules
 */

import { getPayload } from '../src/lib/payload.js'
import { fetchExtremeNetworksRSS, parseRSSItemToPost } from '../src/lib/rss-importer.js'

async function testRSSImport() {
  try {
    console.log('🚀 Probando importación RSS de Extreme Networks...')
    console.log('=' .repeat(50))
    
    // Paso 1: Probar fetch del RSS
    console.log('\n📡 Obteniendo feed RSS...')
    const rssItems = await fetchExtremeNetworksRSS()
    console.log(`✅ Encontrados ${rssItems.length} artículos en el feed`)
    
    if (rssItems.length === 0) {
      console.log('⚠️  No se encontraron artículos en el feed RSS')
      return
    }
    
    // Paso 2: Mostrar preview de los primeros 3 artículos
    console.log('\n📋 Preview de los primeros 3 artículos:')
    const preview = rssItems.slice(0, 3)
    
    preview.forEach((item, index) => {
      console.log(`\n${index + 1}. ${item.title}`)
      console.log(`   📅 Fecha: ${new Date(item.pubDate).toLocaleDateString('es-DO')}`)
      console.log(`   🔗 URL: ${item.link}`)
      
      // Mostrar cómo se vería procesado
      const spanishPost = parseRSSItemToPost(item, 'es')
      const englishPost = parseRSSItemToPost(item, 'en')
      
      console.log(`   🇪🇸 Título ES: ${spanishPost.title}`)
      console.log(`   🇺🇸 Título EN: ${englishPost.title}`)
      console.log(`   📝 Slug: ${spanishPost.slug}`)
    })
    
    // Paso 3: Intentar conectar con PayloadCMS
    console.log('\n🔌 Probando conexión con PayloadCMS...')
    try {
      const payload = await getPayload()
      console.log('✅ Conexión con PayloadCMS exitosa')
      
      // Verificar colecciones existentes
      const categories = await payload.find({
        collection: 'blog-categories',
        limit: 5
      })
      
      const tags = await payload.find({
        collection: 'blog-tags', 
        limit: 5
      })
      
      console.log(`📁 Categorías existentes: ${categories.totalDocs}`)
      console.log(`🏷️  Tags existentes: ${tags.totalDocs}`)
      
    } catch (payloadError) {
      console.log('❌ Error conectando con PayloadCMS:', payloadError.message)
      console.log('💡 Asegúrate de que la base de datos esté configurada correctamente')
    }
    
    console.log('\n✅ Prueba completada!')
    console.log('💡 Si todo se ve bien, ejecuta la importación completa con:')
    console.log('   node scripts/import-extreme-rss.js --limit=5')
    
  } catch (error) {
    console.error('\n❌ Error durante la prueba:', error.message)
    console.error('🔧 Detalles:', error)
  }
}

testRSSImport()
