import { getTranslations } from 'next-intl/server'
import { notFound } from 'next/navigation'
import { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft, Calendar, Clock, Tag, User } from 'lucide-react'
import { BlogHeader } from '@/components/blog/BlogHeader';
import { BlogContent } from '@/components/blog/BlogContent';
import { BlogSidebar } from '@/components/blog/BlogSidebar';
import { RelatedPosts } from '@/components/blog/RelatedPosts';
import { ArticleSchema } from '@/components/seo/StructuredData'

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

// Mock function - será reemplazada por consulta real a PayloadCMS
async function getPostBySlug(slug: string, locale: string) {
  const mockPosts = {
    'guia-ciberseguridad-empresas-dominicanas': {
      id: '1',
      title: locale === 'es' 
        ? 'Guía Completa de Ciberseguridad para Empresas Dominicanas'
        : 'Complete Cybersecurity Guide for Dominican Businesses',
      excerpt: locale === 'es'
        ? 'Descubre las mejores prácticas de ciberseguridad adaptadas al mercado dominicano y protege tu empresa de las amenazas digitales.'
        : 'Discover cybersecurity best practices adapted to the Dominican market and protect your business from digital threats.',
      content: locale === 'es' ? `
# Guía Completa de Ciberseguridad para Empresas Dominicanas

En el panorama digital actual, la **ciberseguridad** se ha convertido en una prioridad crítica para las empresas dominicanas. Con el aumento de las amenazas digitales y la digitalización acelerada, proteger los activos digitales de tu empresa ya no es opcional.

## ¿Por qué es crucial la ciberseguridad en República Dominicana?

Las empresas dominicanas enfrentan desafíos únicos:

- **Aumento del 150%** en ataques cibernéticos en los últimos 2 años
- Regulaciones locales cada vez más estrictas
- Dependencia creciente de sistemas digitales
- Falta de conciencia sobre amenazas emergentes

## Principales Amenazas para Empresas Locales

### 1. Ransomware
Los ataques de ransomware han aumentado significativamente en la región. Empresas de todos los tamaños son objetivos potenciales.

### 2. Phishing Dirigido
Ataques específicamente diseñados para el mercado dominicano, utilizando referencias locales y culturales.

### 3. Vulnerabilidades en Sistemas Legacy
Muchas empresas aún utilizan sistemas obsoletos sin actualizaciones de seguridad.

## Soluciones Recomendadas por CECOM

### Firewalls de Nueva Generación
Implementamos soluciones **WatchGuard** que ofrecen:
- Protección contra amenazas avanzadas
- Control de aplicaciones
- Filtrado web inteligente
- Reporting detallado

### Antivirus Empresarial
Recomendamos **ESET Business Security** por:
- Detección proactiva de malware
- Protección de endpoints
- Gestión centralizada
- Soporte técnico local

## Plan de Implementación

1. **Evaluación inicial** (Semana 1)
2. **Diseño de arquitectura** (Semana 2)
3. **Implementación gradual** (Semanas 3-6)
4. **Capacitación del personal** (Semana 7)
5. **Monitoreo continuo** (Ongoing)

## Contacta con CECOM

¿Necesitas asesoría personalizada? Nuestro equipo de expertos en ciberseguridad está listo para ayudarte a proteger tu empresa.

**Teléfono:** +1 (809) 555-0123  
**Email:** seguridad@cecom.com.do
      ` : `
# Complete Cybersecurity Guide for Dominican Businesses

In today's digital landscape, **cybersecurity** has become a critical priority for Dominican businesses. With the rise of digital threats and accelerated digitalization, protecting your company's digital assets is no longer optional.

## Why is cybersecurity crucial in the Dominican Republic?

Dominican businesses face unique challenges:

- **150% increase** in cyber attacks in the last 2 years
- Increasingly strict local regulations
- Growing dependence on digital systems
- Lack of awareness about emerging threats

## Main Threats for Local Businesses

### 1. Ransomware
Ransomware attacks have increased significantly in the region. Companies of all sizes are potential targets.

### 2. Targeted Phishing
Attacks specifically designed for the Dominican market, using local and cultural references.

### 3. Legacy System Vulnerabilities
Many companies still use obsolete systems without security updates.

## Solutions Recommended by CECOM

### Next-Generation Firewalls
We implement **WatchGuard** solutions that offer:
- Advanced threat protection
- Application control
- Intelligent web filtering
- Detailed reporting

### Enterprise Antivirus
We recommend **ESET Business Security** for:
- Proactive malware detection
- Endpoint protection
- Centralized management
- Local technical support

## Implementation Plan

1. **Initial assessment** (Week 1)
2. **Architecture design** (Week 2)
3. **Gradual implementation** (Weeks 3-6)
4. **Staff training** (Week 7)
5. **Continuous monitoring** (Ongoing)

## Contact CECOM

Need personalized advice? Our cybersecurity expert team is ready to help protect your business.

**Phone:** +1 (809) 555-0123  
**Email:** security@cecom.com.do
      `,
      slug: 'guia-ciberseguridad-empresas-dominicanas',
      category: 'Ciberseguridad',
      tags: ['seguridad', 'empresas', 'firewall', 'antivirus', 'watchguard', 'eset'],
      featuredImage: '/blog/cybersecurity-guide.jpg',
      publishedDate: '2024-08-20',
      readingTime: 8,
      author: 'Equipo CECOM'
    }
  };

  return mockPosts[slug as keyof typeof mockPosts] || null;
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { locale, slug } = await params;
  const t = await getTranslations({ locale, namespace: 'Blog' });
  
  const post = await getPostBySlug(slug, locale);
  
  if (!post) {
    notFound();
  }

  const formattedDate = new Date(post.publishedDate).toLocaleDateString(
    locale === 'es' ? 'es-DO' : 'en-US',
    { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    }
  );

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
            {post.tags.map((tag) => (
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

        {/* Structured Data */}
        <ArticleSchema
          title={post.title}
          description={post.excerpt}
          publishedDate={post.publishedDate}
          author={post.author}
          locale={locale}
          slug={slug}
          imageUrl={post.featuredImage}
        />

        {/* Article Content */}
        <div className="prose prose-lg max-w-none dark:prose-invert">
          <BlogContent content={post.content} />
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

      {/* Related Posts */}
      <section className="container mx-auto px-4 py-8 max-w-4xl">
        <RelatedPosts 
          currentPostId={post.id}
          category={post.category}
          locale={locale}
        />
      </section>
    </div>
  );
}
