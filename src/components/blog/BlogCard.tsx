import Link from 'next/link';
import { Calendar, Clock, Tag, ArrowRight } from 'lucide-react';

interface BlogPost {
  id: string;
  title: { es: string; en: string } | string;
  excerpt: { es: string; en: string } | string;
  slug: string;
  category: string;
  tags: string[];
  featured_image?: string;
  published_date: string;
  reading_time: number;
}

interface BlogCardProps {
  post: BlogPost;
  locale: 'es' | 'en';
}

export function BlogCard({ post, locale }: BlogCardProps) {
  const title = typeof post.title === 'string' ? post.title : post.title[locale];
  const excerpt = typeof post.excerpt === 'string' ? post.excerpt : post.excerpt[locale];
  
  const formattedDate = new Date(post.published_date).toLocaleDateString(
    locale === 'es' ? 'es-DO' : 'en-US',
    { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    }
  );

  return (
    <article className="group bg-card border border-border rounded-lg overflow-hidden hover:shadow-lg transition-all duration-300 hover:border-primary/20">
      {/* Featured Image */}
      {post.featured_image && (
        <div className="relative h-48 overflow-hidden">
          <img
            src={post.featured_image}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          
          {/* Category Badge */}
          <div className="absolute top-4 left-4">
            <Link
              href={`/${locale}/blog/category/${post.category.toLowerCase()}`}
              className="inline-block px-3 py-1 bg-primary text-primary-foreground rounded-full text-xs font-medium hover:bg-primary/90 transition-colors"
            >
              {post.category}
            </Link>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="p-6">
        {/* Meta Information */}
        <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3">
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
        <h2 className="text-xl font-bold text-foreground mb-3 line-clamp-2 group-hover:text-primary transition-colors">
          <Link href={`/${locale}/blog/${post.slug}`}>
            {title}
          </Link>
        </h2>

        {/* Excerpt */}
        <p className="text-muted-foreground mb-4 line-clamp-3 leading-relaxed">
          {excerpt}
        </p>

        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-4">
          {post.tags.slice(0, 3).map((tag) => (
            <Link
              key={tag}
              href={`/${locale}/blog/tag/${tag}`}
              className="inline-flex items-center gap-1 px-2 py-1 bg-accent text-accent-foreground rounded text-xs hover:bg-accent/80 transition-colors"
            >
              <Tag className="w-2.5 h-2.5" />
              {tag}
            </Link>
          ))}
          {post.tags.length > 3 && (
            <span className="px-2 py-1 text-xs text-muted-foreground">
              +{post.tags.length - 3}
            </span>
          )}
        </div>

        {/* Read More Link */}
        <Link
          href={`/${locale}/blog/${post.slug}`}
          className="inline-flex items-center gap-2 text-primary hover:text-primary/80 transition-colors font-medium text-sm group"
        >
          {locale === 'es' ? 'Leer más' : 'Read more'}
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>
    </article>
  );
}
