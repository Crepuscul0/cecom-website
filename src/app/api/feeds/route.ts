import { NextRequest, NextResponse } from 'next/server'
import { getVendors } from '@/lib/payload/api'
import { parseRSSFeedToArticles, ParsedArticle } from '@/lib/rss-parser'
import type { Vendor } from '@/lib/payload/types'

// Cache for RSS feeds to prevent excessive API calls
const feedCache = new Map<string, { data: ParsedArticle[], lastFetched: number }>()
const CACHE_DURATION = 30 * 60 * 1000 // 30 minutes in milliseconds

// GET endpoint to fetch RSS feeds from all vendors
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const vendorId = searchParams.get('vendor')
    const forceRefresh = searchParams.get('refresh') === 'true'
    
    // Get vendors with RSS URLs
    const vendors = await getVendors()
    const vendorsWithRSS = vendors.filter((vendor: Vendor) => Boolean(vendor.rssUrl))
    
    if (vendorsWithRSS.length === 0) {
      return NextResponse.json({ 
        success: true, 
        articles: [], 
        message: 'No vendors with RSS feeds found' 
      })
    }

    let allArticles: ParsedArticle[] = []
    const errors: string[] = []

    // If specific vendor requested, filter to that vendor
    const targetVendors: Vendor[] = vendorId 
      ? vendorsWithRSS.filter((v: Vendor) => v.id === vendorId)
      : vendorsWithRSS

    if (vendorId && targetVendors.length === 0) {
      return NextResponse.json({ 
        success: false, 
        error: `Vendor with ID '${vendorId}' not found or has no RSS feed` 
      }, { status: 404 })
    }

    // Process each vendor's RSS feed
    for (const vendor of targetVendors) {
      const cacheKey = `${vendor.id}-${vendor.rssUrl}`
      const now = Date.now()
      
      // Check cache first (unless force refresh)
      if (!forceRefresh && feedCache.has(cacheKey)) {
        const cached = feedCache.get(cacheKey)!
        if (now - cached.lastFetched < CACHE_DURATION) {
          console.log(`Using cached data for ${vendor.name}`)
          allArticles.push(...cached.data)
          continue
        }
      }

      try {
        const articles = await parseRSSFeedToArticles(vendor.rssUrl!, vendor.id, vendor.name)
        
        // Cache the results
        feedCache.set(cacheKey, {
          data: articles,
          lastFetched: now
        })
        
        allArticles.push(...articles)
        
      } catch (error) {
        const errorMsg = `Failed to fetch RSS for ${vendor.name}: ${error}`
        console.error(errorMsg)
        errors.push(errorMsg)
      }
    }

    // Sort articles by publication date (newest first)
    allArticles.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())

    // Limit results if needed
    const limit = parseInt(searchParams.get('limit') || '50')
    if (limit > 0) {
      allArticles = allArticles.slice(0, limit)
    }

    return NextResponse.json({
      success: true,
      articles: allArticles,
      totalCount: allArticles.length,
      vendorsProcessed: targetVendors.length,
      errors: errors.length > 0 ? errors : undefined,
      cached: !forceRefresh
    })

  } catch (error) {
    console.error('Error in RSS feeds API:', error)
    return NextResponse.json({
      success: false,
      error: 'Internal server error while fetching RSS feeds',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}