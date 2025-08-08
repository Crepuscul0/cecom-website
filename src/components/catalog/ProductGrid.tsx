'use client'

import { useState, useEffect } from 'react'
import { useLocale, useTranslations } from 'next-intl'
import { ProductCard } from './ProductCard'
import { Loader2, Package } from 'lucide-react'
import { Product } from '@/lib/payload/types'

interface ProductGridProps {
  categoryId?: string | null
  searchQuery?: string
  vendorFilter?: string
  onProductSelect: (product: Product) => void
  onProductsLoad?: (products: Product[]) => void
  className?: string
}

export function ProductGrid({ 
  categoryId, 
  searchQuery, 
  vendorFilter, 
  onProductSelect, 
  onProductsLoad,
  className = '' 
}: ProductGridProps) {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const locale = useLocale() as 'en' | 'es'
  const t = useTranslations('catalog')

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true)
        setError(null)
        
        // Build query parameters
        const params = new URLSearchParams({
          locale,
        })
        
        if (categoryId) {
          params.append('categoryId', categoryId)
        }
        
        if (searchQuery) {
          params.append('search', searchQuery)
        }
        
        if (vendorFilter) {
          params.append('vendorId', vendorFilter)
        }
        
        const response = await fetch(`/api/catalog/products?${params.toString()}`)
        if (!response.ok) {
          throw new Error('Failed to fetch products')
        }
        
        const data = await response.json()
        setProducts(data)
        
        // Notify parent component of loaded products for modal navigation
        if (onProductsLoad) {
          onProductsLoad(data)
        }
      } catch (err) {
        console.error('Error fetching products:', err)
        setError(err instanceof Error ? err.message : 'Failed to load products')
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [locale, categoryId, searchQuery, vendorFilter])

  if (loading) {
    return (
      <div className={`flex items-center justify-center py-12 ${className}`}>
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">{t('loadingProducts')}</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className={`text-center py-12 ${className}`}>
        <div className="max-w-md mx-auto">
          <Package className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
          <h3 className="text-lg font-semibold mb-2">{t('error')}</h3>
          <p className="text-muted-foreground mb-4">{t('errorLoadingProducts')}</p>
          <button 
            onClick={() => window.location.reload()}
            className="text-primary hover:underline"
          >
            {t('retry')}
          </button>
        </div>
      </div>
    )
  }

  if (products.length === 0) {
    const emptyMessage = categoryId 
      ? t('noProductsInCategory') 
      : searchQuery || vendorFilter 
        ? t('noProducts')
        : t('noProducts')

    return (
      <div className={`text-center py-12 ${className}`}>
        <div className="max-w-md mx-auto">
          <Package className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
          <h3 className="text-lg font-semibold mb-2">{emptyMessage}</h3>
          <p className="text-muted-foreground">
            {searchQuery || vendorFilter ? (
              <span>
                Try adjusting your search or filters to find what you&apos;re looking for.
              </span>
            ) : (
              <span>
                No products are currently available in this section.
              </span>
            )}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className={className}>
      {/* Results count */}
      <div className="mb-6">
        <p className="text-sm text-muted-foreground">
          {t('showingResults', { count: products.length })}
        </p>
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            onViewDetails={onProductSelect}
          />
        ))}
      </div>
    </div>
  )
}