import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { BlogHeader } from '@/components/blog/BlogHeader';
import { BlogCard } from '@/components/blog/BlogCard';
import { BlogSidebar } from '@/components/blog/BlogSidebar';
import { BlogPagination } from '@/components/blog/BlogPagination';
import Link from 'next/link';
import { ArrowLeft, Tag } from 'lucide-react';

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

// Mock data - será reemplazado por datos reales de PayloadCMS
const mockTagData = {
  'seguridad': [
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
  ],
  'switches': [
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
  ],
  'extreme-networks': [
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
};

async function getPostsByTag(tag: string) {
  const tagKey = tag.toLowerCase();
  return mockTagData[tagKey as keyof typeof mockTagData] || [];
}

export default async function TagPage({ params, searchParams }: TagPageProps) {
  const { locale, tag } = await params;
  const { page = '1' } = await searchParams;
  const t = await getTranslations({ locale, namespace: 'Blog' });
  
  const posts = await getPostsByTag(tag);
  
  if (posts.length === 0) {
    notFound();
  }

  const currentPage = parseInt(page);
  const postsPerPage = 6;
  const totalPosts = posts.length;
  const totalPages = Math.ceil(totalPosts / postsPerPage);
  
  const startIndex = (currentPage - 1) * postsPerPage;
  const endIndex = startIndex + postsPerPage;
  const paginatedPosts = posts.slice(startIndex, endIndex);

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
                <span>{totalPosts} {t('articles')}</span>
              </div>
            </div>

            {/* Posts Grid */}
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
