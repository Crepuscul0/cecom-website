'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Search, Rss, BookOpen } from 'lucide-react';
import { useState } from 'react';

interface BlogHeaderProps {
  showSearch?: boolean;
}

export function BlogHeader({ showSearch = true }: BlogHeaderProps) {
  const pathname = usePathname();
  const locale = pathname.split('/')[1] || 'es';
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/${locale}/blog?search=${encodeURIComponent(searchQuery.trim())}`;
    }
  };

  const navigationItems = [
    {
      href: `/${locale}/blog`,
      label: locale === 'es' ? 'Todos los artículos' : 'All articles',
      icon: BookOpen,
      active: pathname === `/${locale}/blog`
    },
    {
      href: `/${locale}/blog/category/ciberseguridad`,
      label: locale === 'es' ? 'Ciberseguridad' : 'Cybersecurity',
      active: pathname.includes('/category/ciberseguridad')
    },
    {
      href: `/${locale}/blog/category/redes`,
      label: locale === 'es' ? 'Redes' : 'Networking',
      active: pathname.includes('/category/redes')
    },
    {
      href: `/${locale}/blog/category/casos-de-exito`,
      label: locale === 'es' ? 'Casos de Éxito' : 'Success Stories',
      active: pathname.includes('/category/casos-de-exito')
    }
  ];

  return (
    <header className="bg-card border-b border-border">
      <div className="container mx-auto px-4 py-6">
        {/* Blog Title and Description */}
        <div className="text-center mb-8">
          <Link href={`/${locale}/blog`} className="group">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2 group-hover:text-primary transition-colors">
              CECOM {locale === 'es' ? 'Blog' : 'Blog'}
            </h1>
          </Link>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {locale === 'es' 
              ? 'Insights, guías y tendencias en tecnología empresarial para República Dominicana'
              : 'Insights, guides and trends in enterprise technology for the Dominican Republic'
            }
          </p>
        </div>

        {/* Navigation and Search */}
        <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
          {/* Navigation */}
          <nav className="flex flex-wrap items-center gap-1">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`
                    flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors
                    ${item.active 
                      ? 'bg-primary text-primary-foreground' 
                      : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                    }
                  `}
                >
                  {Icon && <Icon className="w-4 h-4" />}
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Search and RSS */}
          <div className="flex items-center gap-4">
            {/* Search Form */}
            {showSearch && (
              <form onSubmit={handleSearch} className="relative">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="search"
                    placeholder={locale === 'es' ? 'Buscar artículos...' : 'Search articles...'}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 pr-4 py-2 w-64 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
              </form>
            )}

            {/* RSS Feed Link */}
            <Link
              href={`/${locale}/blog/feed.xml`}
              className="p-2 text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-colors"
              title={locale === 'es' ? 'Feed RSS' : 'RSS Feed'}
            >
              <Rss className="w-5 h-5" />
            </Link>
          </div>
        </div>

        {/* Breadcrumb for specific pages */}
        {pathname !== `/${locale}/blog` && (
          <div className="mt-6 pt-6 border-t border-border">
            <nav className="text-sm text-muted-foreground">
              <Link 
                href={`/${locale}`}
                className="hover:text-foreground transition-colors"
              >
                {locale === 'es' ? 'Inicio' : 'Home'}
              </Link>
              <span className="mx-2">/</span>
              <Link 
                href={`/${locale}/blog`}
                className="hover:text-foreground transition-colors"
              >
                Blog
              </Link>
              {pathname.includes('/category/') && (
                <>
                  <span className="mx-2">/</span>
                  <span className="text-foreground">
                    {pathname.split('/category/')[1]?.replace('-', ' ')}
                  </span>
                </>
              )}
              {pathname.includes('/tag/') && (
                <>
                  <span className="mx-2">/</span>
                  <span className="text-foreground">
                    #{pathname.split('/tag/')[1]}
                  </span>
                </>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
