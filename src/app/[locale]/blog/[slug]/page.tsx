import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { BlogHeader } from '@/components/blog/BlogHeader';
import { BlogSidebar } from '@/components/blog/BlogSidebar';
import { Calendar, Clock, Tag, User, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { BlogPost } from '@/types/blog';
import { normalizeBlogPost, parseDate, formatDate } from '@/utils/blog';
import fs from 'fs';
import path from 'path';

interface BlogPostPageProps {
  params: Promise<{ locale: string; slug: string }>;
}

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const { locale, slug } = await params;
  
  // TODO: Fetch real post data from PayloadCMS
  const post = await getPostBySlug(slug, locale);
  
  if (!post) {
    return {
      title: 'Artículo no encontrado | CECOM',
    };
  }

  return {
    title: `${post.title} | CECOM Blog`,
    description: post.excerpt,
    keywords: post.tags.join(', '),
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: 'article',
      locale: locale,
      images: post.featuredImage ? [post.featuredImage] : ['/blog/default.jpg'],
      publishedTime: post.publishedDate,
      authors: ['CECOM Team'],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.excerpt,
      images: post.featuredImage ? [post.featuredImage] : [],
    },
    alternates: {
      canonical: `/${locale}/blog/${slug}`,
      languages: {
        'es': `/es/blog/${slug}`,
        'en': `/en/blog/${slug}`,
      }
    }
  };
}

// Load RSS data from local files
function loadBlogPosts(): BlogPost[] {
  try {
    const dataDir = path.join(process.cwd(), 'data', 'blog');
    const postsPath = path.join(dataDir, 'posts.json');
    
    if (fs.existsSync(postsPath)) {
      const rawPosts = JSON.parse(fs.readFileSync(postsPath, 'utf8'));
      return rawPosts.map((post: any) => normalizeBlogPost(post));
    }
  } catch (error) {
    console.error('Error loading posts:', error);
  }
  
  return [];
}

async function getPostBySlug(slug: string, locale: string): Promise<BlogPost | null> {
  try {
    const allPosts = loadBlogPosts();
    const post = allPosts.find(p => p.slug === slug);
    return post || null;
  } catch (error) {
    console.error('Error loading post:', error);
    return null;
  }
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { locale, slug } = await params;
  const t = await getTranslations({ locale, namespace: 'Blog' });
  
  const post = await getPostBySlug(slug, locale);
  
  if (!post) {
    notFound();
  }

  const parsedDate = parseDate(post.publishedDate);
  const formattedDate = formatDate(parsedDate, locale);

  return (
    <div className="min-h-screen bg-background">
      <BlogHeader />
      
      <article className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Back Navigation */}
        <div className="mb-6">
          <Link 
            href={`/${locale}/blog`}
            className="inline-flex items-center text-primary hover:text-primary/80 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t('backToBlog')}
          </Link>
        </div>

        {/* Article Header */}
        <header className="mb-8">
          {/* Category Badge */}
          <div className="mb-4">
            <Link
              href={`/${locale}/blog/category/${post.category.toLowerCase()}`}
              className="inline-block px-3 py-1 bg-primary text-primary-foreground rounded-full text-sm font-medium hover:bg-primary/90 transition-colors"
            >
              {post.category}
            </Link>
          </div>

          {/* Title */}
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6 leading-tight">
            {post.title}
          </h1>

          {/* Excerpt */}
          <p className="text-xl text-muted-foreground mb-6 leading-relaxed">
            {post.excerpt}
          </p>

          {/* Meta Information */}
          <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground border-b border-border pb-6">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4" />
              <span>{post.author}</span>
            </div>
            
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <time dateTime={post.publishedDate}>{formattedDate}</time>
            </div>
            
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span>{post.readingTime} min</span>
            </div>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-2 mt-4">
            {post.tags.map((tag: string) => (
              <Link
                key={tag}
                href={`/${locale}/blog/tag/${tag}`}
                className="inline-flex items-center gap-1 px-2 py-1 bg-accent text-accent-foreground rounded text-xs hover:bg-accent/80 transition-colors"
              >
                <Tag className="w-3 h-3" />
                {tag}
              </Link>
            ))}
          </div>
        </header>

        {/* Featured Image */}
        {post.featuredImage && (
          <div className="mb-8">
            <img
              src={post.featuredImage}
              alt={post.title}
              className="w-full h-64 md:h-96 object-cover rounded-lg shadow-lg"
            />
          </div>
        )}

        {/* Article Content */}
        <div className="prose prose-lg max-w-none dark:prose-invert">
          <div dangerouslySetInnerHTML={{ __html: post.content }} />
        </div>

        {/* Article Footer */}
        <footer className="mt-12 pt-8 border-t border-border">
          <div className="bg-accent rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-2">
              {t('needHelp')}
            </h3>
            <p className="text-muted-foreground mb-4">
              {t('needHelpDescription')}
            </p>
            <Link
              href={`/${locale}/contact`}
              className="inline-flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
            >
              {t('contactUs')}
            </Link>
          </div>
        </footer>
      </article>

      {/* Related Posts - TODO: Implement related posts component */}
      <section className="container mx-auto px-4 py-8 max-w-4xl">
        <h2 className="text-2xl font-bold mb-6">{t('relatedPosts')}</h2>
        <p className="text-muted-foreground">{t('relatedPostsComingSoon')}</p>
      </section>
    </div>
  );
}
