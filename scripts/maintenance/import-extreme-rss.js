#!/usr/bin/env node

/**
 * Script para importar contenido del RSS de Extreme Networks al blog de CECOM
 * Uso: node scripts/import-extreme-rss.js [--limit=10] [--dry-run]
 */

const { importRSSToPayload } = require('../src/lib/rss-importer')

async function main() {
  const args = process.argv.slice(2)
  const limitArg = args.find(arg => arg.startsWith('--limit='))
  const dryRun = args.includes('--dry-run')
  
  const limit = limitArg ? parseInt(limitArg.split('=')[1]) : 10
  
  console.log('🚀 Iniciando importación del RSS de Extreme Networks...')
  console.log(`📊 Límite de artículos: ${limit}`)
  console.log(`🧪 Modo prueba: ${dryRun ? 'SÍ' : 'NO'}`)
  console.log('─'.repeat(50))
  
  if (dryRun) {
    console.log('⚠️  MODO PRUEBA - No se guardarán datos en la base de datos')
    // Aquí podrías implementar una versión de prueba que solo muestre qué se importaría
    return
  }
  
  try {
    const result = await importRSSToPayload(limit)
    
    console.log('✅ Importación completada!')
    console.log(`📝 Artículos importados: ${result.imported}`)
    console.log(`📊 Total disponibles: ${result.total}`)
    
    if (result.imported > 0) {
      console.log('\n📋 Artículos importados:')
      result.results.forEach((item, index) => {
        console.log(`  ${index + 1}. ${item.spanish.title}`)
      })
    }
    
  } catch (error) {
    console.error('❌ Error durante la importación:', error.message)
    process.exit(1)
  }
}

// Ejecutar solo si es llamado directamente
if (require.main === module) {
  main()
}
