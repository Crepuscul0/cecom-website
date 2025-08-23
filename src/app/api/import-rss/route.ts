import { NextRequest, NextResponse } from 'next/server'
import { importRSSToPayload } from '@/lib/rss-importer'

export async function POST(request: NextRequest) {
  try {
    const { limit = 10, dryRun = false } = await request.json()
    
    if (dryRun) {
      // Return preview of what would be imported without actually importing
      const { fetchExtremeNetworksRSS, parseRSSItemToPost } = await import('@/lib/rss-importer')
      const rssItems = await fetchExtremeNetworksRSS()
      const preview = rssItems.slice(0, limit).map(item => ({
        title: item.title,
        pubDate: item.pubDate,
        link: item.link,
        spanish: parseRSSItemToPost(item, 'es'),
        english: parseRSSItemToPost(item, 'en')
      }))
      
      return NextResponse.json({
        success: true,
        dryRun: true,
        preview,
        total: rssItems.length
      })
    }
    
    const result = await importRSSToPayload(limit)
    
    return NextResponse.json({
      success: true,
      imported: result.imported,
      total: result.total,
      message: `Successfully imported ${result.imported} articles from Extreme Networks RSS feed`
    })
    
  } catch (error) {
    console.error('RSS import error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'RSS Import API',
    usage: {
      method: 'POST',
      body: {
        limit: 'number (default: 10) - Number of articles to import',
        dryRun: 'boolean (default: false) - Preview mode without importing'
      }
    }
  })
}
