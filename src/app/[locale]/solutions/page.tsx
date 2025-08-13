"use client";

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import { CategorySidebar } from '@/components/catalog/CategorySidebar'
import { ProductGrid } from '@/components/catalog/ProductGrid'
import { ProductFilter } from '@/components/catalog/ProductFilter'
import { ProductModal } from '@/components/catalog/ProductModal'
import { Product } from '@/lib/payload/types'
import { Suspense } from 'react'

// Loading component for the catalog
function CatalogLoading() {
  return (
    <div className="bg-background min-h-screen flex flex-col">
      <div className="flex-1 px-4 lg:px-6 py-4">
        <div className="max-w-7xl mx-auto h-full flex flex-col">
          <div className="mb-4">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="h-8 bg-muted rounded animate-pulse mb-2"></div>
                <div className="h-4 bg-muted rounded animate-pulse w-2/3"></div>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 flex-1">
            <div className="lg:col-span-1">
              <div className="h-96 bg-muted rounded animate-pulse"></div>
            </div>
            <div className="lg:col-span-3 flex flex-col space-y-4">
              <div className="h-16 bg-muted rounded animate-pulse"></div>
              <div className="flex-1 min-h-0 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="h-72 bg-muted rounded animate-pulse"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Main catalog component
function CatalogContent() {
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedVendor, setSelectedVendor] = useState<string | null>(null)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [allProducts, setAllProducts] = useState<Product[]>([])
  
  const t = useTranslations('Solutions')
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()

  // Initialize state from URL parameters
  useEffect(() => {
    const categoryParam = searchParams.get('category')
    const searchParam = searchParams.get('search')
    const vendorParam = searchParams.get('vendor')

    if (categoryParam) setSelectedCategoryId(categoryParam)
    if (searchParam) setSearchQuery(searchParam)
    if (vendorParam) setSelectedVendor(vendorParam)
  }, [searchParams])

  // Update URL when filters change
  const updateURL = (category: string | null, search: string, vendor: string | null) => {
    const params = new URLSearchParams()
    
    if (category) params.set('category', category)
    if (search.trim()) params.set('search', search.trim())
    if (vendor) params.set('vendor', vendor)
    
    const queryString = params.toString()
    const newURL = queryString ? `${pathname}?${queryString}` : pathname
    
    router.replace(newURL, { scroll: false })
  }

  // Handle category selection
  const handleCategorySelect = (categoryId: string | null) => {
    setSelectedCategoryId(categoryId)
    updateURL(categoryId, searchQuery, selectedVendor)
  }

  // Handle search change
  const handleSearchChange = (query: string) => {
    setSearchQuery(query)
    updateURL(selectedCategoryId, query, selectedVendor)
  }

  // Handle vendor filter change
  const handleVendorChange = (vendorId: string | null) => {
    setSelectedVendor(vendorId)
    updateURL(selectedCategoryId, searchQuery, vendorId)
  }

  // Handle clear filters
  const handleClearFilters = () => {
    setSearchQuery('')
    setSelectedVendor(null)
    setSelectedCategoryId(null)
    router.replace(pathname, { scroll: false })
  }

  // Handle product selection for modal
  const handleProductSelect = (product: Product) => {
    setSelectedProduct(product)
    setIsModalOpen(true)
  }

  // Handle modal close
  const handleModalClose = () => {
    setIsModalOpen(false)
    setSelectedProduct(null)
  }

  // Handle product navigation in modal
  const handleProductNavigate = (direction: 'prev' | 'next') => {
    if (!selectedProduct || allProducts.length === 0) return

    const currentIndex = allProducts.findIndex(p => p.id === selectedProduct.id)
    if (currentIndex === -1) return

    let newIndex: number
    if (direction === 'prev') {
      newIndex = currentIndex > 0 ? currentIndex - 1 : allProducts.length - 1
    } else {
      newIndex = currentIndex < allProducts.length - 1 ? currentIndex + 1 : 0
    }

    setSelectedProduct(allProducts[newIndex])
  }

  // Get navigation capabilities for modal
  const getNavigationCapabilities = () => {
    if (!selectedProduct || allProducts.length <= 1) {
      return { prev: false, next: false }
    }
    return { prev: true, next: true }
  }

  return (
    <div className="bg-background min-h-screen flex flex-col">
      <div className="flex-1 px-4 lg:px-6 py-4">
        <div className="max-w-7xl mx-auto h-full flex flex-col">
          {/* Header Section - Compact */}
          <div className="mb-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-foreground">
                  {t('ourSolutions')}
                </h1>
                <p className="text-sm text-muted-foreground mt-1">
                  {t('businessNeeds')}
                </p>
              </div>
            </div>
          </div>

          {/* Catalog Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 flex-1">
            {/* Sidebar - Categories */}
            <div className="lg:col-span-1">
              <div className="sticky top-4 h-fit">
                <CategorySidebar
                  selectedCategoryId={selectedCategoryId || undefined}
                  onCategorySelect={handleCategorySelect}
                  className="mb-4"
                />
              </div>
            </div>

            {/* Main Content - Filters and Products */}
            <div className="lg:col-span-3 flex flex-col space-y-4">
              {/* Product Filter */}
              <ProductFilter
                searchQuery={searchQuery}
                selectedVendor={selectedVendor}
                onSearchChange={handleSearchChange}
                onVendorChange={handleVendorChange}
                onClearFilters={handleClearFilters}
              />

              {/* Product Grid */}
              <div className="flex-1 min-h-0">
                <ProductGrid
                  categoryId={selectedCategoryId}
                  searchQuery={searchQuery}
                  vendorFilter={selectedVendor || undefined}
                  onProductSelect={handleProductSelect}
                  onProductsLoad={setAllProducts}
                />
              </div>
            </div>
          </div>

          {/* Product Modal */}
          <ProductModal
            product={selectedProduct}
            isOpen={isModalOpen}
            onClose={handleModalClose}
            onNavigate={handleProductNavigate}
            canNavigate={getNavigationCapabilities()}
          />
        </div>
      </div>
    </div>
  )
}

// Error boundary component
function CatalogError() {
  const t = useTranslations('Catalog')
  
  return (
    <div className="bg-background min-h-screen flex flex-col">
      <div className="flex-1 px-4 lg:px-6 py-4 flex items-center justify-center">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-foreground mb-4">
            {t('states.error')}
          </h2>
          <p className="text-muted-foreground mb-6">
            Something went wrong while loading the catalog. Please try again.
          </p>
          <button 
            onClick={() => window.location.reload()}
            className="bg-primary text-primary-foreground px-6 py-2 rounded-md hover:bg-primary/90 transition-colors"
          >
            {t('actions.retry')}
          </button>
        </div>
      </div>
    </div>
  )
}

// Main Solutions page component
export default function Solutions() {
  return (
    <Suspense fallback={<CatalogLoading />}>
      <CatalogContent />
    </Suspense>
  )
}