"use client"

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { Plus, Edit, Trash2, Eye, Check, X, Search } from 'lucide-react'
import { supabase, getUserProfile, UserProfile, isAdmin } from '@/lib/supabase'
import { BlogPost } from '@/types/blog'
import { getBlogPosts, getBlogCategories } from '@/lib/supabase-blog'
import BlogEditor from './BlogEditor'
import ConfirmDialog from './ConfirmDialog'

export function BlogManagement() {
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [showEditor, setShowEditor] = useState(false)
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft' | 'pending'>('all')
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean
    title: string
    message: string
    onConfirm: () => void
    type: 'delete' | 'approve' | 'reject'
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
    type: 'delete'
  })

  const t = useTranslations('AdminPanel')

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      
      // Get user profile
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const profile = await getUserProfile(user.id)
        setUserProfile(profile)
      }

      // Load posts and categories
      const [postsData, categoriesData] = await Promise.all([
        getBlogPosts({ limit: 100 }),
        getBlogCategories()
      ])

      setPosts(postsData)
      setCategories(categoriesData)
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreatePost = () => {
    setEditingPost(null)
    setShowEditor(true)
  }

  const handleEditPost = (post: BlogPost) => {
    setEditingPost(post)
    setShowEditor(true)
  }

  const handleDeletePost = (post: BlogPost) => {
    setConfirmDialog({
      isOpen: true,
      title: t('blogs.deleteTitle'),
      message: t('blogs.deleteMessage', { title: post.title }),
      type: 'delete',
      onConfirm: async () => {
        try {
          const { error } = await supabase
            .from('blog_posts')
            .delete()
            .eq('id', post.id)

          if (error) throw error

          await loadData()
          setConfirmDialog({ ...confirmDialog, isOpen: false })
        } catch (error) {
          console.error('Error deleting post:', error)
        }
      }
    })
  }

  const handleApprovePost = (post: BlogPost) => {
    setConfirmDialog({
      isOpen: true,
      title: t('blogs.approveTitle'),
      message: t('blogs.approveMessage', { title: post.title }),
      type: 'approve',
      onConfirm: async () => {
        try {
          const { error } = await supabase
            .from('blog_posts')
            .update({ status: 'published' })
            .eq('id', post.id)

          if (error) throw error

          await loadData()
          setConfirmDialog({ ...confirmDialog, isOpen: false })
        } catch (error) {
          console.error('Error approving post:', error)
        }
      }
    })
  }

  const handleRejectPost = (post: BlogPost) => {
    setConfirmDialog({
      isOpen: true,
      title: t('blogs.rejectTitle'),
      message: t('blogs.rejectMessage', { title: post.title }),
      type: 'reject',
      onConfirm: async () => {
        try {
          const { error } = await supabase
            .from('blog_posts')
            .update({ status: 'draft' })
            .eq('id', post.id)

          if (error) throw error

          await loadData()
          setConfirmDialog({ ...confirmDialog, isOpen: false })
        } catch (error) {
          console.error('Error rejecting post:', error)
        }
      }
    })
  }

  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.excerpt.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'pending' && post.status === 'draft') ||
                         post.status === statusFilter

    return matchesSearch && matchesStatus
  })

  const getStatusBadge = (status: string) => {
    const styles = {
      published: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      draft: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      pending: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
    }

    const labels = {
      published: t('blogs.statusPublished'),
      draft: t('blogs.statusDraft'),
      pending: t('blogs.statusPending')
    }

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[status as keyof typeof styles] || styles.draft}`}>
        {labels[status as keyof typeof labels] || status}
      </span>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (showEditor) {
    return (
      <BlogEditor
        post={editingPost}
        categories={categories}
        userProfile={userProfile}
        onSave={async () => {
          await loadData()
          setShowEditor(false)
        }}
        onCancel={() => setShowEditor(false)}
      />
    )
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">{t('blogs.title')}</h1>
            <p className="text-muted-foreground">{t('blogs.subtitle')}</p>
          </div>
          <button
            onClick={handleCreatePost}
            className="inline-flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            {t('blogs.createPost')}
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mt-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder={t('blogs.searchPlaceholder')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          >
            <option value="all">{t('blogs.filterAll')}</option>
            <option value="published">{t('blogs.statusPublished')}</option>
            <option value="draft">{t('blogs.statusDraft')}</option>
            <option value="pending">{t('blogs.statusPending')}</option>
          </select>
        </div>
      </div>

      {/* Posts Table */}
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  {t('blogs.tableTitle')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  {t('blogs.tableStatus')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  {t('blogs.tableAuthor')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  {t('blogs.tableDate')}
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  {t('blogs.tableActions')}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredPosts.map((post) => (
                <tr key={post.id} className="hover:bg-muted/25">
                  <td className="px-6 py-4">
                    <div>
                      <div className="text-sm font-medium text-foreground line-clamp-1">
                        {post.title}
                      </div>
                      <div className="text-sm text-muted-foreground line-clamp-2 mt-1">
                        {post.excerpt}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {getStatusBadge(post.status)}
                  </td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">
                    {post.author}
                  </td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">
                    {new Date(post.publishedDate).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {/* View button */}
                      <button
                        onClick={() => window.open(`/es/blog/${post.slug}`, '_blank')}
                        className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
                        title={t('blogs.viewPost')}
                      >
                        <Eye className="w-4 h-4" />
                      </button>

                      {/* Edit button */}
                      <button
                        onClick={() => handleEditPost(post)}
                        className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
                        title={t('blogs.editPostButton')}
                      >
                        <Edit className="w-4 h-4" />
                      </button>

                      {/* Admin-only actions */}
                      {userProfile && isAdmin(userProfile.role) && (
                        <>
                          {/* Approve/Reject buttons for draft posts */}
                          {post.status === 'draft' && (
                            <>
                              <button
                                onClick={() => handleApprovePost(post)}
                                className="p-2 text-green-600 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors"
                                title={t('blogs.approvePost')}
                              >
                                <Check className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleRejectPost(post)}
                                className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                title={t('blogs.rejectPost')}
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </>
                          )}

                          {/* Delete button */}
                          <button
                            onClick={() => handleDeletePost(post)}
                            className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                            title={t('blogs.deletePost')}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredPosts.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">{t('blogs.noPosts')}</p>
          </div>
        )}
      </div>

      {/* Confirmation Dialog */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title={confirmDialog.title}
        message={confirmDialog.message}
        type={confirmDialog.type}
        onConfirm={confirmDialog.onConfirm}
        onCancel={() => setConfirmDialog({ ...confirmDialog, isOpen: false })}
      />
    </div>
  )
}
