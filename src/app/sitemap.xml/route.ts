import { MetadataRoute } from 'next'
import { 
  getAllPublishedBlogSlugs, 
  getAllProductIds, 
  getAllBlogCategorySlugs, 
  getAllBlogTagSlugs,
  getBlogPosts
} from '@/lib/supabase-blog'

export async function GET(): Promise<Response> {
  const baseUrl = process.env.NEXT_PUBLIC_SERVER_URL || 'https://cecom.do'
  
  // Static pages
  const staticPages = [
    '',
    '/about',
    '/contact',
    '/products',
    '/blog',
  ]
  
  // Generate URLs for both locales
  const locales = ['en', 'es']
  const staticUrls = staticPages.flatMap(page => 
    locales.map(locale => ({
      url: `${baseUrl}/${locale}${page}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: page === '' ? 1 : page === '/blog' ? 0.9 : 0.8,
    }))
  )

  try {
    // Dynamic blog posts
    const blogPosts = await getBlogPosts({ status: 'published' })
    const blogUrls = blogPosts.flatMap(post => 
      locales.map(locale => ({
        url: `${baseUrl}/${locale}/blog/${post.slug}`,
        lastModified: new Date(post.publishedDate),
        changeFrequency: 'monthly' as const,
        priority: 0.7,
      }))
    )

    // Blog categories
    const categorySlugs = await getAllBlogCategorySlugs()
    const categoryUrls = categorySlugs.flatMap(slug => 
      locales.map(locale => ({
        url: `${baseUrl}/${locale}/blog/category/${slug}`,
        lastModified: new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.6,
      }))
    )

    // Blog tags
    const tagSlugs = await getAllBlogTagSlugs()
    const tagUrls = tagSlugs.flatMap(slug => 
      locales.map(locale => ({
        url: `${baseUrl}/${locale}/blog/tag/${slug}`,
        lastModified: new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.5,
      }))
    )

    // Products
    const productIds = await getAllProductIds()
    const productUrls = productIds.flatMap(id => 
      locales.map(locale => ({
        url: `${baseUrl}/${locale}/products/${id}`,
        lastModified: new Date(),
        changeFrequency: 'monthly' as const,
        priority: 0.8,
      }))
    )

    const sitemap: MetadataRoute.Sitemap = [
      ...staticUrls,
      ...blogUrls,
      ...categoryUrls,
      ...tagUrls,
      ...productUrls,
    ]

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
${sitemap.map(entry => `  <url>
    <loc>${entry.url}</loc>
    <lastmod>${entry.lastModified instanceof Date ? entry.lastModified.toISOString() : entry.lastModified ? new Date(entry.lastModified).toISOString() : new Date().toISOString()}</lastmod>
    <changefreq>${entry.changeFrequency}</changefreq>
    <priority>${entry.priority}</priority>
  </url>`).join('\n')}
</urlset>`

    return new Response(xml, {
      headers: {
        'Content-Type': 'application/xml',
      },
    })
  } catch (error) {
    console.error('Error generating sitemap:', error)
    
    // Fallback to static sitemap if dynamic content fails
    const fallbackSitemap: MetadataRoute.Sitemap = [...staticUrls]
    
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
${fallbackSitemap.map(entry => `  <url>
    <loc>${entry.url}</loc>
    <lastmod>${entry.lastModified instanceof Date ? entry.lastModified.toISOString() : entry.lastModified ? new Date(entry.lastModified).toISOString() : new Date().toISOString()}</lastmod>
    <changefreq>${entry.changeFrequency}</changefreq>
    <priority>${entry.priority}</priority>
  </url>`).join('\n')}
</urlset>`

    return new Response(xml, {
      headers: {
        'Content-Type': 'application/xml',
      },
    })
  }
}
