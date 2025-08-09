import { NextRequest, NextResponse } from 'next/server'
import { getVendors } from '@/lib/payload/api'
import type { Vendor } from '@/lib/payload/types'
import { parseRSSFeedToArticles, ParsedArticle } from '@/lib/rss-parser'
import fs from 'fs'
import path from 'path'

interface StoredArticle extends ParsedArticle {
  createdAt: string
  updatedAt: string
}

// Function to read existing articles from JSON file
async function readExistingArticles(): Promise<StoredArticle[]> {
  try {
    const articlesPath = path.join(process.cwd(), 'data/feeds/articles.json')
    const fileContents = fs.readFileSync(articlesPath, 'utf8')
    return JSON.parse(fileContents)
  } catch (error) {
    console.log('No existing articles file found, starting fresh')
    return []
  }
}

// Function to save articles to JSON file
async function saveArticles(articles: StoredArticle[]): Promise<void> {
  try {
    const articlesPath = path.join(process.cwd(), 'data/feeds/articles.json')
    
    // Ensure directory exists
    const dir = path.dirname(articlesPath)
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
    }
    
    fs.writeFileSync(articlesPath, JSON.stringify(articles, null, 2))
    console.log(`Saved ${articles.length} articles to ${articlesPath}`)
  } catch (error) {
    console.error('Error saving articles:', error)
    throw error
  }
}

// Function to convert ParsedArticle to StoredArticle with timestamps
function convertToStoredArticle(article: ParsedArticle): StoredArticle {
  const now = new Date().toISOString()
  return {
    ...article,
    createdAt: now,
    updatedAt: now
  }
}

// Function to detect and remove duplicates
function deduplicateArticles(existingArticles: StoredArticle[], newArticles: StoredArticle[]): StoredArticle[] {
  const existingIds = new Set(existingArticles.map(article => article.id))
  const existingUrls = new Set(existingArticles.map(article => article.sourceUrl))
  const existingTitles = new Set(existingArticles.map(article => `${article.vendorId}-${article.title.toLowerCase()}`))
  
  const uniqueNewArticles = newArticles.filter(article => {
    // Check for duplicate by ID
    if (existingIds.has(article.id)) {
      return false
    }
    
    // Check for duplicate by URL
    if (article.sourceUrl && existingUrls.has(article.sourceUrl)) {
      return false
    }
    
    // Check for duplicate by vendor + title combination
    const titleKey = `${article.vendorId}-${article.title.toLowerCase()}`
    if (existingTitles.has(titleKey)) {
      return false
    }
    
    return true
  })
  
  console.log(`Filtered out ${newArticles.length - uniqueNewArticles.length} duplicate articles`)
  return uniqueNewArticles
}

// POST endpoint to refresh RSS feeds and store articles
export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const vendorId = searchParams.get('vendor')
    
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

    // Read existing articles
    const existingArticles = await readExistingArticles()
    console.log(`Found ${existingArticles.length} existing articles`)

    let allNewArticles: StoredArticle[] = []
    const errors: string[] = []
    const processedVendors: string[] = []

    // Process each vendor's RSS feed
    for (const vendor of targetVendors) {
      try {
        const parsedArticles = await parseRSSFeedToArticles(vendor.rssUrl!, vendor.id, vendor.name)
        const storedArticles = parsedArticles.map(convertToStoredArticle)
        allNewArticles.push(...storedArticles)
        processedVendors.push(vendor.name)
        
      } catch (error) {
        const errorMsg = `Failed to fetch RSS for ${vendor.name}: ${error}`
        console.error(errorMsg)
        errors.push(errorMsg)
      }
    }

    // Remove duplicates
    const uniqueNewArticles = deduplicateArticles(existingArticles, allNewArticles)
    
    // Combine existing and new articles
    const allArticles = [...existingArticles, ...uniqueNewArticles]
    
    // Sort by publication date (newest first)
    allArticles.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
    
    // Limit total articles to prevent file from growing too large (keep last 1000)
    const maxArticles = 1000
    const finalArticles = allArticles.slice(0, maxArticles)
    
    // Save updated articles
    await saveArticles(finalArticles)

    return NextResponse.json({
      success: true,
      message: 'RSS feeds refreshed successfully',
      stats: {
        totalArticles: finalArticles.length,
        newArticles: uniqueNewArticles.length,
        duplicatesFiltered: allNewArticles.length - uniqueNewArticles.length,
        vendorsProcessed: processedVendors.length,
        processedVendors,
        errors: errors.length > 0 ? errors : undefined
      }
    })

  } catch (error) {
    console.error('Error in RSS refresh API:', error)
    return NextResponse.json({
      success: false,
      error: 'Internal server error while refreshing RSS feeds',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// GET endpoint to check refresh status and last refresh time
export async function GET(request: NextRequest) {
  try {
    const existingArticles = await readExistingArticles()
    
    // Get the most recent article timestamp to determine last refresh
    const lastRefresh = existingArticles.length > 0 
      ? Math.max(...existingArticles.map(a => new Date(a.createdAt).getTime()))
      : null

    const vendors = await getVendors()
    const vendorsWithRSS = vendors.filter((vendor: Vendor) => Boolean(vendor.rssUrl))

    return NextResponse.json({
      success: true,
      stats: {
        totalArticles: existingArticles.length,
        lastRefresh: lastRefresh ? new Date(lastRefresh).toISOString() : null,
        vendorsWithRSS: vendorsWithRSS.length,
        vendors: vendorsWithRSS.map((v: Vendor) => ({
          id: v.id,
          name: v.name,
          rssUrl: v.rssUrl
        }))
      }
    })

  } catch (error) {
    console.error('Error getting refresh status:', error)
    return NextResponse.json({
      success: false,
      error: 'Internal server error while getting refresh status',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}