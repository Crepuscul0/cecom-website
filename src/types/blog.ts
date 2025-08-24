export interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  slug: string;
  category: string;
  tags: string[];
  featuredImage?: string;
  publishedDate: string;
  readingTime: number;
  author: string;
  status: 'published' | 'draft';
  sourceUrl?: string;
  seo?: {
    metaTitle: string;
    metaDescription: string;
    keywords: string;
  };
}

export interface BlogCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  color?: string;
}

export interface BlogTag {
  id: string;
  name: string;
  slug: string;
  count?: number;
}

export interface BlogFilters {
  category?: string;
  tag?: string;
  search?: string;
  page?: number;
}

export interface BlogPaginationProps {
  currentPage: number;
  totalPages: number;
  locale: string;
}
