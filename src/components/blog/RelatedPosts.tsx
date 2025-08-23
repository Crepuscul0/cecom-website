import Link from 'next/link';
import { Calendar, Clock, ArrowRight } from 'lucide-react';

interface RelatedPost {
  id: string;
  title: string;
  excerpt: string;
  slug: string;
  category: string;
  featured_image?: string;
  published_date: string;
  reading_time: number;
}

interface RelatedPostsProps {
  currentPostId: string;
  category: string;
  locale: string;
}

// Mock data - será reemplazado por datos reales de PayloadCMS
const mockRelatedPosts: RelatedPost[] = [
  {
    id: '2',
    title: 'Cómo Elegir el Switch Perfecto para tu Red Empresarial',
    excerpt: 'Análisis detallado de switches Extreme Networks y cómo seleccionar el modelo ideal según las necesidades de tu empresa.',
    slug: 'elegir-switch-red-empresarial',
    category: 'Redes',
    featured_image: '/blog/network-switch-guide.jpg',
    published_date: '2024-08-18',
    reading_time: 6
  },
  {
    id: '3',
    title: 'Mejores Prácticas para Configurar Firewalls WatchGuard',
    excerpt: 'Guía paso a paso para configurar y optimizar tu firewall WatchGuard para máxima seguridad empresarial.',
    slug: 'configurar-firewalls-watchguard',
    category: 'Ciberseguridad',
    featured_image: '/blog/watchguard-config.jpg',
    published_date: '2024-08-16',
    reading_time: 10
  },
  {
    id: '4',
    title: 'Caso de Éxito: Modernización de Red en Empresa Local',
    excerpt: 'Cómo ayudamos a una empresa dominicana a modernizar completamente su infraestructura de red con resultados excepcionales.',
    slug: 'caso-exito-modernizacion-red',
    category: 'Casos de Éxito',
    featured_image: '/blog/case-study-network.jpg',
    published_date: '2024-08-15',
    reading_time: 8
  }
];

async function getRelatedPosts(currentPostId: string, category: string, limit: number = 3) {
  // TODO: Implementar consulta real a PayloadCMS
  // Filtrar posts relacionados por categoría, excluyendo el post actual
  return mockRelatedPosts
    .filter(post => post.id !== currentPostId)
    .slice(0, limit);
}

export async function RelatedPosts({ currentPostId, category, locale }: RelatedPostsProps) {
  const relatedPosts = await getRelatedPosts(currentPostId, category);
  
  if (relatedPosts.length === 0) {
    return null;
  }

  const isSpanish = locale === 'es';

  return (
    <section className="border-t border-border pt-8">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-foreground mb-2">
          {isSpanish ? 'Artículos Relacionados' : 'Related Articles'}
        </h2>
        <p className="text-muted-foreground">
          {isSpanish 
            ? 'Continúa explorando más contenido relevante'
            : 'Continue exploring more relevant content'
          }
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {relatedPosts.map((post) => {
          const formattedDate = new Date(post.published_date).toLocaleDateString(
            isSpanish ? 'es-DO' : 'en-US',
            { 
              year: 'numeric', 
              month: 'short', 
              day: 'numeric' 
            }
          );

          return (
            <article
              key={post.id}
              className="group bg-card border border-border rounded-lg overflow-hidden hover:shadow-lg transition-all duration-300 hover:border-primary/20"
            >
              {/* Featured Image */}
              {post.featured_image && (
                <div className="relative h-40 overflow-hidden">
                  <img
                    src={post.featured_image}
                    alt={post.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  
                  {/* Category Badge */}
                  <div className="absolute top-3 left-3">
                    <span className="inline-block px-2 py-1 bg-primary text-primary-foreground rounded text-xs font-medium">
                      {post.category}
                    </span>
                  </div>
                </div>
              )}

              {/* Content */}
              <div className="p-4">
                {/* Meta Information */}
                <div className="flex items-center gap-3 text-xs text-muted-foreground mb-2">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    <time dateTime={post.published_date}>{formattedDate}</time>
                  </div>
                  
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>{post.reading_time} min</span>
                  </div>
                </div>

                {/* Title */}
                <h3 className="text-lg font-semibold text-foreground mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                  <Link href={`/${locale}/blog/${post.slug}`}>
                    {post.title}
                  </Link>
                </h3>

                {/* Excerpt */}
                <p className="text-sm text-muted-foreground mb-3 line-clamp-2 leading-relaxed">
                  {post.excerpt}
                </p>

                {/* Read More Link */}
                <Link
                  href={`/${locale}/blog/${post.slug}`}
                  className="inline-flex items-center gap-1 text-primary hover:text-primary/80 transition-colors font-medium text-sm group"
                >
                  {isSpanish ? 'Leer más' : 'Read more'}
                  <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </article>
          );
        })}
      </div>

      {/* View All Posts Link */}
      <div className="text-center mt-8">
        <Link
          href={`/${locale}/blog`}
          className="inline-flex items-center gap-2 px-6 py-3 bg-accent text-accent-foreground rounded-lg hover:bg-accent/80 transition-colors font-medium"
        >
          {isSpanish ? 'Ver Todos los Artículos' : 'View All Articles'}
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </section>
  );
}
