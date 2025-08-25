const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Supabase configuration
const supabaseUrl = 'https://kfhrhdhtngtmnescqcnv.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtmaHJoZGh0bmd0bW5lc2NxY252Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTA5NzIxOCwiZXhwIjoyMDcwNjczMjE4fQ.Ej6qJGHk5b3Z18mHjhIge-2wA2UOMPW67i4dLxIFp6dY';

const supabase = createClient(supabaseUrl, supabaseKey);

async function importBlogPosts() {
  try {
    // Read JSON data
    const postsPath = path.join(__dirname, '..', 'data', 'blog', 'posts.json');
    const categoriesPath = path.join(__dirname, '..', 'data', 'blog', 'categories.json');
    
    const posts = JSON.parse(fs.readFileSync(postsPath, 'utf8'));
    const categories = JSON.parse(fs.readFileSync(categoriesPath, 'utf8'));
    
    console.log(`Found ${posts.length} posts to import`);
    
    // Get category mapping
    const { data: dbCategories } = await supabase
      .from('blog_categories')
      .select('id, slug');
    
    const categoryMap = {};
    dbCategories.forEach(cat => {
      categoryMap[cat.slug] = cat.id;
    });
    
    // Map JSON category IDs to slugs
    const jsonCategoryMap = {};
    categories.forEach(cat => {
      jsonCategoryMap[cat.id] = cat.slug;
    });
    
    // Prepare posts for insertion
    const postsToInsert = posts.map(post => {
      const categorySlug = jsonCategoryMap[post.category] || 'cybersecurity';
      const categoryId = categoryMap[categorySlug] || categoryMap['cybersecurity'];
      
      return {
        title: post.title,
        content: post.content,
        excerpt: post.excerpt,
        slug: post.slug,
        category_id: categoryId,
        featured_image: '/blog/cybersecurity-placeholder.jpg',
        published_date: new Date(post.publishedDate).toISOString(),
        status: post.status,
        author: post.author,
        meta_title: post.seo?.metaTitle || post.title,
        meta_description: post.seo?.metaDescription || post.excerpt,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
    });
    
    console.log('Inserting posts...');
    
    // Insert posts in batches
    const batchSize = 10;
    for (let i = 0; i < postsToInsert.length; i += batchSize) {
      const batch = postsToInsert.slice(i, i + batchSize);
      
      const { data, error } = await supabase
        .from('blog_posts')
        .insert(batch);
      
      if (error) {
        console.error(`Error inserting batch ${i / batchSize + 1}:`, error);
      } else {
        console.log(`Inserted batch ${i / batchSize + 1} (${batch.length} posts)`);
      }
    }
    
    console.log('Import completed successfully!');
    
  } catch (error) {
    console.error('Error importing posts:', error);
  }
}

importBlogPosts();
