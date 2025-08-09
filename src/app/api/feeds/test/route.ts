import { NextRequest, NextResponse } from 'next/server'
import { getVendors } from '@/lib/payload/api'
import { testRSSFeed, isValidRSSUrl } from '@/lib/rss-parser'
import type { Vendor } from '@/lib/payload/types'

// GET endpoint to test RSS feed accessibility
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const vendorId = searchParams.get('vendor')
    const testUrl = searchParams.get('url')
    
    // If a specific URL is provided, test that URL
    if (testUrl) {
      if (!isValidRSSUrl(testUrl)) {
        return NextResponse.json({
          success: false,
          error: 'Invalid RSS URL format'
        }, { status: 400 })
      }
      
      const result = await testRSSFeed(testUrl)
      
      return NextResponse.json({
        success: result.success,
        url: testUrl,
        error: result.error,
        itemCount: result.itemCount,
        message: result.success 
          ? `RSS feed is accessible with ${result.itemCount} items`
          : `RSS feed test failed: ${result.error}`
      })
    }
    
    // Get vendors with RSS URLs
    const vendors = await getVendors()
    const vendorsWithRSS = vendors.filter((vendor: Vendor) => Boolean(vendor.rssUrl))
    
    if (vendorsWithRSS.length === 0) {
      return NextResponse.json({ 
        success: false, 
        error: 'No vendors with RSS feeds found' 
      }, { status: 404 })
    }

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

    // Test each vendor's RSS feed
    const testResults = []
    
    for (const vendor of targetVendors) {
      const result = await testRSSFeed(vendor.rssUrl!)
      
      testResults.push({
        vendorId: vendor.id,
        vendorName: vendor.name,
        rssUrl: vendor.rssUrl,
        success: result.success,
        error: result.error,
        itemCount: result.itemCount
      })
    }

    const successCount = testResults.filter(r => r.success).length
    const failureCount = testResults.filter(r => !r.success).length

    return NextResponse.json({
      success: failureCount === 0,
      summary: {
        totalTested: testResults.length,
        successful: successCount,
        failed: failureCount
      },
      results: testResults,
      message: failureCount === 0 
        ? 'All RSS feeds are accessible'
        : `${failureCount} out of ${testResults.length} RSS feeds failed`
    })

  } catch (error) {
    console.error('Error in RSS test API:', error)
    return NextResponse.json({
      success: false,
      error: 'Internal server error while testing RSS feeds',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}