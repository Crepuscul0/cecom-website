import { getBlogPosts } from '@/lib/supabase-blog';

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_SERVER_URL || 'https://cecom.do';
  
  try {
    // Get published blog posts
    const posts = await getBlogPosts({ 
      status: 'published', 
      limit: 50 
    });

    const rssItems = posts.map(post => `
    <item>
      <title><![CDATA[${post.title}]]></title>
      <description><![CDATA[${post.excerpt}]]></description>
      <link>${baseUrl}/es/blog/${post.slug}</link>
      <guid isPermaLink="true">${baseUrl}/es/blog/${post.slug}</guid>
      <pubDate>${new Date(post.publishedDate).toUTCString()}</pubDate>
      <author>info@cecom.do (${post.author})</author>
      <category><![CDATA[${post.category}]]></category>
    </item>`).join('');

    const rssXml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>CECOM - Blog Tecnológico</title>
    <description>Últimas noticias y artículos sobre tecnología empresarial, ciberseguridad y soluciones IT en República Dominicana</description>
    <link>${baseUrl}/es/blog</link>
    <language>es-DO</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${baseUrl}/feed.xml" rel="self" type="application/rss+xml"/>
    <managingEditor>info@cecom.do (Equipo CECOM)</managingEditor>
    <webMaster>info@cecom.do (Equipo CECOM)</webMaster>
    <category>Technology</category>
    <category>Cybersecurity</category>
    <category>IT Solutions</category>
    <ttl>60</ttl>
    ${rssItems}
  </channel>
</rss>`;

    return new Response(rssXml, {
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=3600, s-maxage=3600',
      },
    });
  } catch (error) {
    console.error('Error generating RSS feed:', error);
    
    // Fallback RSS with basic info
    const fallbackRss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>CECOM - Blog Tecnológico</title>
    <description>Últimas noticias y artículos sobre tecnología empresarial</description>
    <link>${baseUrl}/es/blog</link>
    <language>es-DO</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
  </channel>
</rss>`;

    return new Response(fallbackRss, {
      headers: {
        'Content-Type': 'application/xml',
      },
    });
  }
}
