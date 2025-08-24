import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { BlogHeader } from '@/components/blog/BlogHeader';
import { BlogCard } from '@/components/blog/BlogCard';
import { BlogSidebar } from '@/components/blog/BlogSidebar';
import { BlogPagination } from '@/components/blog/BlogPagination';
import { BlogPost } from '@/types/blog';
import { getBlogPosts } from '@/lib/supabase-blog';
import { filterBlogPosts, paginateBlogPosts } from '@/utils/blog';

interface BlogPageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ page?: string; category?: string; tag?: string; search?: string }>;
}

export async function generateMetadata({ params }: BlogPageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Blog' });
  
  return {
    title: `${t('title')} | CECOM - Soluciones Tecnológicas`,
    description: t('description'),
    keywords: 'blog tecnología, soluciones IT República Dominicana, ciberseguridad, redes empresariales',
    openGraph: {
      title: `${t('title')} | CECOM`,
      description: t('description'),
      type: 'website',
      locale: locale,
    },
    alternates: {
      canonical: `/${locale}/blog`,
      languages: {
        'es': '/es/blog',
        'en': '/en/blog',
      }
    }
  };
}

export default async function BlogPage({ params, searchParams }: BlogPageProps) {
  const { locale } = await params;
  const { page = '1', category, tag, search } = await searchParams;
  const t = await getTranslations({ locale, namespace: 'Blog' });
  
  // Load blog posts from Supabase
  const allPosts = await getBlogPosts({ 
    status: 'published',
    category: category,
    limit: 100 // Get all posts for filtering
  });
  
  // Apply filters (posts are already sorted by date from Supabase)
  const filteredPosts = filterBlogPosts(allPosts, {
    category,
    tag,
    search,
    status: 'published'
  });
  
  // Apply pagination
  const currentPage = parseInt(page);
  const paginationResult = paginateBlogPosts(filteredPosts, currentPage, 6);

  return (
    <div className="min-h-screen bg-background">
      <BlogHeader />
      
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="mb-8">
              <h1 className="text-4xl font-bold text-foreground mb-4">
                {t('title')}
              </h1>
              <p className="text-lg text-muted-foreground">
                {t('subtitle')}
              </p>
            </div>

            {/* Active Filters */}
            {(category || tag || search) && (
              <div className="mb-6 p-4 bg-accent rounded-lg">
                <h3 className="font-semibold mb-2">{t('activeFilters')}</h3>
                <div className="flex flex-wrap gap-2">
                  {category && (
                    <span className="px-3 py-1 bg-primary text-primary-foreground rounded-full text-sm">
                      {t('category')}: {category}
                    </span>
                  )}
                  {tag && (
                    <span className="px-3 py-1 bg-secondary text-secondary-foreground rounded-full text-sm">
                      {t('tag')}: {tag}
                    </span>
                  )}
                  {search && (
                    <span className="px-3 py-1 bg-accent text-accent-foreground rounded-full text-sm">
                      {t('search')}: "{search}"
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Posts Grid */}
            {paginationResult.posts.length > 0 ? (
              <>
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
                <BlogPagination 
                  currentPage={paginationResult.currentPage}
                  totalPages={paginationResult.totalPages}
                  locale={locale}
                />
              </>
            ) : (
              <div className="text-center py-12">
                <h3 className="text-xl font-semibold text-muted-foreground mb-2">
                  {t('noPosts')}
                </h3>
                <p className="text-muted-foreground">
                  {t('noPostsDescription')}
                </p>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <BlogSidebar locale={locale} />
          </div>
        </div>
      </div>
    </div>
  );
}
