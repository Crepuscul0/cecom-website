#!/usr/bin/env node

/**
 * Script para configurar automatización de importación RSS
 * Crea un cron job y webhook para actualizaciones regulares
 */

const fs = require('fs')
const path = require('path')

async function setupAutomation() {
  try {
    console.log('🤖 Configurando automatización del blog...')
    
    // Crear directorio de configuración
    const configDir = path.join(__dirname, '..', 'automation')
    if (!fs.existsSync(configDir)) {
      fs.mkdirSync(configDir, { recursive: true })
    }
    
    // Configuración de cron job
    const cronConfig = {
      schedule: '0 6 * * *', // Diariamente a las 6:00 AM
      command: 'node scripts/import-extreme-rss.js --limit=10',
      description: 'Importación diaria de RSS de Extreme Networks',
      enabled: true,
      lastRun: null,
      nextRun: null
    }
    
    fs.writeFileSync(
      path.join(configDir, 'cron-config.json'),
      JSON.stringify(cronConfig, null, 2)
    )
    
    // Script de cron job
    const cronScript = `#!/bin/bash
# Script de cron job para importación automática de RSS
# Agregar a crontab con: crontab -e
# 0 6 * * * /path/to/cecom-website/automation/daily-import.sh

cd "${process.cwd()}"
echo "$(date): Iniciando importación automática de RSS" >> automation/import.log
node scripts/import-extreme-rss.js --limit=10 >> automation/import.log 2>&1
echo "$(date): Importación completada" >> automation/import.log
`
    
    fs.writeFileSync(
      path.join(configDir, 'daily-import.sh'),
      cronScript
    )
    
    // Hacer ejecutable el script
    const { exec } = require('child_process')
    exec(`chmod +x ${path.join(configDir, 'daily-import.sh')}`)
    
    // Configuración de webhook
    const webhookConfig = {
      endpoint: '/api/webhook/rss-import',
      secret: 'cecom-rss-webhook-' + Math.random().toString(36).substring(7),
      enabled: true,
      allowedIPs: ['127.0.0.1', '::1'],
      rateLimit: {
        requests: 10,
        window: 3600 // 1 hora
      }
    }
    
    fs.writeFileSync(
      path.join(configDir, 'webhook-config.json'),
      JSON.stringify(webhookConfig, null, 2)
    )
    
    // Crear endpoint de webhook
    const webhookEndpoint = `import { NextRequest, NextResponse } from 'next/server'
import { importExtremeNetworksRSS } from '@/lib/rss-importer'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { secret, limit = 10 } = body
    
    // Verificar secret
    const config = require('../../../../automation/webhook-config.json')
    if (secret !== config.secret) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    // Verificar IP (opcional)
    const clientIP = request.headers.get('x-forwarded-for') || 
                    request.headers.get('x-real-ip') || 
                    'unknown'
    
    console.log(\`RSS Import webhook triggered from IP: \${clientIP}\`)
    
    // Ejecutar importación
    const result = await importExtremeNetworksRSS({ limit, dryRun: false })
    
    return NextResponse.json({
      success: true,
      imported: result.imported,
      skipped: result.skipped,
      errors: result.errors,
      timestamp: new Date().toISOString()
    })
    
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json(
      { error: 'Import failed', message: error.message },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({
    service: 'RSS Import Webhook',
    status: 'active',
    endpoint: '/api/webhook/rss-import',
    method: 'POST',
    requiredFields: ['secret'],
    optionalFields: ['limit']
  })
}`
    
    const webhookDir = path.join(__dirname, '..', 'src', 'app', 'api', 'webhook', 'rss-import')
    if (!fs.existsSync(webhookDir)) {
      fs.mkdirSync(webhookDir, { recursive: true })
    }
    
    fs.writeFileSync(
      path.join(webhookDir, 'route.ts'),
      webhookEndpoint
    )
    
    // Documentación de automatización
    const automationDocs = `# Automatización del Blog RSS

## Configuración Completada

### 1. Cron Job Diario
- **Horario**: Todos los días a las 6:00 AM
- **Comando**: \`node scripts/import-extreme-rss.js --limit=10\`
- **Script**: \`automation/daily-import.sh\`
- **Log**: \`automation/import.log\`

#### Para activar el cron job:
\`\`\`bash
# Editar crontab
crontab -e

# Agregar esta línea:
0 6 * * * ${process.cwd()}/automation/daily-import.sh
\`\`\`

### 2. Webhook para Importación Manual
- **Endpoint**: \`/api/webhook/rss-import\`
- **Método**: POST
- **Secret**: \`${webhookConfig.secret}\`

#### Ejemplo de uso:
\`\`\`bash
curl -X POST http://localhost:3000/api/webhook/rss-import \\
  -H "Content-Type: application/json" \\
  -d '{"secret": "${webhookConfig.secret}", "limit": 5}'
\`\`\`

### 3. Monitoreo
- Logs se guardan en \`automation/import.log\`
- Configuración en \`automation/\`
- Estado del webhook: GET \`/api/webhook/rss-import\`

### 4. Mantenimiento
- Revisar logs regularmente
- Ajustar límite de importación según necesidad
- Rotar logs mensualmente

## Próximos Pasos
1. Configurar cron job en el servidor de producción
2. Configurar alertas por email en caso de errores
3. Implementar dashboard de monitoreo
4. Configurar backup automático de contenido importado
`
    
    fs.writeFileSync(
      path.join(configDir, 'README.md'),
      automationDocs
    )
    
    // Crear archivo de log inicial
    fs.writeFileSync(
      path.join(configDir, 'import.log'),
      `# Log de Importación RSS - Iniciado ${new Date().toISOString()}\n`
    )
    
    console.log('✅ Automatización configurada exitosamente!')
    console.log('\n📋 Archivos creados:')
    console.log('   📁 automation/cron-config.json')
    console.log('   📁 automation/daily-import.sh')
    console.log('   📁 automation/webhook-config.json')
    console.log('   📁 automation/README.md')
    console.log('   📁 automation/import.log')
    console.log('   📁 src/app/api/webhook/rss-import/route.ts')
    
    console.log('\n🔧 Para activar:')
    console.log('   1. Configurar cron job: crontab -e')
    console.log('   2. Agregar línea: 0 6 * * * ' + process.cwd() + '/automation/daily-import.sh')
    console.log('   3. Probar webhook: curl -X POST http://localhost:3000/api/webhook/rss-import')
    
    console.log(`\n🔑 Webhook Secret: ${webhookConfig.secret}`)
    
    return {
      cronJob: true,
      webhook: true,
      secret: webhookConfig.secret
    }
    
  } catch (error) {
    console.error('❌ Error configurando automatización:', error.message)
    process.exit(1)
  }
}

// Ejecutar solo si es llamado directamente
if (require.main === module) {
  setupAutomation()
}

module.exports = { setupAutomation }
