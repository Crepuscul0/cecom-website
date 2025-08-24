import Link from 'next/link';
import { Folder, Tag, TrendingUp, Calendar } from 'lucide-react';
import fs from 'fs';
import path from 'path';

interface BlogSidebarProps {
  locale: string;
  activeCategory?: string;
  activeTag?: string;
}

// Load real data from JSON files
function loadCategories(locale: string) {
  try {
    const categoriesPath = path.join(process.cwd(), 'data', 'blog', 'categories.json');
    const postsPath = path.join(process.cwd(), 'data', 'blog', 'posts.json');
    const posts = JSON.parse(fs.readFileSync(postsPath, 'utf8'));
    
    if (fs.existsSync(categoriesPath)) {
      const categories = JSON.parse(fs.readFileSync(categoriesPath, 'utf8'));
      
      return categories.map((category: any) => {
        const postCount = posts.filter((post: any) => post.category === category.id).length;
        return {
          name: category.name[locale] || category.name.es,
          slug: category.slug,
          count: postCount,
          color: category.color
        };
      });
    }
  } catch (error) {
    // console.error('Error loading categories:', error);
  }
  return [];
}

function loadTags(locale: string) {
  try {
    const tagsPath = path.join(process.cwd(), 'data', 'blog', 'tags.json');
    const postsPath = path.join(process.cwd(), 'data', 'blog', 'posts.json');
    
    if (fs.existsSync(tagsPath) && fs.existsSync(postsPath)) {
      const tags = JSON.parse(fs.readFileSync(tagsPath, 'utf8'));
      const posts = JSON.parse(fs.readFileSync(postsPath, 'utf8'));
      
      // Count posts per tag
      return tags.map((tag: any) => ({
        name: tag.name[locale] || tag.name.es,
        slug: tag.slug,
        count: posts.reduce((acc: number, post: any) => {
          return acc + (post.tags && post.tags.includes(tag.id) ? 1 : 0);
        }, 0)
      })).filter((tag: any) => tag.count > 0); // Only show tags with posts
    }
  } catch (error) {
    // console.error('Error loading tags:', error);
  }
  return [];
}

function loadRecentPosts(locale: string) {
  try {
    const postsPath = path.join(process.cwd(), 'data', 'blog', 'posts.json');
    const categoriesPath = path.join(process.cwd(), 'data', 'blog', 'categories.json');
    
    if (fs.existsSync(postsPath) && fs.existsSync(categoriesPath)) {
      const posts = JSON.parse(fs.readFileSync(postsPath, 'utf8'));
      const categories = JSON.parse(fs.readFileSync(categoriesPath, 'utf8'));
      
      // Get the 3 most recent posts
      const recentPosts = posts
        .sort((a: any, b: any) => new Date(b.publishedDate).getTime() - new Date(a.publishedDate).getTime())
        .slice(0, 3)
        .map((post: any) => {
          const category = categories.find((cat: any) => cat.id === post.category);
          return {
            title: post.title,
            slug: post.slug,
            date: post.publishedDate,
            category: category?.name[locale] || category?.name.es || 'Sin categoría'
          };
        });
      
      return recentPosts;
    }
  } catch (error) {
    // console.error('Error loading recent posts:', error);
  }
  return [];
}

export function BlogSidebar({ locale, activeCategory, activeTag }: BlogSidebarProps) {
  const isSpanish = locale === 'es';
  
  // Load real data
  const categories = loadCategories(locale);
  const tags = loadTags(locale);
  const recentPosts = loadRecentPosts(locale);

  return (
    <aside className="space-y-8">

      {/* Categories */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h3 className="flex items-center gap-2 text-lg font-semibold text-foreground mb-4">
          <Folder className="w-5 h-5" />
          {isSpanish ? 'Categorías' : 'Categories'}
        </h3>
        <ul className="space-y-2">
          {categories.map((category: { name: string; slug: string; count: number }) => (
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
          {tags.map((tag: { name: string; slug: string; count: number }) => (
            <Link
              key={tag.slug}
              href={`/${locale}/blog/tag/${tag.slug}`}
              className={`
                inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs transition-colors
                ${activeTag === tag.slug
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
          {recentPosts.map((post: { title: string; slug: string; date: string; category: string }) => (
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
