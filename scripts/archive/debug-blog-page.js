import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function debugBlogPage() {
  console.log('🔍 DEBUG BLOG PAGE RENDERING');
  console.log('================================\n');

  try {
    // Test the exact query used by getBlogPosts
    console.log('1️⃣ Testing getBlogPosts query...');
    const { data: posts, error } = await supabase
      .from('blog_posts')
      .select(`
        *,
        blog_categories(name_es, name_en, slug)
      `)
      .eq('status', 'published')
      .limit(100)
      .order('published_date', { ascending: false });

    if (error) {
      console.error('❌ Error:', error);
      return;
    }

    console.log(`✅ Found ${posts.length} posts`);

    // Transform posts like getBlogPosts does
    const transformedPosts = posts?.map(post => ({
      id: post.id,
      title: post.title,
      excerpt: post.excerpt || '',
      content: post.content,
      slug: post.slug,
      category: post.blog_categories?.slug || '',
      tags: [],
      featuredImage: post.featured_image,
      publishedDate: post.published_date,
      readingTime: 5,
      author: post.author,
      status: post.status,
      seo: post.meta_title || post.meta_description ? {
        metaTitle: post.meta_title || post.title,
        metaDescription: post.meta_description || post.excerpt || '',
        keywords: ''
      } : undefined
    })) || [];

    console.log(`✅ Transformed ${transformedPosts.length} posts`);

    // Test filtering (no filters applied)
    const filteredPosts = transformedPosts.filter(post => post.status === 'published');
    console.log(`✅ After status filter: ${filteredPosts.length} posts`);

    // Test pagination (page 1, 6 posts per page)
    const postsPerPage = 6;
    const currentPage = 1;
    const startIndex = (currentPage - 1) * postsPerPage;
    const endIndex = startIndex + postsPerPage;
    const paginatedPosts = filteredPosts.slice(startIndex, endIndex);

    console.log(`✅ Paginated posts (page ${currentPage}): ${paginatedPosts.length} posts`);

    // Check if posts have all required fields
    console.log('\n2️⃣ Checking post structure...');
    if (paginatedPosts.length > 0) {
      const firstPost = paginatedPosts[0];
      console.log('First post structure:');
      console.log('- id:', firstPost.id ? '✅' : '❌');
      console.log('- title:', firstPost.title ? '✅' : '❌');
      console.log('- slug:', firstPost.slug ? '✅' : '❌');
      console.log('- category:', firstPost.category ? '✅' : '❌');
      console.log('- publishedDate:', firstPost.publishedDate ? '✅' : '❌');
      console.log('- author:', firstPost.author ? '✅' : '❌');
      console.log('- excerpt:', firstPost.excerpt ? '✅' : '❌');
      console.log('- content:', firstPost.content ? '✅' : '❌');
      
      console.log('\nFirst post details:');
      console.log(`- Title: ${firstPost.title}`);
      console.log(`- Slug: ${firstPost.slug}`);
      console.log(`- Category: ${firstPost.category}`);
      console.log(`- Published: ${firstPost.publishedDate}`);
      console.log(`- Author: ${firstPost.author}`);
    }

    // Test if the condition for rendering posts would pass
    console.log('\n3️⃣ Testing render condition...');
    const shouldRenderPosts = paginatedPosts.length > 0;
    console.log(`paginationResult.posts.length > 0: ${shouldRenderPosts}`);

    if (shouldRenderPosts) {
      console.log('✅ Posts should render in the grid');
      console.log(`📋 Posts to render: ${paginatedPosts.length}`);
      paginatedPosts.forEach((post, index) => {
        console.log(`   ${index + 1}. ${post.title}`);
      });
    } else {
      console.log('❌ No posts message should show');
    }

    // Check for any potential issues
    console.log('\n4️⃣ Potential issues check...');
    
    // Check for missing required fields that could cause rendering issues
    const postsWithMissingFields = paginatedPosts.filter(post => 
      !post.id || !post.title || !post.slug || !post.publishedDate
    );
    
    if (postsWithMissingFields.length > 0) {
      console.log(`❌ Found ${postsWithMissingFields.length} posts with missing required fields`);
      postsWithMissingFields.forEach(post => {
        console.log(`   - Post: ${post.title || 'No title'}`);
        console.log(`     Missing: ${!post.id ? 'id ' : ''}${!post.title ? 'title ' : ''}${!post.slug ? 'slug ' : ''}${!post.publishedDate ? 'publishedDate ' : ''}`);
      });
    } else {
      console.log('✅ All posts have required fields');
    }

    // Check for invalid dates
    const postsWithInvalidDates = paginatedPosts.filter(post => {
      const date = new Date(post.publishedDate);
      return isNaN(date.getTime());
    });

    if (postsWithInvalidDates.length > 0) {
      console.log(`❌ Found ${postsWithInvalidDates.length} posts with invalid dates`);
    } else {
      console.log('✅ All posts have valid dates');
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

debugBlogPage();
