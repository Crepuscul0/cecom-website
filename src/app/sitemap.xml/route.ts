import { MetadataRoute } from 'next'

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

  // TODO: Add dynamic blog posts, categories, and tags when PayloadCMS is connected
  // const blogPosts = await getBlogPosts()
  // const blogUrls = blogPosts.flatMap(post => 
  //   locales.map(locale => ({
  //     url: `${baseUrl}/${locale}/blog/${post.slug}`,
  //     lastModified: new Date(post.updatedAt),
  //     changeFrequency: 'monthly' as const,
  //     priority: 0.7,
  //   }))
  // )

  const sitemap: MetadataRoute.Sitemap = [
    ...staticUrls,
    // ...blogUrls,
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
}
