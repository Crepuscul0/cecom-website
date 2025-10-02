"use client"

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { Save, X, Eye } from 'lucide-react'
import { supabase, UserProfile, isAdmin } from '@/lib/supabase'
import { BlogPost } from '@/types/blog'
import { RichTextEditor } from '@/components/ui/RichTextEditor'

interface BlogEditorProps {
  post: BlogPost | null
  categories: any[]
  userProfile: UserProfile | null
  onSave: () => void
  onCancel: () => void
}

export function BlogEditor({ post, categories, userProfile, onSave, onCancel }: BlogEditorProps) {
  const [formData, setFormData] = useState({
    title: '',
    excerpt: '',
    content: '',
    category_id: '',
    featured_image: '',
    meta_title: '',
    meta_description: '',
    status: 'draft' as 'draft' | 'published'
  })
  const [loading, setLoading] = useState(false)
  const [showPreview, setShowPreview] = useState(false)

  const t = useTranslations('AdminPanel')

  useEffect(() => {
    if (post) {
      // Find category ID from slug
      const category = categories.find(cat => cat.slug === post.category)
      
      setFormData({
        title: post.title,
        excerpt: post.excerpt,
        content: post.content,
        category_id: category?.id || '',
        featured_image: post.featuredImage || '',
        meta_title: post.seo?.metaTitle || '',
        meta_description: post.seo?.metaDescription || '',
        status: post.status as 'draft' | 'published'
      })
    }
  }, [post, categories])

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim()
  }

  // Ensure slug is unique by checking existing posts and appending a numeric suffix if needed
  const ensureUniqueSlug = async (baseSlug: string): Promise<string> => {
    let candidate = baseSlug
    let counter = 2
    // Try up to 20 variants to avoid infinite loops
    for (let i = 0; i < 20; i++) {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('id')
        .eq('slug', candidate)
        .maybeSingle()

      if (error) {
        // If the select fails for any reason, return the current candidate and let insert surface the error
        console.warn('Slug uniqueness check failed:', error)
        return candidate
      }

      if (!data) {
        return candidate
      }

      candidate = `${baseSlug}-${counter++}`
    }

    return `${baseSlug}-${Date.now()}`
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      let slug = post?.slug || generateSlug(formData.title)
      if (!post) {
        // For new posts, ensure the slug is unique
        slug = await ensureUniqueSlug(slug)
      }
      
      // Determine status based on user role
      let status = formData.status
      if (userProfile && !isAdmin(userProfile.role) && !post) {
        // New posts by employees go to draft for approval
        status = 'draft'
      }

      const postData = {
        title: formData.title,
        excerpt: formData.excerpt,
        content: formData.content,
        slug: slug,
        category_id: formData.category_id,
        featured_image: formData.featured_image || '/blog/cybersecurity-placeholder.jpg',
        published_date: post?.publishedDate || new Date().toISOString(),
        status: status,
        author: post?.author || `${userProfile?.first_name} ${userProfile?.last_name}`,
        meta_title: formData.meta_title || formData.title,
        meta_description: formData.meta_description || formData.excerpt,
        updated_at: new Date().toISOString()
      }

      if (post) {
        // Update existing post
        const { error } = await supabase
          .from('blog_posts')
          .update(postData)
          .eq('id', post.id)

        if (error) throw error
      } else {
        // Create new post
        const { error } = await supabase
          .from('blog_posts')
          .insert({
            ...postData,
            created_at: new Date().toISOString()
          })

        if (error) throw error
      }

      onSave()
    } catch (error: any) {
      // Improve visibility into PostgREST errors
      console.error('Error saving post:', {
        message: error?.message,
        details: error?.details,
        hint: error?.hint,
        code: error?.code,
        error
      })
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  if (showPreview) {
    return (
      <div className="p-6">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-foreground">{t('blogs.preview')}</h1>
          <button
            onClick={() => setShowPreview(false)}
            className="inline-flex items-center px-4 py-2 bg-muted text-muted-foreground rounded-lg hover:bg-muted/80 transition-colors"
          >
            <X className="w-4 h-4 mr-2" />
            {t('blogs.closePreview')}
          </button>
        </div>

        <div className="bg-card border border-border rounded-lg p-8 max-w-4xl mx-auto">
          <article className="prose prose-gray dark:prose-invert max-w-none">
            <h1>{formData.title}</h1>
            <p className="lead text-muted-foreground">{formData.excerpt}</p>
            <div 
              className="prose-content"
              dangerouslySetInnerHTML={{ 
                __html: formData.content || '' 
              }}
            />
          </article>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              {post ? t('blogs.editPost') : t('blogs.createPost')}
            </h1>
            <p className="text-muted-foreground">
              {post ? t('blogs.editSubtitle') : t('blogs.createSubtitle')}
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowPreview(true)}
              className="inline-flex items-center px-4 py-2 bg-muted text-muted-foreground rounded-lg hover:bg-muted/80 transition-colors"
            >
              <Eye className="w-4 h-4 mr-2" />
              {t('blogs.preview')}
            </button>
            <button
              onClick={onCancel}
              className="inline-flex items-center px-4 py-2 bg-muted text-muted-foreground rounded-lg hover:bg-muted/80 transition-colors"
            >
              <X className="w-4 h-4 mr-2" />
              {t('common.cancel')}
            </button>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="max-w-4xl mx-auto space-y-6">
        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            {t('blogs.formTitle')} *
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => handleInputChange('title', e.target.value)}
            className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            placeholder={t('blogs.titlePlaceholder')}
            required
          />
        </div>

        {/* Excerpt */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            {t('blogs.formExcerpt')} *
          </label>
          <textarea
            value={formData.excerpt}
            onChange={(e) => handleInputChange('excerpt', e.target.value)}
            rows={3}
            className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-vertical"
            placeholder={t('blogs.excerptPlaceholder')}
            required
          />
        </div>

        {/* Category */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            {t('blogs.formCategory')} *
          </label>
          <select
            value={formData.category_id}
            onChange={(e) => handleInputChange('category_id', e.target.value)}
            className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            required
          >
            <option value="">{t('blogs.selectCategory')}</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name_es}
              </option>
            ))}
          </select>
        </div>

        {/* Content */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            {t('blogs.formContent')} *
          </label>
          <RichTextEditor
            value={formData.content}
            onChange={(value) => handleInputChange('content', value)}
            placeholder={t('blogs.contentPlaceholder')}
            className="w-full"
          />
        </div>

        {/* SEO Section */}
        <div className="border-t border-border pt-6">
          <h3 className="text-lg font-medium text-foreground mb-4">{t('blogs.seoSection')}</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                {t('blogs.metaTitle')}
              </label>
              <input
                type="text"
                value={formData.meta_title}
                onChange={(e) => handleInputChange('meta_title', e.target.value)}
                className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder={t('blogs.metaTitlePlaceholder')}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                {t('blogs.featuredImage')}
              </label>
              <input
                type="url"
                value={formData.featured_image}
                onChange={(e) => handleInputChange('featured_image', e.target.value)}
                className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder={t('blogs.imagePlaceholder')}
              />
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium text-foreground mb-2">
              {t('blogs.metaDescription')}
            </label>
            <textarea
              value={formData.meta_description}
              onChange={(e) => handleInputChange('meta_description', e.target.value)}
              rows={2}
              className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-vertical"
              placeholder={t('blogs.metaDescriptionPlaceholder')}
            />
          </div>
        </div>

        {/* Status (Admin only) */}
        {userProfile && isAdmin(userProfile.role) && (
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              {t('blogs.formStatus')}
            </label>
            <select
              value={formData.status}
              onChange={(e) => handleInputChange('status', e.target.value)}
              className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="draft">{t('blogs.statusDraft')}</option>
              <option value="published">{t('blogs.statusPublished')}</option>
            </select>
          </div>
        )}

        {/* Submit Button */}
        <div className="flex justify-end pt-6 border-t border-border">
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="w-4 h-4 mr-2" />
            {loading ? t('common.saving') : (post ? t('common.update') : t('common.create'))}
          </button>
        </div>

        {/* Employee notice */}
        {userProfile && !isAdmin(userProfile.role) && (
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              {t('blogs.employeeNotice')}
            </p>
          </div>
        )}
      </form>
    </div>
  )
}

export default BlogEditor
