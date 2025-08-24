import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { BlogHeader } from '@/components/blog/BlogHeader';
import { BlogCard } from '@/components/blog/BlogCard';
import { BlogSidebar } from '@/components/blog/BlogSidebar';
import { BlogPagination } from '@/components/blog/BlogPagination';
import Link from 'next/link';
import { ArrowLeft, Folder } from 'lucide-react';
import { BlogPost } from '@/types/blog';
import { normalizeBlogPost, filterBlogPosts, sortBlogPosts, paginateBlogPosts } from '@/utils/blog';
import fs from 'fs';
import path from 'path';

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

// Load RSS data from local files and filter by category
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

async function getPostsByCategory(categorySlug: string): Promise<BlogPost[]> {
  const allPosts = loadBlogPosts();
  const sortedPosts = sortBlogPosts(allPosts);
  
  // Load categories to map slug to ID
  try {
    const categoriesPath = path.join(process.cwd(), 'data', 'blog', 'categories.json');
    if (fs.existsSync(categoriesPath)) {
      const categories = JSON.parse(fs.readFileSync(categoriesPath, 'utf8'));
      const category = categories.find((cat: any) => cat.slug === categorySlug);
      
      if (category) {
        // Filter posts by category ID
        return filterBlogPosts(sortedPosts, {
          category: category.id,
          status: 'published'
        });
      }
    }
  } catch (error) {
    console.error('Error loading categories:', error);
  }
  
  return [];
}

// Category metadata mapping
const categoryMetadata = {
  'ciberseguridad': {
    name: { es: 'Ciberseguridad', en: 'Cybersecurity' },
    description: { 
      es: 'Artículos sobre protección digital, firewalls, antivirus y mejores prácticas de seguridad informática.',
      en: 'Articles about digital protection, firewalls, antivirus and cybersecurity best practices.'
    }
  },
  'cat-cybersecurity': {
    name: { es: 'Ciberseguridad', en: 'Cybersecurity' },
    description: { 
      es: 'Artículos sobre protección digital, firewalls, antivirus y mejores prácticas de seguridad informática.',
      en: 'Articles about digital protection, firewalls, antivirus and cybersecurity best practices.'
    }
  },
  'redes': {
    name: { es: 'Redes', en: 'Networking' },
    description: { 
      es: 'Todo sobre infraestructura de red, switches, routers y conectividad empresarial.',
      en: 'Everything about network infrastructure, switches, routers and enterprise connectivity.'
    }
  }
};

export default async function CategoryPage({ params, searchParams }: CategoryPageProps) {
  const { locale, category } = await params;
  const { page = '1' } = await searchParams;
  const t = await getTranslations({ locale, namespace: 'Blog' });
  
  const posts = await getPostsByCategory(category);
  
  if (posts.length === 0) {
    notFound();
  }

  // Apply pagination
  const currentPage = parseInt(page);
  const paginationResult = paginateBlogPosts(posts, currentPage, 6);

  // Get category metadata
  const categoryKey = category.toLowerCase();
  const metadata = categoryMetadata[categoryKey as keyof typeof categoryMetadata];
  const categoryName = metadata?.name[locale as 'es' | 'en'] || category;
  const categoryDescription = metadata?.description[locale as 'es' | 'en'] || '';

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
                <span>{posts.length} {t('articles')}</span>
              </div>
            </div>

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
                {paginationResult.totalPages > 1 && (
                  <BlogPagination 
                    currentPage={paginationResult.currentPage}
                    totalPages={paginationResult.totalPages}
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
