import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { BlogHeader } from '@/components/blog/BlogHeader';
import { BlogCard } from '@/components/blog/BlogCard';
import { BlogSidebar } from '@/components/blog/BlogSidebar';
import { BlogPagination } from '@/components/blog/BlogPagination';
import Link from 'next/link';
import { ArrowLeft, Folder } from 'lucide-react';

interface CategoryPageProps {
  params: Promise<{ locale: string; category: string }>;
  searchParams: Promise<{ page?: string }>;
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { locale, category } = await params;
  const t = await getTranslations({ locale, namespace: 'Blog' });
  
  const categoryName = decodeURIComponent(category);
  
  return {
    title: `${categoryName} | ${t('title')} | CECOM`,
    description: `${t('categoryDescription')} ${categoryName}. ${t('categorySubDescription')}`,
    keywords: `${categoryName.toLowerCase()}, blog tecnología, CECOM, República Dominicana`,
    openGraph: {
      title: `${categoryName} | CECOM Blog`,
      description: `${t('categoryDescription')} ${categoryName}`,
      type: 'website',
      locale: locale,
    },
    alternates: {
      canonical: `/${locale}/blog/category/${category}`,
      languages: {
        'es': `/es/blog/category/${category}`,
        'en': `/en/blog/category/${category}`,
      }
    }
  };
}

// Mock data - será reemplazado por datos reales de PayloadCMS
const mockCategories = {
  'ciberseguridad': {
    name: { es: 'Ciberseguridad', en: 'Cybersecurity' },
    description: { 
      es: 'Artículos sobre protección digital, firewalls, antivirus y mejores prácticas de seguridad informática.',
      en: 'Articles about digital protection, firewalls, antivirus and cybersecurity best practices.'
    },
    posts: [
      {
        id: '1',
        title: {
          es: 'Guía Completa de Ciberseguridad para Empresas Dominicanas',
          en: 'Complete Cybersecurity Guide for Dominican Businesses'
        },
        excerpt: {
          es: 'Descubre las mejores prácticas de ciberseguridad adaptadas al mercado dominicano.',
          en: 'Discover cybersecurity best practices adapted to the Dominican market.'
        },
        slug: 'guia-ciberseguridad-empresas-dominicanas',
        category: 'Ciberseguridad',
        tags: ['seguridad', 'empresas', 'firewall'],
        featured_image: '/blog/cybersecurity-guide.jpg',
        published_date: '2024-08-20',
        reading_time: 8
      }
    ]
  },
  'redes': {
    name: { es: 'Redes', en: 'Networking' },
    description: { 
      es: 'Todo sobre infraestructura de red, switches, routers y conectividad empresarial.',
      en: 'Everything about network infrastructure, switches, routers and enterprise connectivity.'
    },
    posts: [
      {
        id: '2',
        title: {
          es: 'Cómo Elegir el Switch Perfecto para tu Red Empresarial',
          en: 'How to Choose the Perfect Switch for Your Business Network'
        },
        excerpt: {
          es: 'Análisis detallado de switches Extreme Networks y cómo seleccionar el modelo ideal.',
          en: 'Detailed analysis of Extreme Networks switches and how to select the ideal model.'
        },
        slug: 'elegir-switch-red-empresarial',
        category: 'Redes',
        tags: ['switches', 'extreme-networks', 'infraestructura'],
        featured_image: '/blog/network-switch-guide.jpg',
        published_date: '2024-08-18',
        reading_time: 6
      }
    ]
  }
};

async function getCategoryData(category: string, locale: string) {
  const categoryKey = category.toLowerCase();
  return mockCategories[categoryKey as keyof typeof mockCategories] || null;
}

export default async function CategoryPage({ params, searchParams }: CategoryPageProps) {
  const { locale, category } = await params;
  const { page = '1' } = await searchParams;
  const t = await getTranslations({ locale, namespace: 'Blog' });
  
  const categoryData = await getCategoryData(category, locale);
  
  if (!categoryData) {
    notFound();
  }

  const currentPage = parseInt(page);
  const postsPerPage = 6;
  const totalPosts = categoryData.posts.length;
  const totalPages = Math.ceil(totalPosts / postsPerPage);
  
  const startIndex = (currentPage - 1) * postsPerPage;
  const endIndex = startIndex + postsPerPage;
  const paginatedPosts = categoryData.posts.slice(startIndex, endIndex);

  const categoryName = categoryData.name[locale as 'es' | 'en'];
  const categoryDescription = categoryData.description[locale as 'es' | 'en'];

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

            {/* Category Header */}
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Folder className="w-6 h-6 text-primary" />
                </div>
                <h1 className="text-4xl font-bold text-foreground">
                  {categoryName}
                </h1>
              </div>
              
              <p className="text-lg text-muted-foreground mb-4">
                {categoryDescription}
              </p>
              
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span>{totalPosts} {t('articles')}</span>
              </div>
            </div>

            {/* Posts Grid */}
            {paginatedPosts.length > 0 ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  {paginatedPosts.map((post) => (
                    <BlogCard 
                      key={post.id} 
                      post={post} 
                      locale={locale as 'es' | 'en'} 
                    />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <BlogPagination 
                    currentPage={currentPage}
                    totalPages={totalPages}
                    locale={locale}
                    basePath={`/${locale}/blog/category/${category}`}
                  />
                )}
              </>
            ) : (
              <div className="text-center py-12">
                <Folder className="w-16 h-16 text-muted-foreground/50 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-muted-foreground mb-2">
                  {t('noPostsInCategory')}
                </h3>
                <p className="text-muted-foreground">
                  {t('noPostsInCategoryDescription')}
                </p>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <BlogSidebar locale={locale} activeCategory={category} />
          </div>
        </div>
      </div>
    </div>
  );
}
