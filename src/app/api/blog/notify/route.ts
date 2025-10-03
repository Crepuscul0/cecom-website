import { NextRequest, NextResponse } from 'next/server';
import { sendBlogNotification } from '@/lib/email';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const { blogPostId, title, excerpt, slug, featuredImage } = await request.json();

    let blogPost;

    // If blog post data is provided directly, use it (for new posts)
    if (title && excerpt && slug) {
      blogPost = {
        title,
        excerpt,
        slug,
        featured_image: featuredImage,
        status: 'published'
      };
    } else if (blogPostId) {
      // Otherwise, fetch from database (for existing posts)
      const { data, error } = await supabase
        .from('blog_posts')
        .select('title, excerpt, slug, featured_image, status')
        .eq('id', blogPostId)
        .single();

      if (error || !data) {
        return NextResponse.json({ error: 'Blog post not found' }, { status: 404 });
      }

      blogPost = data;
    } else {
      return NextResponse.json({ error: 'Blog post ID or data is required' }, { status: 400 });
    }

    // Only send notifications for published posts
    if (blogPost.status !== 'published') {
      return NextResponse.json({ error: 'Blog post is not published' }, { status: 400 });
    }

    // Send notification to all subscribers
    const result = await sendBlogNotification({
      title: blogPost.title,
      excerpt: blogPost.excerpt || '',
      slug: blogPost.slug,
      featuredImage: blogPost.featured_image,
    });

    return NextResponse.json({
      success: true,
      message: `Newsletter sent to ${result.sent} subscribers`,
      sent: result.sent,
      errors: result.errors,
    });
  } catch (error) {
    console.error('Blog notification error:', error);
    return NextResponse.json(
      { error: 'Failed to send blog notification' },
      { status: 500 }
    );
  }
}