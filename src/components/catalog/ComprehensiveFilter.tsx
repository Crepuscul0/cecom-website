'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { useLocale, useTranslations } from 'next-intl'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel
} from '@/components/ui/dropdown-menu'
import { Search, Filter, X, ChevronDown, Grid3X3, Check } from 'lucide-react'
import { Vendor, Category } from '@/lib/payload/types'
import { cn } from '@/lib/utils'

// Debounce utility
function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout
  return (...args: Parameters<T>) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

interface ComprehensiveFilterProps {
  searchQuery: string
  selectedVendor: string | null
  selectedCategoryId: string | null
  onSearchChange: (query: string) => void
  onVendorChange: (vendorId: string | null) => void
  onCategoryChange: (categoryId: string | null) => void
  onClearFilters: () => void
  className?: string
}

export function ComprehensiveFilter({
  searchQuery,
  selectedVendor,
  selectedCategoryId,
  onSearchChange,
  onVendorChange,
  onCategoryChange,
  onClearFilters,
  className = ''
}: ComprehensiveFilterProps) {
  const [vendors, setVendors] = useState<Vendor[]>([])
  const [allCategories, setAllCategories] = useState<Category[]>([])
  const [availableCategories, setAvailableCategories] = useState<Category[]>([])
  const [dataLoading, setDataLoading] = useState(true)
  const [dataError, setDataError] = useState<string | null>(null)
  const [localSearchQuery, setLocalSearchQuery] = useState(searchQuery)
  const [vendorSearchQuery, setVendorSearchQuery] = useState('')
  const [categorySearchQuery, setCategorySearchQuery] = useState('')
  const locale = useLocale() as 'en' | 'es'
  const t = useTranslations('Catalog')

  // Fetch vendors and all categories
  useEffect(() => {
    const fetchData = async () => {
      try {
        setDataLoading(true)
        setDataError(null)
        const [vendorsRes, categoriesRes] = await Promise.all([
          fetch('/api/catalog/vendors'),
          fetch(`/api/catalog/categories?locale=${locale}`)
        ])

        if (!vendorsRes.ok) throw new Error('Failed to fetch vendors')
        if (!categoriesRes.ok) throw new Error('Failed to fetch categories')

        const vendorsData = await vendorsRes.json()
        const categoriesData = await categoriesRes.json()

        setVendors(vendorsData)
        setAllCategories(categoriesData)
        setAvailableCategories(categoriesData)
      } catch (error) {
        console.error('Error fetching filter data:', error)
        setDataError(error instanceof Error ? error.message : 'Failed to load data')
      } finally {
        setDataLoading(false)
      }
    }

    fetchData()
  }, [locale])

  // Fetch available categories when vendor changes
  useEffect(() => {
    const fetchAvailableCategories = async () => {
      if (!selectedVendor) {
        setAvailableCategories(allCategories)
        return
      }

      try {
        const response = await fetch(`/api/catalog/categories?locale=${locale}&vendorId=${selectedVendor}`)
        if (!response.ok) throw new Error('Failed to fetch categories')
        
        const categoriesData = await response.json()
        setAvailableCategories(categoriesData)
        
        // Clear selected category if it's not in the new available categories
        if (selectedCategoryId && !categoriesData.find((c: Category) => c.id === selectedCategoryId)) {
          onCategoryChange(null)
        }
      } catch (error) {
        console.error('Error fetching available categories:', error)
        setAvailableCategories(allCategories)
      }
    }

    fetchAvailableCategories()
  }, [selectedVendor, allCategories, locale, selectedCategoryId, onCategoryChange])

  const debouncedSearch = useMemo(
    () =>
      debounce((query: string) => {
        onSearchChange(query)
      }, 300),
    [onSearchChange]
  )

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setLocalSearchQuery(value)
    debouncedSearch(value)
  }

  const hasActiveFilters = localSearchQuery.trim() !== '' || selectedVendor !== null || selectedCategoryId !== null

  const selectedVendorName = selectedVendor ? vendors.find(v => v.id === selectedVendor)?.name : null
  const selectedCategoryName = selectedCategoryId ? availableCategories.find(c => c.id === selectedCategoryId)?.name : null

  // Filter vendors and categories based on search
  const filteredVendors = vendors.filter(v => 
    v.name?.toLowerCase().includes(vendorSearchQuery.toLowerCase())
  )
  const filteredCategories = availableCategories.filter(c => 
    c.name?.toLowerCase().includes(categorySearchQuery.toLowerCase())
  )

  return (
    <div className={cn('p-4 bg-card rounded-lg border', className)}>
      <div className="grid gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder={t('searchProducts')}
            value={localSearchQuery}
            onChange={handleSearchChange}
            className="pl-10"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {/* Vendor Filter */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="flex-1 md:flex-none justify-start text-left font-normal">
                <Filter className="mr-2 h-4 w-4" />
                {selectedVendorName || t('filter.filterByVendor')}
                <ChevronDown className="ml-2 h-4 w-4 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-[250px] max-h-[400px] overflow-y-auto">
              <DropdownMenuLabel>
                <Input
                  placeholder={t('filter.findVendor')}
                  value={vendorSearchQuery}
                  onChange={(e) => setVendorSearchQuery(e.target.value)}
                  className="h-8"
                  onClick={(e) => e.stopPropagation()}
                />
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => onVendorChange(null)}>
                <Check className={cn('mr-2 h-4 w-4', !selectedVendor ? 'opacity-100' : 'opacity-0')} />
                {t('filter.allVendors')}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {filteredVendors.length === 0 ? (
                <DropdownMenuItem disabled>
                  <span className="text-muted-foreground text-sm">{t('states.noResults')}</span>
                </DropdownMenuItem>
              ) : (
                filteredVendors.map((vendor) => (
                  <DropdownMenuItem key={vendor.id} onClick={() => onVendorChange(vendor.id)}>
                    <Check className={cn('mr-2 h-4 w-4', selectedVendor === vendor.id ? 'opacity-100' : 'opacity-0')} />
                    {vendor.name}
                  </DropdownMenuItem>
                ))
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Category Filter */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="flex-1 md:flex-none justify-start text-left font-normal">
                <Grid3X3 className="mr-2 h-4 w-4" />
                {selectedCategoryName || t('categories')}
                <ChevronDown className="ml-2 h-4 w-4 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-[250px] max-h-[400px] overflow-y-auto">
              <DropdownMenuLabel>
                <Input
                  placeholder={t('filter.findCategory')}
                  value={categorySearchQuery}
                  onChange={(e) => setCategorySearchQuery(e.target.value)}
                  className="h-8"
                  onClick={(e) => e.stopPropagation()}
                />
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => onCategoryChange(null)}>
                <Check className={cn('mr-2 h-4 w-4', !selectedCategoryId ? 'opacity-100' : 'opacity-0')} />
                {t('allCategories')}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {filteredCategories.length === 0 ? (
                <DropdownMenuItem disabled>
                  <span className="text-muted-foreground text-sm">{t('states.noResults')}</span>
                </DropdownMenuItem>
              ) : (
                filteredCategories.map((category) => (
                  <DropdownMenuItem key={category.id} onClick={() => onCategoryChange(category.id)}>
                    <Check className={cn('mr-2 h-4 w-4', selectedCategoryId === category.id ? 'opacity-100' : 'opacity-0')} />
                    {category.name}
                  </DropdownMenuItem>
                ))
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          {hasActiveFilters && (
            <Button variant="ghost" onClick={onClearFilters}>
              <X className="mr-2 h-4 w-4" />
              {t('filter.clearFilters')}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
