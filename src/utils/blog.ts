import { BlogPost } from '@/types/blog';
import { marked } from 'marked';

/**
 * Convert Markdown content to HTML
 */
export function markdownToHtml(markdown: string): string {
  try {
    const html = marked(markdown);
    return typeof html === 'string' ? html : markdown;
  } catch (error) {
    console.error('Error converting markdown to HTML:', error);
    return markdown;
  }
}

/**
 * Calculate reading time based on content length
 * Average reading speed: 200 words per minute
 */
export function calculateReadingTime(content: string): number {
  const wordsPerMinute = 200;
  const words = content.trim().split(/\s+/).length;
  const readingTime = Math.ceil(words / wordsPerMinute);
  return Math.max(1, readingTime); // Minimum 1 minute
}

/**
 * Parse date from various formats (RFC 2822, ISO, etc.)
 */
export function parseDate(dateString: string): Date {
  // Handle RSS date format: "Thu, 7 Aug 2025 19:28:19 +0000"
  const date = new Date(dateString);
  return isNaN(date.getTime()) ? new Date() : date;
}

/**
 * Format date for display
 */
export function formatDate(date: Date, locale: string): string {
  return date.toLocaleDateString(
    locale === 'es' ? 'es-DO' : 'en-US',
    { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    }
  );
}

/**
 * Generate excerpt from content if not provided
 */
export function generateExcerpt(content: string, maxLength: number = 160): string {
  // Remove markdown formatting
  const plainText = content
    .replace(/#{1,6}\s+/g, '') // Remove headers
    .replace(/\*\*(.*?)\*\*/g, '$1') // Remove bold
    .replace(/\*(.*?)\*/g, '$1') // Remove italic
    .replace(/\[(.*?)\]\(.*?\)/g, '$1') // Remove links
    .replace(/```[\s\S]*?```/g, '') // Remove code blocks
    .replace(/`(.*?)`/g, '$1') // Remove inline code
    .trim();

  if (plainText.length <= maxLength) {
    return plainText;
  }

  return plainText.substring(0, maxLength).trim() + '...';
}

/**
 * Normalize blog post data from different sources
 */
export function normalizeBlogPost(rawPost: any): BlogPost {
  // Ensure title and excerpt are strings
  const title = typeof rawPost.title === 'string' ? rawPost.title : 
               typeof rawPost.title === 'object' ? rawPost.title.es || rawPost.title.en || 'Sin título' :
               'Sin título';
               
  const excerpt = typeof rawPost.excerpt === 'string' ? rawPost.excerpt :
                  typeof rawPost.excerpt === 'object' ? rawPost.excerpt.es || rawPost.excerpt.en || generateExcerpt(rawPost.content || '') :
                  generateExcerpt(rawPost.content || '');

  return {
    id: rawPost.id,
    title: title,
    excerpt: excerpt,
    content: markdownToHtml(rawPost.content || ''), // Convert Markdown to HTML
    slug: rawPost.slug,
    category: rawPost.category,
    tags: rawPost.tags || [],
    featuredImage: rawPost.featuredImage || rawPost.featured_image,
    publishedDate: rawPost.publishedDate || rawPost.published_date,
    readingTime: rawPost.readingTime || rawPost.reading_time || calculateReadingTime(rawPost.content || ''),
    author: rawPost.author || 'Equipo CECOM',
    status: rawPost.status || 'published',
    sourceUrl: rawPost.sourceUrl,
    seo: rawPost.seo
  };
}

/**
 * Filter blog posts based on criteria
 */
export function filterBlogPosts(
  posts: BlogPost[], 
  filters: {
    category?: string;
    tag?: string;
    search?: string;
    status?: string;
  }
): BlogPost[] {
  return posts.filter(post => {
    // Filter by category
    if (filters.category && post.category !== filters.category) {
      return false;
    }

    // Filter by tag
    if (filters.tag && !post.tags.includes(filters.tag)) {
      return false;
    }

    // Filter by search term
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      const titleMatch = post.title.toLowerCase().includes(searchLower);
      const excerptMatch = post.excerpt.toLowerCase().includes(searchLower);
      const contentMatch = post.content.toLowerCase().includes(searchLower);
      
      if (!titleMatch && !excerptMatch && !contentMatch) {
        return false;
      }
    }

    // Filter by status
    if (filters.status && post.status !== filters.status) {
      return false;
    }

    return true;
  });
}

/**
 * Sort blog posts by date (newest first)
 */
export function sortBlogPosts(posts: BlogPost[]): BlogPost[] {
  return posts.sort((a, b) => {
    const dateA = parseDate(a.publishedDate);
    const dateB = parseDate(b.publishedDate);
    return dateB.getTime() - dateA.getTime();
  });
}

/**
 * Paginate blog posts
 */
export function paginateBlogPosts(
  posts: BlogPost[], 
  page: number, 
  postsPerPage: number = 6
): {
  posts: BlogPost[];
  totalPages: number;
  currentPage: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
} {
  const startIndex = (page - 1) * postsPerPage;
  const endIndex = startIndex + postsPerPage;
  const paginatedPosts = posts.slice(startIndex, endIndex);
  const totalPages = Math.ceil(posts.length / postsPerPage);

  return {
    posts: paginatedPosts,
    totalPages,
    currentPage: page,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1
  };
}
