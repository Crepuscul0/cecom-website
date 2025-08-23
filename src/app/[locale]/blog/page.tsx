import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { BlogHeader } from '@/components/blog/BlogHeader';
import { BlogCard } from '@/components/blog/BlogCard';
import { BlogSidebar } from '@/components/blog/BlogSidebar';
import { BlogPagination } from '@/components/blog/BlogPagination';

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

// Load mock data from local files for development
function loadMockData(locale: string) {
  try {
    const fs = require('fs')
    const path = require('path')
    
    const dataDir = path.join(process.cwd(), 'data', 'blog')
    const postsPath = path.join(dataDir, 'posts.json')
    
    if (fs.existsSync(postsPath)) {
      const posts = JSON.parse(fs.readFileSync(postsPath, 'utf8'))
      return posts
    }
  } catch (error) {
    console.log('Using fallback mock data')
  }
  
  // Fallback mock data
  return [
    {
      id: '1',
      title: locale === 'es' 
        ? 'Guía Completa de Ciberseguridad para Empresas Dominicanas'
        : 'Complete Cybersecurity Guide for Dominican Businesses',
      excerpt: locale === 'es'
        ? 'Descubre las mejores prácticas de ciberseguridad adaptadas al mercado dominicano y protege tu empresa de las amenazas digitales.'
        : 'Discover cybersecurity best practices adapted to the Dominican market and protect your business from digital threats.',
      slug: 'guia-ciberseguridad-empresas-dominicanas',
      category: locale === 'es' ? 'Ciberseguridad' : 'Cybersecurity',
      tags: ['seguridad', 'empresas', 'firewall', 'antivirus'],
      featuredImage: '/blog/cybersecurity-guide.jpg',
      publishedDate: '2024-08-20',
      readingTime: 8,
      author: 'Equipo CECOM'
    }
  ]
}

// This will be moved inside the component to use the correct locale
// const mockPosts = loadMockData('es')

export default async function BlogPage({ params, searchParams }: BlogPageProps) {
  const { locale } = await params;
  const { page = '1', category, tag, search } = await searchParams;
  const t = await getTranslations({ locale, namespace: 'Blog' });
  
  // Load posts with correct locale
  const mockPosts = loadMockData(locale);
  
  // TODO: Implementar lógica de filtrado y paginación real
  const currentPage = parseInt(page);
  const postsPerPage = 6;
  const totalPosts = mockPosts.length;
  const totalPages = Math.ceil(totalPosts / postsPerPage);
  
  const filteredPosts = mockPosts.filter((post: any) => {
    if (category && post.category !== category) return false;
    if (tag && !post.tags.includes(tag)) return false;
    if (search) {
      const searchLower = search.toLowerCase();
      const title = post.title.toLowerCase();
      const excerpt = post.excerpt.toLowerCase();
      return title.includes(searchLower) || excerpt.includes(searchLower);
    }
    return true;
  });

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
            {filteredPosts.length > 0 ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  {filteredPosts.map((post: any) => (
                    <BlogCard 
                      key={post.id} 
                      post={post} 
                      locale={locale as 'es' | 'en'} 
                    />
                  ))}
                </div>

                {/* Pagination */}
                <BlogPagination 
                  currentPage={currentPage}
                  totalPages={totalPages}
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
