'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Calendar, Clock, Tag } from 'lucide-react';
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

  // Check if post has a valid featured image
  const hasValidImage = post.featuredImage &&
    !post.featuredImage.includes('example.com') &&
    !post.featuredImage.includes('placeholder');

  const isExternalImage = hasValidImage &&
    (post.featuredImage!.startsWith('http://') || post.featuredImage!.startsWith('https://'));

  return (
    <Link href={`/${locale}/blog/${post.slug}`}>
      <article className="group bg-card border border-border rounded-lg overflow-hidden hover:shadow-lg transition-all duration-300 hover:border-primary/20 h-full flex flex-col">
        {/* Image or Gradient */}
        <div className="relative h-48 overflow-hidden bg-gradient-to-br from-primary/10 via-primary/5 to-background">
          {hasValidImage ? (
            isExternalImage ? (
              <Image
                src={post.featuredImage!}
                alt={title}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
              />
            ) : (
              <Image
                src={post.featuredImage!}
                alt={title}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
                unoptimized
              />
            )
          ) : (
            // Show icon for posts without images
            <div className="absolute inset-0 flex items-center justify-center">
              <Tag className="w-16 h-16 text-primary/20 group-hover:text-primary/30 transition-colors" />
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-6 flex-1 flex flex-col">
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
            {title}
          </h2>

          {/* Excerpt */}
          <p className="text-muted-foreground mb-4 line-clamp-3 leading-relaxed flex-1">
            {excerpt}
          </p>

          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {post.tags.slice(0, 3).map((tag: string) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 px-2 py-1 bg-accent text-accent-foreground rounded text-xs"
                >
                  <Tag className="w-2.5 h-2.5" />
                  {tag}
                </span>
              ))}
              {post.tags.length > 3 && (
                <span className="px-2 py-1 text-xs text-muted-foreground">
                  +{post.tags.length - 3}
                </span>
              )}
            </div>
          )}
        </div>
      </article>
    </Link>
  );
}
