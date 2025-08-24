'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Calendar, Clock, Tag, ArrowRight } from 'lucide-react';
import { BlogPost } from '@/types/blog';
import { parseDate, formatDate } from '@/utils/blog';

interface BlogCardProps {
  post: BlogPost;
  locale: 'es' | 'en';
}

export function BlogCard({ post, locale }: BlogCardProps) {
  const title = post.title;
  const excerpt = post.excerpt;
  
  // Use utility functions for date parsing and formatting
  const parsedDate = parseDate(post.publishedDate);
  const formattedDate = formatDate(parsedDate, locale);

  return (
    <article className="group bg-card border border-border rounded-lg overflow-hidden hover:shadow-lg transition-all duration-300 hover:border-primary/20">
      {/* Security Advisory Icon */}
      <div className="relative h-48 mb-4 overflow-hidden rounded-lg bg-gradient-to-br from-red-500/10 to-orange-500/10 border border-red-200/20">
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="w-20 h-20 mx-auto mb-3 bg-red-500/20 rounded-full flex items-center justify-center">
              <svg className="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
              </svg>
            </div>
            <p className="text-sm font-medium text-red-600 dark:text-red-400">Security Advisory</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Meta Information */}
        <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3">
          <div className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            <time dateTime={post.publishedDate}>{formattedDate}</time>
          </div>
          
          <div className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            <span>{post.readingTime} min</span>
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
          {post.tags.slice(0, 3).map((tag: string) => (
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
