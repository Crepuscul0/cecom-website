#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

async function generateSQLInserts() {
  try {
    // Read JSON data
    const postsPath = path.join(__dirname, '..', 'data', 'blog', 'posts.json');
    const posts = JSON.parse(fs.readFileSync(postsPath, 'utf8'));
    
    console.log(`📝 Generando SQL para ${posts.length} posts...`);
    
    // Category mapping
    const categoryMap = {
      'cat-cybersecurity': 'f3c265c9-390a-4572-994a-db7d2ca5948b',
      'cat-networking': 'adaf9619-2df4-40c1-8c06-b4a189f7d3fd',
      'cat-technology': '07e91ca1-9780-4154-a71e-0af7c2cfc9ac'
    };

    let sqlStatements = [];
    
    posts.forEach((post, index) => {
      const categoryId = categoryMap['cat-cybersecurity']; // Most RSS posts are cybersecurity
      const publishedDate = new Date(post.publishedDate).toISOString();
      
      // Escape single quotes in content
      const escapedTitle = post.title.replace(/'/g, "''");
      const escapedContent = post.content.replace(/'/g, "''");
      const escapedExcerpt = post.excerpt.replace(/'/g, "''");
      const escapedSlug = post.slug;
      const escapedAuthor = (post.author || 'CECOM Team').replace(/'/g, "''");
      const escapedMetaTitle = (post.seo?.metaTitle || post.title).replace(/'/g, "''");
      const escapedMetaDesc = (post.seo?.metaDescription || post.excerpt).replace(/'/g, "''");
      
      const sql = `INSERT INTO blog_posts (
  title, content, excerpt, slug, category_id, featured_image, 
  published_date, status, author, meta_title, meta_description, 
  created_at, updated_at
) 
SELECT 
  '${escapedTitle}',
  '${escapedContent}',
  '${escapedExcerpt}',
  '${escapedSlug}',
  '${categoryId}',
  '/blog/cybersecurity-placeholder.jpg',
  '${publishedDate}',
  'published',
  '${escapedAuthor}',
  '${escapedMetaTitle}',
  '${escapedMetaDesc}',
  NOW(),
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM blog_posts WHERE slug = '${escapedSlug}'
);`;

      sqlStatements.push(sql);
    });
    
    // Write to file
    const outputPath = path.join(__dirname, 'rss-import.sql');
    fs.writeFileSync(outputPath, sqlStatements.join('\n\n'));
    
    console.log(`✅ SQL generado en: ${outputPath}`);
    console.log(`📊 ${sqlStatements.length} statements creados`);
    
    // Also output first few for preview
    console.log('\n📋 Preview de los primeros 3 posts:');
    posts.slice(0, 3).forEach((post, index) => {
      console.log(`${index + 1}. ${post.title}`);
      console.log(`   Slug: ${post.slug}`);
      console.log(`   Fecha: ${post.publishedDate}`);
      console.log('');
    });
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

generateSQLInserts();
