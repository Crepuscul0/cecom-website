export async function GET(): Promise<Response> {
  const baseUrl = process.env.NEXT_PUBLIC_SERVER_URL || 'https://cecom.do'
  
  const robotsTxt = `User-agent: *
Allow: /

# Sitemap
Sitemap: ${baseUrl}/sitemap.xml

# Block admin areas
Disallow: /admin/
Disallow: /admin-panel/
Disallow: /api/

# Block development files
Disallow: /_next/
Disallow: /static/

# Allow important pages
Allow: /en/
Allow: /es/
Allow: /en/blog/
Allow: /es/blog/
Allow: /en/products/
Allow: /es/products/

# Crawl delay (optional)
Crawl-delay: 1`

  return new Response(robotsTxt, {
    headers: {
      'Content-Type': 'text/plain',
    },
  })
}
