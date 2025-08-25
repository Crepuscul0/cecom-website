#!/usr/bin/env node

/**
 * Script para importar contenido del RSS de Extreme Networks directamente a Supabase
 * Uso: node scripts/import-extreme-rss-supabase.js [--limit=10] [--dry-run]
 */

require('dotenv').config({ path: '.env.local' })
const { importRSSToSupabase, fetchExtremeNetworksRSS, parseRSSItemToPost } = require('./rss-supabase-importer')

async function main() {
  const args = process.argv.slice(2)
  const limitArg = args.find(arg => arg.startsWith('--limit='))
  const dryRun = args.includes('--dry-run')
  
  const limit = limitArg ? parseInt(limitArg.split('=')[1]) : 10
  
  console.log('🚀 Iniciando importación del RSS de Extreme Networks a Supabase...')
  console.log(`📊 Límite de artículos: ${limit}`)
  console.log(`🧪 Modo prueba: ${dryRun ? 'SÍ' : 'NO'}`)
  console.log('─'.repeat(50))
  
  if (dryRun) {
    console.log('⚠️  MODO PRUEBA - No se guardarán datos en Supabase')
    // En modo prueba, solo mostramos qué se importaría
    try {
      const rssItems = await fetchExtremeNetworksRSS()
      
      console.log(`📋 Se importarían ${Math.min(limit, rssItems.length)} artículos:`)
      for (let i = 0; i < Math.min(limit, rssItems.length); i++) {
        const item = rssItems[i]
        const post = parseRSSItemToPost(item, 'es')
        console.log(`  ${i + 1}. ${post.title}`)
        console.log(`     Slug: ${post.slug}`)
        console.log(`     Fecha: ${post.publishedDate.toLocaleDateString('es-ES')}`)
        console.log('')
      }
    } catch (error) {
      console.error('❌ Error en modo prueba:', error.message)
    }
    return
  }
  
  try {
    const result = await importRSSToSupabase(limit)
    
    console.log('✅ Importación completada!')
    console.log(`📝 Artículos importados: ${result.imported}`)
    console.log(`📊 Total disponibles: ${result.total}`)
    
    if (result.imported > 0) {
      console.log('\n📋 Artículos importados:')
      result.results.forEach((item, index) => {
        console.log(`  ${index + 1}. ${item.post.title}`)
      })
    } else {
      console.log('\n⚠️  No se importaron artículos nuevos (posiblemente ya existen)')
    }
    
  } catch (error) {
    console.error('❌ Error durante la importación:', error.message)
    console.error('Stack:', error.stack)
    process.exit(1)
  }
}

// Ejecutar solo si es llamado directamente
if (require.main === module) {
  main()
}

module.exports = { main }
