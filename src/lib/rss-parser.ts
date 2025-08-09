import Parser from 'rss-parser'

// RSS Parser configuration with custom fields
export const rssParser = new Parser({
  customFields: {
    feed: ['language', 'copyright', 'managingEditor'],
    item: [
      ['media:content', 'mediaContent'],
      ['media:thumbnail', 'mediaThumbnail'],
      ['content:encoded', 'contentEncoded'],
      ['dc:creator', 'creator'],
      ['dc:date', 'dcDate'],
      ['atom:updated', 'atomUpdated'],
    ]
  },
  timeout: 10000, // 10 second timeout
  headers: {
    'User-Agent': 'CECOM RSS Reader/1.0'
  }
})

// Types for RSS parsing
export interface RSSItem {
  title: string
  link: string
  pubDate: string
  creator?: string
  contentSnippet?: string
  content?: string
  contentEncoded?: string
  guid?: string
  categories?: string[]
  mediaContent?: {
    $: {
      url: string
      type?: string
      medium?: string
    }
  }
  mediaThumbnail?: {
    $: {
      url: string
      width?: string
      height?: string
    }
  }
  dcDate?: string
  atomUpdated?: string
}

export interface RSSFeed {
  title: string
  description: string
  link: string
  language?: string
  copyright?: string
  managingEditor?: string
  lastBuildDate?: string
  items: RSSItem[]
}

export interface ParsedArticle {
  id: string
  title: string
  summary: string
  content: string
  publishedAt: string
  sourceUrl: string
  vendorId: string
  vendorName: string
  image?: string
  tags: string[]
  author?: string
}

// Utility function to extract image URL from RSS item
export function extractImageUrl(item: RSSItem): string | undefined {
  // Try media:content first
  if (item.mediaContent && item.mediaContent.$ && item.mediaContent.$.url) {
    return item.mediaContent.$.url
  }
  
  // Try media:thumbnail
  if (item.mediaThumbnail && item.mediaThumbnail.$ && item.mediaThumbnail.$.url) {
    return item.mediaThumbnail.$.url
  }
  
  // Try to extract image from content
  if (item.content || item.contentEncoded) {
    const content = item.contentEncoded || item.content || ''
    const imgMatch = content.match(/<img[^>]+src="([^"]+)"/i)
    if (imgMatch && imgMatch[1]) {
      return imgMatch[1]
    }
  }
  
  return undefined
}

// Utility function to clean and truncate text content
export function cleanTextContent(text: string, maxLength: number = 300): string {
  if (!text) return ''
  
  // Remove HTML tags
  const cleanText = text.replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .trim()
  
  // Truncate if needed
  if (cleanText.length <= maxLength) {
    return cleanText
  }
  
  return cleanText.substring(0, maxLength).trim() + '...'
}

// Utility function to generate consistent article ID
export function generateArticleId(item: RSSItem, vendorId: string): string {
  // Use GUID if available
  if (item.guid) {
    return item.guid.toString()
  }
  
  // Use link if available
  if (item.link) {
    return item.link
  }
  
  // Generate from vendor + title + date
  const title = item.title || 'untitled'
  const date = item.pubDate || new Date().toISOString()
  const hash = Buffer.from(`${vendorId}-${title}-${date}`).toString('base64')
  
  return `${vendorId}-${hash}`
}

// Utility function to parse publication date
export function parsePublicationDate(item: RSSItem): string {
  // Try different date fields in order of preference
  const dateFields = [item.pubDate, item.dcDate, item.atomUpdated]
  
  for (const dateField of dateFields) {
    if (dateField) {
      const parsed = new Date(dateField)
      if (!isNaN(parsed.getTime())) {
        return parsed.toISOString()
      }
    }
  }
  
  // Fallback to current date
  return new Date().toISOString()
}

// Main function to parse RSS feed and convert to articles
export async function parseRSSFeedToArticles(
  url: string, 
  vendorId: string, 
  vendorName: string
): Promise<ParsedArticle[]> {
  try {
    console.log(`Parsing RSS feed for ${vendorName}: ${url}`)
    
    const feed = await rssParser.parseURL(url) as RSSFeed
    
    if (!feed.items || feed.items.length === 0) {
      console.log(`No items found in RSS feed for ${vendorName}`)
      return []
    }

    const articles: ParsedArticle[] = feed.items.map((item: RSSItem) => {
      const id = generateArticleId(item, vendorId)
      const image = extractImageUrl(item)
      const summary = cleanTextContent(item.contentSnippet || item.content || item.title || '', 300)
      const content = item.contentEncoded || item.content || summary
      const publishedAt = parsePublicationDate(item)
      const tags = item.categories || []
      const author = item.creator
      
      return {
        id,
        title: item.title || 'Untitled',
        summary,
        content,
        publishedAt,
        sourceUrl: item.link || '',
        vendorId,
        vendorName,
        image,
        tags,
        author
      }
    })

    console.log(`Successfully parsed ${articles.length} articles from ${vendorName}`)
    return articles

  } catch (error) {
    console.error(`Error parsing RSS feed for ${vendorName} (${url}):`, error)
    
    // Return empty array instead of throwing to allow other feeds to continue
    return []
  }
}

// Utility function to validate RSS URL
export function isValidRSSUrl(url: string): boolean {
  try {
    const parsedUrl = new URL(url)
    return parsedUrl.protocol === 'http:' || parsedUrl.protocol === 'https:'
  } catch {
    return false
  }
}

// Utility function to test RSS feed accessibility
export async function testRSSFeed(url: string): Promise<{ success: boolean; error?: string; itemCount?: number }> {
  try {
    if (!isValidRSSUrl(url)) {
      return { success: false, error: 'Invalid URL format' }
    }
    
    const feed = await rssParser.parseURL(url)
    
    return {
      success: true,
      itemCount: feed.items?.length || 0
    }
    
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}