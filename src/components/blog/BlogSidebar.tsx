import Link from 'next/link';
import { Folder, Tag, TrendingUp, Calendar, Search } from 'lucide-react';

interface BlogSidebarProps {
  locale: string;
  activeCategory?: string;
  activeTag?: string;
}

// Mock data - será reemplazado por datos reales de PayloadCMS
const mockCategories = [
  { name: 'Ciberseguridad', slug: 'ciberseguridad', count: 8 },
  { name: 'Redes', slug: 'redes', count: 12 },
  { name: 'Casos de Éxito', slug: 'casos-de-exito', count: 6 },
  { name: 'Guías Técnicas', slug: 'guias-tecnicas', count: 10 },
  { name: 'Tendencias', slug: 'tendencias', count: 4 }
];

const mockTags = [
  { name: 'seguridad', count: 15 },
  { name: 'firewall', count: 8 },
  { name: 'switches', count: 12 },
  { name: 'extreme-networks', count: 10 },
  { name: 'watchguard', count: 7 },
  { name: 'empresas', count: 20 },
  { name: 'configuracion', count: 9 },
  { name: 'troubleshooting', count: 6 }
];

const mockRecentPosts = [
  {
    title: 'Guía Completa de Ciberseguridad para Empresas Dominicanas',
    slug: 'guia-ciberseguridad-empresas-dominicanas',
    date: '2024-08-20',
    category: 'Ciberseguridad'
  },
  {
    title: 'Cómo Elegir el Switch Perfecto para tu Red Empresarial',
    slug: 'elegir-switch-red-empresarial',
    date: '2024-08-18',
    category: 'Redes'
  },
  {
    title: 'Caso de Éxito: Modernización de Red en Empresa Local',
    slug: 'caso-exito-modernizacion-red',
    date: '2024-08-15',
    category: 'Casos de Éxito'
  }
];

export function BlogSidebar({ locale, activeCategory, activeTag }: BlogSidebarProps) {
  const isSpanish = locale === 'es';

  return (
    <aside className="space-y-8">
      {/* Search Widget */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h3 className="flex items-center gap-2 text-lg font-semibold text-foreground mb-4">
          <Search className="w-5 h-5" />
          {isSpanish ? 'Buscar' : 'Search'}
        </h3>
        <form action={`/${locale}/blog`} method="get">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="search"
              name="search"
              placeholder={isSpanish ? 'Buscar artículos...' : 'Search articles...'}
              className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
        </form>
      </div>

      {/* Categories */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h3 className="flex items-center gap-2 text-lg font-semibold text-foreground mb-4">
          <Folder className="w-5 h-5" />
          {isSpanish ? 'Categorías' : 'Categories'}
        </h3>
        <ul className="space-y-2">
          {mockCategories.map((category) => (
            <li key={category.slug}>
              <Link
                href={`/${locale}/blog/category/${category.slug}`}
                className={`
                  flex items-center justify-between p-2 rounded-lg transition-colors
                  ${activeCategory === category.slug
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                  }
                `}
              >
                <span className="text-sm">{category.name}</span>
                <span className="text-xs bg-muted text-muted-foreground px-2 py-1 rounded-full">
                  {category.count}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>

      {/* Popular Tags */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h3 className="flex items-center gap-2 text-lg font-semibold text-foreground mb-4">
          <Tag className="w-5 h-5" />
          {isSpanish ? 'Tags Populares' : 'Popular Tags'}
        </h3>
        <div className="flex flex-wrap gap-2">
          {mockTags.map((tag) => (
            <Link
              key={tag.name}
              href={`/${locale}/blog/tag/${tag.name}`}
              className={`
                inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs transition-colors
                ${activeTag === tag.name
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-accent text-accent-foreground hover:bg-accent/80'
                }
              `}
            >
              #{tag.name}
              <span className="text-xs opacity-70">({tag.count})</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent Posts */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h3 className="flex items-center gap-2 text-lg font-semibold text-foreground mb-4">
          <TrendingUp className="w-5 h-5" />
          {isSpanish ? 'Artículos Recientes' : 'Recent Posts'}
        </h3>
        <ul className="space-y-4">
          {mockRecentPosts.map((post) => (
            <li key={post.slug}>
              <Link
                href={`/${locale}/blog/${post.slug}`}
                className="group block"
              >
                <h4 className="text-sm font-medium text-foreground group-hover:text-primary transition-colors line-clamp-2 mb-2">
                  {post.title}
                </h4>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Calendar className="w-3 h-3" />
                  <time dateTime={post.date}>
                    {new Date(post.date).toLocaleDateString(
                      isSpanish ? 'es-DO' : 'en-US',
                      { month: 'short', day: 'numeric' }
                    )}
                  </time>
                  <span>•</span>
                  <span>{post.category}</span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </div>

      {/* Newsletter Signup */}
      <div className="bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-foreground mb-2">
          {isSpanish ? 'Mantente Actualizado' : 'Stay Updated'}
        </h3>
        <p className="text-sm text-muted-foreground mb-4">
          {isSpanish 
            ? 'Recibe las últimas noticias y artículos técnicos directamente en tu email.'
            : 'Get the latest news and technical articles delivered to your inbox.'
          }
        </p>
        <form className="space-y-3">
          <input
            type="email"
            placeholder={isSpanish ? 'Tu email' : 'Your email'}
            className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          />
          <button
            type="submit"
            className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            {isSpanish ? 'Suscribirse' : 'Subscribe'}
          </button>
        </form>
      </div>

      {/* Contact CTA */}
      <div className="bg-card border border-border rounded-lg p-6 text-center">
        <h3 className="text-lg font-semibold text-foreground mb-2">
          {isSpanish ? '¿Necesitas Ayuda?' : 'Need Help?'}
        </h3>
        <p className="text-sm text-muted-foreground mb-4">
          {isSpanish 
            ? 'Nuestro equipo de expertos está listo para asesorarte.'
            : 'Our expert team is ready to advise you.'
          }
        </p>
        <Link
          href={`/${locale}/contact`}
          className="inline-flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          {isSpanish ? 'Contáctanos' : 'Contact Us'}
        </Link>
      </div>
    </aside>
  );
}
