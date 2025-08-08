'use client'

import { useState, useEffect } from 'react'
import { useLocale, useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Loader2, Grid3X3, Shield, Wifi, Phone, Monitor, Server, Zap } from 'lucide-react'
import { Category } from '@/lib/payload/types'

interface CategorySidebarProps {
  selectedCategoryId?: string
  onCategorySelect: (categoryId: string | null) => void
  className?: string
}

// Icon mapping for categories
const categoryIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  shield: Shield,
  network: Wifi,
  wifi: Wifi,
  phone: Phone,
  monitor: Monitor,
  server: Server,
  zap: Zap,
  grid: Grid3X3,
}

export function CategorySidebar({ 
  selectedCategoryId, 
  onCategorySelect, 
  className = '' 
}: CategorySidebarProps) {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const locale = useLocale() as 'en' | 'es'
  const t = useTranslations('catalog')

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true)
        setError(null)
        
        const response = await fetch(`/api/catalog/categories?locale=${locale}`)
        if (!response.ok) {
          throw new Error('Failed to fetch categories')
        }
        
        const data = await response.json()
        setCategories(data)
      } catch (err) {
        console.error('Error fetching categories:', err)
        setError(err instanceof Error ? err.message : 'Failed to load categories')
      } finally {
        setLoading(false)
      }
    }

    fetchCategories()
  }, [locale])

  const handleCategoryClick = (categoryId: string) => {
    if (selectedCategoryId === categoryId) {
      // Deselect if clicking the same category
      onCategorySelect(null)
    } else {
      onCategorySelect(categoryId)
    }
  }

  const handleShowAll = () => {
    onCategorySelect(null)
  }

  if (loading) {
    return (
      <Card className={`p-4 ${className}`}>
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span className="ml-2 text-sm text-muted-foreground">
            {t('loadingCategories')}
          </span>
        </div>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className={`p-4 ${className}`}>
        <div className="text-center py-8">
          <p className="text-sm text-destructive mb-2">{t('errorLoadingCategories')}</p>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => window.location.reload()}
          >
            {t('retry')}
          </Button>
        </div>
      </Card>
    )
  }

  return (
    <Card className={`p-4 ${className}`}>
      <div className="space-y-2">
        <h3 className="font-semibold text-lg mb-4">{t('categories')}</h3>
        
        {/* Show All Products Button */}
        <Button
          variant={!selectedCategoryId ? "default" : "ghost"}
          className="w-full justify-start h-auto p-3"
          onClick={handleShowAll}
        >
          <Grid3X3 className="h-4 w-4 mr-3 flex-shrink-0" />
          <span className="text-left">{t('allProducts')}</span>
        </Button>

        {/* Category List */}
        <div className="space-y-1">
          {categories.map((category) => {
            const isSelected = selectedCategoryId === category.id
            const IconComponent = categoryIcons[category.icon || 'grid'] || Grid3X3
            
            return (
              <Button
                key={category.id}
                variant={isSelected ? "default" : "ghost"}
                className="w-full justify-start h-auto p-3 text-left"
                onClick={() => handleCategoryClick(category.id)}
              >
                <IconComponent className="h-4 w-4 mr-3 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">{category.name}</div>
                  {category.description && (
                    <div className="text-xs text-muted-foreground mt-1 line-clamp-2">
                      {category.description}
                    </div>
                  )}
                </div>
              </Button>
            )
          })}
        </div>

        {categories.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <Grid3X3 className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">{t('noCategories')}</p>
          </div>
        )}
      </div>
    </Card>
  )
}