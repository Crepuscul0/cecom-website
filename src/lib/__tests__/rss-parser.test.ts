import { describe, it, expect, vi } from 'vitest'
import { 
  isValidRSSUrl, 
  extractImageUrl, 
  cleanTextContent, 
  generateArticleId, 
  parsePublicationDate 
} from '../rss-parser'

describe('RSS Parser Utilities', () => {
  describe('isValidRSSUrl', () => {
    it('should validate HTTP URLs', () => {
      expect(isValidRSSUrl('http://example.com/rss')).toBe(true)
    })

    it('should validate HTTPS URLs', () => {
      expect(isValidRSSUrl('https://example.com/rss')).toBe(true)
    })

    it('should reject invalid URLs', () => {
      expect(isValidRSSUrl('not-a-url')).toBe(false)
      expect(isValidRSSUrl('ftp://example.com')).toBe(false)
      expect(isValidRSSUrl('')).toBe(false)
    })
  })

  describe('extractImageUrl', () => {
    it('should extract image from media:content', () => {
      const item = {
        title: 'Test',
        link: 'http://example.com',
        pubDate: '2024-01-01',
        mediaContent: {
          $: {
            url: 'http://example.com/image.jpg'
          }
        }
      }
      
      expect(extractImageUrl(item)).toBe('http://example.com/image.jpg')
    })

    it('should extract image from media:thumbnail', () => {
      const item = {
        title: 'Test',
        link: 'http://example.com',
        pubDate: '2024-01-01',
        mediaThumbnail: {
          $: {
            url: 'http://example.com/thumb.jpg'
          }
        }
      }
      
      expect(extractImageUrl(item)).toBe('http://example.com/thumb.jpg')
    })

    it('should extract image from HTML content', () => {
      const item = {
        title: 'Test',
        link: 'http://example.com',
        pubDate: '2024-01-01',
        content: '<p>Some text <img src="http://example.com/content.jpg" alt="test"> more text</p>'
      }
      
      expect(extractImageUrl(item)).toBe('http://example.com/content.jpg')
    })

    it('should return undefined if no image found', () => {
      const item = {
        title: 'Test',
        link: 'http://example.com',
        pubDate: '2024-01-01'
      }
      
      expect(extractImageUrl(item)).toBeUndefined()
    })
  })

  describe('cleanTextContent', () => {
    it('should remove HTML tags', () => {
      const html = '<p>This is <strong>bold</strong> text</p>'
      expect(cleanTextContent(html)).toBe('This is bold text')
    })

    it('should decode HTML entities', () => {
      const html = 'This &amp; that &lt;test&gt; &quot;quote&quot;'
      expect(cleanTextContent(html)).toBe('This & that <test> "quote"')
    })

    it('should truncate long text', () => {
      const longText = 'a'.repeat(400)
      const result = cleanTextContent(longText, 300)
      expect(result).toHaveLength(303) // 300 + '...'
      expect(result.endsWith('...')).toBe(true)
    })

    it('should not truncate short text', () => {
      const shortText = 'Short text'
      expect(cleanTextContent(shortText, 300)).toBe('Short text')
    })
  })

  describe('generateArticleId', () => {
    it('should use GUID if available', () => {
      const item = {
        title: 'Test',
        link: 'http://example.com',
        pubDate: '2024-01-01',
        guid: 'unique-guid-123'
      }
      
      expect(generateArticleId(item, 'vendor1')).toBe('unique-guid-123')
    })

    it('should use link if GUID not available', () => {
      const item = {
        title: 'Test',
        link: 'http://example.com/article',
        pubDate: '2024-01-01'
      }
      
      expect(generateArticleId(item, 'vendor1')).toBe('http://example.com/article')
    })

    it('should generate hash if neither GUID nor link available', () => {
      const item = {
        title: 'Test Article',
        pubDate: '2024-01-01T00:00:00Z'
      }
      
      const id = generateArticleId(item, 'vendor1')
      expect(id).toMatch(/^vendor1-/)
      expect(id.length).toBeGreaterThan(10)
    })
  })

  describe('parsePublicationDate', () => {
    it('should parse valid pubDate', () => {
      const item = {
        title: 'Test',
        link: 'http://example.com',
        pubDate: '2024-01-01T12:00:00Z'
      }
      
      expect(parsePublicationDate(item)).toBe('2024-01-01T12:00:00.000Z')
    })

    it('should parse dcDate if pubDate invalid', () => {
      const item = {
        title: 'Test',
        link: 'http://example.com',
        pubDate: 'invalid-date',
        dcDate: '2024-01-02T12:00:00Z'
      }
      
      expect(parsePublicationDate(item)).toBe('2024-01-02T12:00:00.000Z')
    })

    it('should return current date if all dates invalid', () => {
      const item = {
        title: 'Test',
        link: 'http://example.com',
        pubDate: 'invalid-date'
      }
      
      const result = parsePublicationDate(item)
      const now = new Date()
      const resultDate = new Date(result)
      
      // Should be within 1 second of current time
      expect(Math.abs(resultDate.getTime() - now.getTime())).toBeLessThan(1000)
    })
  })
})