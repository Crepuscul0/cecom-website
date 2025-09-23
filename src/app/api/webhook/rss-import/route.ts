import { NextRequest, NextResponse } from 'next/server'
import { importExtremeNetworksRSS } from '@/lib/rss-importer'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { secret, limit = 10 } = body
    
    // Verificar secret
        if (!process.env.WEBHOOK_SECRET) {
      console.error('WEBHOOK_SECRET is not set. Aborting webhook processing.');
      return NextResponse.json({ error: 'Configuration error' }, { status: 500 });
    }

    const config = { secret: process.env.WEBHOOK_SECRET }
    if (secret !== config.secret) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    // Verificar IP (opcional)
    const clientIP = request.headers.get('x-forwarded-for') || 
                    request.headers.get('x-real-ip') || 
                    'unknown'
    
    console.log(`RSS Import webhook triggered from IP: ${clientIP}`)
    
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
      { error: 'Import failed', message: error instanceof Error ? error.message : 'Unknown error' },
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
}