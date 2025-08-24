import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { BlogHeader } from '@/components/blog/BlogHeader';
import { BlogCard } from '@/components/blog/BlogCard';
import { BlogSidebar } from '@/components/blog/BlogSidebar';
import { BlogPagination } from '@/components/blog/BlogPagination';
import Link from 'next/link';
import { ArrowLeft, Tag } from 'lucide-react';
import { BlogPost } from '@/types/blog';
import { normalizeBlogPost, filterBlogPosts, sortBlogPosts, paginateBlogPosts } from '@/utils/blog';
import fs from 'fs';
import path from 'path';

interface TagPageProps {
  params: Promise<{ locale: string; tag: string }>;
  searchParams: Promise<{ page?: string }>;
}

export async function generateMetadata({ params }: TagPageProps): Promise<Metadata> {
  const { locale, tag } = await params;
  const t = await getTranslations({ locale, namespace: 'Blog' });
  
  const tagName = decodeURIComponent(tag);
  
  return {
    title: `${tagName} | ${t('title')} | CECOM`,
    description: `${t('tagDescription')} ${tagName}. ${t('tagSubDescription')}`,
    keywords: `${tagName.toLowerCase()}, blog tecnología, CECOM, República Dominicana`,
    openGraph: {
      title: `${tagName} | CECOM Blog`,
      description: `${t('tagDescription')} ${tagName}`,
      type: 'website',
      locale: locale,
    },
    alternates: {
      canonical: `/${locale}/blog/tag/${tag}`,
      languages: {
        'es': `/es/blog/tag/${tag}`,
        'en': `/en/blog/tag/${tag}`,
      }
    }
  };
}

// Load RSS data from local files and filter by tag
function loadBlogPosts(): BlogPost[] {
  try {
    
    const dataDir = path.join(process.cwd(), 'data', 'blog')
    const postsPath = path.join(dataDir, 'posts.json')
    
    if (fs.existsSync(postsPath)) {
      const rawPosts = JSON.parse(fs.readFileSync(postsPath, 'utf8'))
      return rawPosts.map((post: any) => normalizeBlogPost(post))
    }
  } catch (error) {
    console.error('Error loading blog posts:', error)
  }
  
  return []
}

async function getPostsByTag(tagSlug: string): Promise<BlogPost[]> {
  const allPosts = loadBlogPosts();
  const sortedPosts = sortBlogPosts(allPosts);
  
  // Load tags to map slug to ID
  try {
    const tagsPath = path.join(process.cwd(), 'data', 'blog', 'tags.json');
    if (fs.existsSync(tagsPath)) {
      const tags = JSON.parse(fs.readFileSync(tagsPath, 'utf8'));
      const tag = tags.find((t: any) => t.slug === tagSlug);
      
      if (tag) {
        // Filter posts by tag ID
        return filterBlogPosts(sortedPosts, {
          tag: tag.id,
          status: 'published'
        });
      }
    }
  } catch (error) {
    console.error('Error loading tags:', error);
  }
  
  return [];
}

export default async function TagPage({ params, searchParams }: TagPageProps) {
  const { locale, tag } = await params;
  const { page = '1' } = await searchParams;
  const t = await getTranslations({ locale, namespace: 'Blog' });
  
  const posts = await getPostsByTag(tag);
  
  if (posts.length === 0) {
    notFound();
  }

  // Apply pagination
  const currentPage = parseInt(page);
  const paginationResult = paginateBlogPosts(posts, currentPage, 6);

  const tagName = decodeURIComponent(tag);

  return (
    <div className="min-h-screen bg-background">
      <BlogHeader />
      
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3">
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

            {/* Tag Header */}
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-secondary/20 rounded-lg">
                  <Tag className="w-6 h-6 text-secondary-foreground" />
                </div>
                <h1 className="text-4xl font-bold text-foreground">
                  #{tagName}
                </h1>
              </div>
              
              <p className="text-lg text-muted-foreground mb-4">
                {t('tagPageDescription')} <span className="font-semibold">#{tagName}</span>
              </p>
              
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span>{posts.length} {t('articles')}</span>
              </div>
            </div>

            {/* Posts Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {paginationResult.posts.map((post: BlogPost) => (
                <BlogCard 
                  key={post.id} 
                  post={post} 
                  locale={locale as 'es' | 'en'} 
                />
              ))}
            </div>

            {/* Pagination */}
            {paginationResult.totalPages > 1 && (
              <BlogPagination 
                currentPage={paginationResult.currentPage}
                totalPages={paginationResult.totalPages}
                locale={locale}
                basePath={`/${locale}/blog/tag/${tag}`}
              />
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <BlogSidebar locale={locale} activeTag={tag} />
          </div>
        </div>
      </div>
    </div>
  );
}
