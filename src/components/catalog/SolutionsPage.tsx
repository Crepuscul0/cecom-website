'use client'

import { useState, useEffect } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { Product } from '@/lib/payload/types'
import { ProductFilter } from './ProductFilter'
import { ProductGrid } from './ProductGrid'
import { ProductModal } from './ProductModal'

interface SolutionsPageProps {
  initialProducts: Product[]
  initialHasMore: boolean
  searchParams: {
    category?: string
    search?: string
    vendor?: string
    page?: string
  }
}

export function SolutionsPage({ initialProducts, initialHasMore, searchParams }: SolutionsPageProps) {
  const [products, setProducts] = useState<Product[]>(initialProducts)
  const [hasMore, setHasMore] = useState<boolean>(initialHasMore)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const router = useRouter()
  const pathname = usePathname()

  // Update URL when filters change
  const handleFilterChange = (newParams: Record<string, string | null>) => {
    const params = new URLSearchParams(window.location.search)
    Object.entries(newParams).forEach(([key, value]) => {
      if (value) {
        params.set(key, value)
      } else {
        params.delete(key)
      }
    })
    params.delete('page') // Reset page on filter change
    router.replace(`${pathname}?${params.toString()}`, { scroll: false })
  }

  const handleClearFilters = () => {
    router.replace(pathname, { scroll: false })
  }

  const handleProductSelect = (product: Product) => {
    setSelectedProduct(product)
    setIsModalOpen(true)
  }

  const handleModalClose = () => {
    setIsModalOpen(false)
    setSelectedProduct(null)
  }

  const handleProductNavigate = (direction: 'prev' | 'next') => {
    if (!selectedProduct || products.length === 0) return

    const currentIndex = products.findIndex(p => p.id === selectedProduct.id)
    if (currentIndex === -1) return

    let newIndex: number;
    if (direction === 'prev') {
      newIndex = currentIndex > 0 ? currentIndex - 1 : products.length - 1
    } else {
      newIndex = currentIndex < products.length - 1 ? currentIndex + 1 : 0
    }

    setSelectedProduct(products[newIndex])
  }

  const getNavigationCapabilities = () => {
    if (!selectedProduct || products.length <= 1) {
      return { prev: false, next: false }
    }
    return { prev: true, next: true }
  }

  return (
    <>
      <ProductFilter
        searchQuery={searchParams.search || ''}
        selectedVendor={searchParams.vendor || null}
        onSearchChange={(query) => handleFilterChange({ search: query })}
        onVendorChange={(vendorId) => handleFilterChange({ vendor: vendorId })}
        onClearFilters={handleClearFilters}
      />

      <div className="flex-1 min-h-0">
        <ProductGrid
          categoryId={searchParams.category}
          searchQuery={searchParams.search}
          vendorFilter={searchParams.vendor}
          onProductSelect={handleProductSelect}
        />
      </div>

      <ProductModal
        product={selectedProduct}
        isOpen={isModalOpen}
        onClose={handleModalClose}
        onNavigate={handleProductNavigate}
        canNavigate={getNavigationCapabilities()}
      />
    </>
  )
}
