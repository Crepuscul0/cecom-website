'use client'

import { useState, useEffect, useCallback } from 'react'
import { useLocale, useTranslations } from 'next-intl'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel
} from '@/components/ui/dropdown-menu'
import { Search, Filter, X, ChevronDown, Loader2 } from 'lucide-react'
import { Vendor } from '@/lib/payload/types'
// Simple debounce utility
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

interface ProductFilterProps {
  searchQuery: string
  selectedVendor: string | null
  onSearchChange: (query: string) => void
  onVendorChange: (vendorId: string | null) => void
  onClearFilters: () => void
  className?: string
}

export function ProductFilter({
  searchQuery,
  selectedVendor,
  onSearchChange,
  onVendorChange,
  onClearFilters,
  className = ''
}: ProductFilterProps) {
  const [vendors, setVendors] = useState<Vendor[]>([])
  const [vendorsLoading, setVendorsLoading] = useState(true)
  const [vendorsError, setVendorsError] = useState<string | null>(null)
  const [localSearchQuery, setLocalSearchQuery] = useState(searchQuery)
  const locale = useLocale() as 'en' | 'es'
  const t = useTranslations('Catalog')
  const tCommon = useTranslations('Common')

  // Debounced search function
  const debouncedSearch = useCallback(
    debounce((query: string) => {
      onSearchChange(query)
    }, 300),
    [onSearchChange]
  )

  // Fetch vendors for filter dropdown
  useEffect(() => {
    const fetchVendors = async () => {
      try {
        setVendorsLoading(true)
        setVendorsError(null)
        const response = await fetch('/api/catalog/vendors')
        if (!response.ok) {
          throw new Error('Failed to fetch vendors')
        }
        const data = await response.json()
        setVendors(data)
      } catch (error) {
        console.error('Error fetching vendors:', error)
        setVendorsError(error instanceof Error ? error.message : 'Failed to load vendors')
      } finally {
        setVendorsLoading(false)
      }
    }

    fetchVendors()
  }, [])

  // Handle search input changes
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setLocalSearchQuery(value)
    debouncedSearch(value)
  }

  // Handle vendor selection
  const handleVendorSelect = (vendorId: string | null) => {
    onVendorChange(vendorId)
  }

  // Handle clear filters
  const handleClearFilters = () => {
    setLocalSearchQuery('')
    onClearFilters()
  }

  // Get selected vendor name
  const selectedVendorName = selectedVendor 
    ? vendors.find(v => v.id === selectedVendor)?.name 
    : null

  // Check if any filters are active
  const hasActiveFilters = localSearchQuery.trim() !== '' || selectedVendor !== null

  return (
    <Card className={`p-4 ${className}`}>
      <div className="space-y-4">
        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder={t('searchProducts')}
            value={localSearchQuery}
            onChange={handleSearchChange}
            className="pl-10 pr-4"
          />
        </div>

        {/* Filters Row */}
        <div className="flex flex-wrap gap-2 items-center">
          {/* Vendor Filter Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="h-9">
                <Filter className="h-4 w-4 mr-2" />
                {selectedVendorName || t('filter.filterByVendor')}
                <ChevronDown className="h-4 w-4 ml-2" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56">
              <DropdownMenuLabel>{t('filter.filterByVendor')}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              
              {vendorsLoading ? (
                <DropdownMenuItem disabled>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {t('states.loading')}
                </DropdownMenuItem>
              ) : vendorsError ? (
                <DropdownMenuItem disabled>
                  <span className="text-destructive text-sm">
                    {tCommon('states.errorLoadingVendors')}
                  </span>
                </DropdownMenuItem>
              ) : (
                <>
                  <DropdownMenuItem onClick={() => handleVendorSelect(null)}>
                    <span className={selectedVendor === null ? 'font-medium' : ''}>
                      {t('filter.allVendors')}
                    </span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  {vendors.map((vendor) => (
                    <DropdownMenuItem 
                      key={vendor.id}
                      onClick={() => handleVendorSelect(vendor.id)}
                    >
                      <span className={selectedVendor === vendor.id ? 'font-medium' : ''}>
                        {vendor.name}
                      </span>
                    </DropdownMenuItem>
                  ))}
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Clear Filters Button */}
          {hasActiveFilters && (
            <Button 
              variant="ghost" 
              size="sm"
              onClick={handleClearFilters}
              className="h-9"
            >
              <X className="h-4 w-4 mr-2" />
              {t('filter.clearFilters')}
            </Button>
          )}
        </div>

        {/* Active Filters Display */}
        {hasActiveFilters && (
          <div className="flex flex-wrap gap-2">
            {localSearchQuery.trim() !== '' && (
              <div className="flex items-center gap-1 bg-primary/10 text-primary px-2 py-1 rounded-md text-sm">
                <Search className="h-3 w-3" />
                <span>&quot;{localSearchQuery}&quot;</span>
                <button
                  onClick={() => {
                    setLocalSearchQuery('')
                    onSearchChange('')
                  }}
                  className="ml-1 hover:bg-primary/20 rounded-full p-0.5"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            )}
            
            {selectedVendorName && (
              <div className="flex items-center gap-1 bg-primary/10 text-primary px-2 py-1 rounded-md text-sm">
                <Filter className="h-3 w-3" />
                <span>{selectedVendorName}</span>
                <button
                  onClick={() => handleVendorSelect(null)}
                  className="ml-1 hover:bg-primary/20 rounded-full p-0.5"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </Card>
  )
}