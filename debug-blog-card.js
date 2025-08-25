import React from 'react';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// Mock the BlogCard component logic
function mockBlogCard(post, locale) {
  try {
    // Test date parsing
    const parsedDate = new Date(post.publishedDate);
    const isValidDate = !isNaN(parsedDate.getTime());
    
    // Test date formatting
    let formattedDate = '';
    if (isValidDate) {
      formattedDate = parsedDate.toLocaleDateString(
        locale === 'es' ? 'es-DO' : 'en-US',
        { 
          year: 'numeric', 
          month: 'short', 
          day: 'numeric' 
        }
      );
    }

    // Check required fields
    const hasRequiredFields = !!(
      post.id &&
      post.title &&
      post.slug &&
      post.publishedDate &&
      post.excerpt
    );

    return {
      canRender: hasRequiredFields && isValidDate,
      issues: {
        missingId: !post.id,
        missingTitle: !post.title,
        missingSlug: !post.slug,
        missingPublishedDate: !post.publishedDate,
        missingExcerpt: !post.excerpt,
        invalidDate: !isValidDate,
        formattedDate: formattedDate
      }
    };
  } catch (error) {
    return {
      canRender: false,
      error: error.message
    };
  }
}

async function debugBlogCard() {
  console.log('🔍 DEBUG BLOG CARD RENDERING');
  console.log('==============================\n');

  try {
    // Get the same posts that would be used in the blog page
    const { data: posts, error } = await supabase
      .from('blog_posts')
      .select(`
        *,
        blog_categories(name_es, name_en, slug)
      `)
      .eq('status', 'published')
      .limit(6)
      .order('published_date', { ascending: false });

    if (error) {
      console.error('❌ Error fetching posts:', error);
      return;
    }

    console.log(`✅ Found ${posts.length} posts to test`);

    // Transform posts like getBlogPosts does
    const transformedPosts = posts?.map(post => ({
      id: post.id,
      title: post.title,
      excerpt: post.excerpt || '',
      content: post.content,
      slug: post.slug,
      category: post.blog_categories?.slug || '',
      tags: [], // Empty tags array like in getBlogPosts
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

    console.log('\n1️⃣ Testing BlogCard rendering for each post...');
    
    let renderableCount = 0;
    let issueCount = 0;

    transformedPosts.forEach((post, index) => {
      console.log(`\n📋 Post ${index + 1}: ${post.title.substring(0, 50)}...`);
      
      const cardTest = mockBlogCard(post, 'es');
      
      if (cardTest.canRender) {
        console.log('   ✅ Can render');
        renderableCount++;
      } else {
        console.log('   ❌ Cannot render');
        issueCount++;
        
        if (cardTest.error) {
          console.log(`   Error: ${cardTest.error}`);
        } else {
          const issues = cardTest.issues;
          console.log('   Issues:');
          if (issues.missingId) console.log('     - Missing ID');
          if (issues.missingTitle) console.log('     - Missing title');
          if (issues.missingSlug) console.log('     - Missing slug');
          if (issues.missingPublishedDate) console.log('     - Missing published date');
          if (issues.missingExcerpt) console.log('     - Missing excerpt');
          if (issues.invalidDate) console.log('     - Invalid date format');
          if (issues.formattedDate) console.log(`     - Formatted date: ${issues.formattedDate}`);
        }
      }

      // Show post structure
      console.log('   Post structure:');
      console.log(`     - ID: ${post.id ? '✅' : '❌'} (${post.id})`);
      console.log(`     - Title: ${post.title ? '✅' : '❌'} (${post.title?.length || 0} chars)`);
      console.log(`     - Slug: ${post.slug ? '✅' : '❌'} (${post.slug})`);
      console.log(`     - Excerpt: ${post.excerpt ? '✅' : '❌'} (${post.excerpt?.length || 0} chars)`);
      console.log(`     - Published: ${post.publishedDate ? '✅' : '❌'} (${post.publishedDate})`);
      console.log(`     - Category: ${post.category ? '✅' : '❌'} (${post.category})`);
      console.log(`     - Tags: ${Array.isArray(post.tags) ? '✅' : '❌'} (${post.tags?.length || 0} tags)`);
      console.log(`     - Author: ${post.author ? '✅' : '❌'} (${post.author})`);
    });

    console.log('\n2️⃣ Summary:');
    console.log(`✅ Renderable posts: ${renderableCount}`);
    console.log(`❌ Posts with issues: ${issueCount}`);

    if (renderableCount === 0) {
      console.log('\n🚨 CRITICAL: No posts can be rendered by BlogCard!');
      console.log('This explains why the blog grid is empty.');
    } else if (issueCount > 0) {
      console.log('\n⚠️  Some posts have rendering issues.');
    } else {
      console.log('\n✅ All posts should render correctly.');
      console.log('The issue might be elsewhere in the rendering pipeline.');
    }

    // Test tags rendering specifically
    console.log('\n3️⃣ Testing tags rendering...');
    transformedPosts.forEach((post, index) => {
      console.log(`Post ${index + 1} tags:`, post.tags);
      if (!Array.isArray(post.tags)) {
        console.log(`   ❌ Tags is not an array: ${typeof post.tags}`);
      } else if (post.tags.length === 0) {
        console.log(`   ⚠️  Empty tags array (this is expected from getBlogPosts)`);
      } else {
        console.log(`   ✅ Has ${post.tags.length} tags`);
      }
    });

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

debugBlogCard();
