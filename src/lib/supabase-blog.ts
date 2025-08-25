import { supabase } from './supabase';
import { BlogPost } from '@/types/blog';

export interface BlogCategory {
  id: string;
  name_es: string;
  name_en: string;
  slug: string;
  description?: string;
  color?: string;
  created_at: string;
  updated_at: string;
}

export interface BlogTag {
  id: string;
  name_es: string;
  name_en: string;
  slug: string;
  created_at: string;
  updated_at: string;
}

export interface BlogPostDB {
  id: string;
  title: string;
  content: string;
  excerpt?: string;
  slug: string;
  category_id: string;
  featured_image?: string;
  published_date: string;
  status: 'draft' | 'published' | 'archived';
  author: string;
  reading_time?: number;
  meta_title?: string;
  meta_description?: string;
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: string;
  name: string;
  description?: string;
  category: string;
  brand: string;
  model?: string;
  price?: number;
  currency?: string;
  image_url?: string;
  external_image_url?: string;
  datasheet_url?: string;
  status: 'active' | 'inactive' | 'discontinued';
  created_at: string;
  updated_at: string;
}

// Blog Posts
export async function getBlogPosts(options?: {
  status?: 'published' | 'draft' | 'archived';
  category?: string;
  limit?: number;
  offset?: number;
}): Promise<BlogPost[]> {
  let query = supabase
    .from('blog_posts')
    .select(`
      *,
      blog_categories(name_es, name_en, slug)
    `);

  if (options?.status) {
    query = query.eq('status', options.status);
  }

  if (options?.category) {
    query = query.eq('category_id', options.category);
  }

  if (options?.limit) {
    query = query.limit(options.limit);
  }

  if (options?.offset) {
    query = query.range(options.offset, options.offset + (options.limit || 10) - 1);
  }

  query = query.order('published_date', { ascending: false });

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching blog posts:', error);
    return [];
  }

  return data?.map(post => ({
    id: post.id,
    title: post.title,
    excerpt: post.excerpt || '',
    content: post.content,
    slug: post.slug,
    category: post.blog_categories?.slug || '',
    tags: [], // Tags will need to be implemented separately
    featuredImage: post.featured_image,
    publishedDate: post.published_date,
    readingTime: 5, // Default reading time
    author: post.author,
    status: post.status,
    seo: post.meta_title || post.meta_description ? {
      metaTitle: post.meta_title || post.title,
      metaDescription: post.meta_description || post.excerpt || '',
      keywords: ''
    } : undefined
  })) || [];
}

export async function getBlogPost(slug: string): Promise<BlogPost | null> {
  const { data, error } = await supabase
    .from('blog_posts')
    .select(`
      *,
      blog_categories(name_es, name_en, slug)
    `)
    .eq('slug', slug)
    .eq('status', 'published')
    .single();

  if (error || !data) {
    return null;
  }

  return {
    id: data.id,
    title: data.title,
    excerpt: data.excerpt || '',
    content: data.content,
    slug: data.slug,
    category: data.blog_categories?.slug || '',
    tags: [], // Tags will need to be implemented separately
    featuredImage: data.featured_image,
    publishedDate: data.published_date,
    readingTime: 5, // Default reading time
    author: data.author,
    status: data.status,
    seo: data.meta_title || data.meta_description ? {
      metaTitle: data.meta_title || data.title,
      metaDescription: data.meta_description || data.excerpt || '',
      keywords: ''
    } : undefined
  };
}

// Blog Categories
export async function getBlogCategories(): Promise<BlogCategory[]> {
  const { data, error } = await supabase
    .from('blog_categories')
    .select('*')
    .order('name_es');

  if (error) {
    console.error('Error fetching blog categories:', error);
    return [];
  }

  return data || [];
}

export async function getBlogCategoriesWithCounts(): Promise<Array<BlogCategory & { post_count: number }>> {
  const { data, error } = await supabase
    .from('blog_categories')
    .select(`
      *,
      blog_posts(count)
    `)
    .eq('blog_posts.status', 'published');

  if (error) {
    console.error('Error fetching blog categories with counts:', error);
    return [];
  }

  return data?.map(category => ({
    ...category,
    post_count: category.blog_posts?.[0]?.count || 0
  })) || [];
}

// Blog Tags
export async function getBlogTags(): Promise<BlogTag[]> {
  const { data, error } = await supabase
    .from('blog_tags')
    .select('*')
    .order('name_es');

  if (error) {
    console.error('Error fetching blog tags:', error);
    return [];
  }

  return data || [];
}

export async function getBlogTagsWithCounts(): Promise<Array<BlogTag & { post_count: number }>> {
  const { data, error } = await supabase
    .from('blog_tags')
    .select(`
      *,
      blog_post_tags(count)
    `);

  if (error) {
    console.error('Error fetching blog tags with counts:', error);
    return [];
  }

  return data?.map(tag => ({
    ...tag,
    post_count: tag.blog_post_tags?.length || 0
  })) || [];
}

// Products
export async function getProducts(options?: {
  category?: string;
  brand?: string;
  status?: 'active' | 'inactive' | 'discontinued';
  limit?: number;
  offset?: number;
}): Promise<Product[]> {
  let query = supabase
    .from('products')
    .select('*');

  if (options?.category) {
    query = query.eq('category', options.category);
  }

  if (options?.brand) {
    query = query.eq('brand', options.brand);
  }

  if (options?.status) {
    query = query.eq('status', options.status);
  } else {
    query = query.eq('status', 'active'); // Default to active products
  }

  if (options?.limit) {
    query = query.limit(options.limit);
  }

  if (options?.offset) {
    query = query.range(options.offset, options.offset + (options.limit || 10) - 1);
  }

  query = query.order('name');

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching products:', error);
    return [];
  }

  return data || [];
}

export async function getProduct(id: string): Promise<Product | null> {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .eq('status', 'active')
    .single();

  if (error || !data) {
    return null;
  }

  return data;
}

// Utility functions for sitemap generation
export async function getAllPublishedBlogSlugs(): Promise<string[]> {
  const { data, error } = await supabase
    .from('blog_posts')
    .select('slug')
    .eq('status', 'published');

  if (error) {
    console.error('Error fetching blog slugs:', error);
    return [];
  }

  return data?.map(post => post.slug) || [];
}

export async function getAllProductIds(): Promise<string[]> {
  const { data, error } = await supabase
    .from('products')
    .select('id')
    .eq('status', 'active');

  if (error) {
    console.error('Error fetching product IDs:', error);
    return [];
  }

  return data?.map(product => product.id) || [];
}

export async function getAllBlogCategorySlugs(): Promise<string[]> {
  const { data, error } = await supabase
    .from('blog_categories')
    .select('slug');

  if (error) {
    console.error('Error fetching category slugs:', error);
    return [];
  }

  return data?.map(category => category.slug) || [];
}

export async function getAllBlogTagSlugs(): Promise<string[]> {
  const { data, error } = await supabase
    .from('blog_tags')
    .select('slug');

  if (error) {
    console.error('Error fetching tag slugs:', error);
    return [];
  }

  return data?.map(tag => tag.slug) || [];
}
