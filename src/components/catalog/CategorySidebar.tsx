'use client'

import { useState, useEffect, useRef } from 'react'
import { useLocale, useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Loader2, Grid3X3, Shield, Wifi, Phone, Monitor, Server, Zap, Lock, Network, Router, Cable, Bluetooth, Smartphone, Headphones, Radio, Laptop, Tablet, Cpu, MemoryStick, Database, HardDrive, Cloud, Printer, Camera, Keyboard, Mouse, Usb, Tv, Gamepad2, Watch } from 'lucide-react'
import { Category } from '@/lib/payload/types'
import styles from './CategorySidebar.module.css'

interface CategorySidebarProps {
  selectedCategoryId?: string
  onCategorySelect: (categoryId: string | null) => void
  className?: string
}

// Icon mapping for categories - matches IconPicker
const categoryIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  // Security & Protection
  shield: Shield,
  lock: Lock,
  
  // Networking
  wifi: Wifi,
  network: Network,
  router: Router,
  cable: Cable,
  bluetooth: Bluetooth,
  
  // Communication
  phone: Phone,
  smartphone: Smartphone,
  headphones: Headphones,
  radio: Radio,
  
  // Computing
  monitor: Monitor,
  laptop: Laptop,
  tablet: Tablet,
  cpu: Cpu,
  memory: MemoryStick,
  
  // Storage & Servers
  server: Server,
  database: Database,
  harddrive: HardDrive,
  cloud: Cloud,
  
  // Peripherals
  printer: Printer,
  camera: Camera,
  keyboard: Keyboard,
  mouse: Mouse,
  usb: Usb,
  
  // Entertainment
  tv: Tv,
  gamepad: Gamepad2,
  watch: Watch,
  
  // General
  zap: Zap,
  grid: Grid3X3,
}

interface CategoryItemProps {
  category: Category
  selectedCategoryId?: string
  onCategoryClick: (categoryId: string) => void
  level: number
}

function CategoryItem({ category, selectedCategoryId, onCategoryClick, level }: CategoryItemProps) {
  const [isExpanded, setIsExpanded] = useState(true)
  const isSelected = selectedCategoryId === category.id
  const hasChildren = category.children && category.children.length > 0
  const IconComponent = categoryIcons[category.icon || 'grid'] || Grid3X3
  
  const paddingLeft = level * 16 // 16px per level for better spacing
  
  const handleToggleExpand = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsExpanded(!isExpanded)
  }
  
  return (
    <div>
      <div 
        className={`
          w-full flex items-center p-3 rounded-md cursor-pointer transition-colors
          ${isSelected 
            ? 'bg-primary text-primary-foreground' 
            : 'hover:bg-accent hover:text-accent-foreground'
          }
        `}
        style={{ paddingLeft: `${12 + paddingLeft}px` }}
        onClick={() => onCategoryClick(category.id)}
      >
        {hasChildren && (
          <div
            onClick={handleToggleExpand}
            className="mr-2 p-1 rounded-sm hover:bg-black/10 hover:dark:bg-white/10 transition-colors"
          >
            <div 
              className={`
                w-0 h-0 transition-transform duration-200 ease-in-out
                ${isExpanded ? 'rotate-90' : 'rotate-0'}
              `}
              style={{
                borderLeft: '4px solid currentColor',
                borderTop: '3px solid transparent',
                borderBottom: '3px solid transparent',
              }}
            />
          </div>
        )}
        <IconComponent className="h-4 w-4 mr-3 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <div className="font-medium truncate">{category.name}</div>
          {category.description && level === 0 && (
            <div className="text-xs opacity-70 mt-1 line-clamp-2">
              {category.description}
            </div>
          )}
        </div>
      </div>
      
      {hasChildren && isExpanded && (
        <div className="mt-1 space-y-1">
          {category.children!.map((child) => (
            <CategoryItem
              key={child.id}
              category={child}
              selectedCategoryId={selectedCategoryId}
              onCategoryClick={onCategoryClick}
              level={level + 1}
            />
          ))}
        </div>
      )}
    </div>
  )
}

// Mobile Category Chips Component
function MobileCategoryChips({ 
  categories, 
  selectedCategoryId, 
  onCategorySelect, 
  t 
}: {
  categories: Category[]
  selectedCategoryId?: string
  onCategorySelect: (categoryId: string | null) => void
  t: any
}) {
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)
  const [isScrolling, setIsScrolling] = useState(false)
  const [isTouchDevice, setIsTouchDevice] = useState(false)
  
  // Flatten categories for mobile view (show all categories and subcategories as chips)
  const flatCategories: Category[] = []
  
  const flattenCategories = (cats: Category[]) => {
    cats.forEach(cat => {
      flatCategories.push(cat)
      if (cat.children && cat.children.length > 0) {
        flattenCategories(cat.children)
      }
    })
  }
  
  flattenCategories(categories)

  // Check scroll position and update button states
  const checkScrollButtons = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current
      setCanScrollLeft(scrollLeft > 5) // Small threshold to avoid flickering
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 5)
    }
  }

  // Scroll functions with improved UX
  const scrollLeft = () => {
    if (scrollContainerRef.current && !isScrolling) {
      setIsScrolling(true)
      const scrollAmount = Math.min(250, scrollContainerRef.current.clientWidth * 0.8)
      scrollContainerRef.current.scrollBy({ left: -scrollAmount, behavior: 'smooth' })
      setTimeout(() => setIsScrolling(false), 300)
    }
  }

  const scrollRight = () => {
    if (scrollContainerRef.current && !isScrolling) {
      setIsScrolling(true)
      const scrollAmount = Math.min(250, scrollContainerRef.current.clientWidth * 0.8)
      scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' })
      setTimeout(() => setIsScrolling(false), 300)
    }
  }

  // Auto-scroll to selected item with improved centering
  const scrollToSelected = (categoryId: string) => {
    if (scrollContainerRef.current) {
      const selectedButton = scrollContainerRef.current.querySelector(`[data-category-id="${categoryId}"]`) as HTMLElement
      if (selectedButton) {
        const container = scrollContainerRef.current
        const buttonRect = selectedButton.getBoundingClientRect()
        const containerRect = container.getBoundingClientRect()
        
        // Calculate the position to center the button
        const buttonCenter = selectedButton.offsetLeft + selectedButton.offsetWidth / 2
        const containerCenter = container.clientWidth / 2
        const scrollPosition = buttonCenter - containerCenter
        
        container.scrollTo({ 
          left: Math.max(0, scrollPosition), 
          behavior: 'smooth' 
        })
      }
    }
  }

  // Handle category selection with auto-scroll and haptic feedback
  const handleCategorySelect = (categoryId: string | null) => {
    // Add haptic feedback on touch devices
    if (isTouchDevice && 'vibrate' in navigator) {
      navigator.vibrate(10)
    }
    
    onCategorySelect(categoryId)
    if (categoryId) {
      // Delay to ensure DOM is updated
      requestAnimationFrame(() => {
        setTimeout(() => scrollToSelected(categoryId), 50)
      })
    }
  }

  useEffect(() => {
    // Detect touch device
    setIsTouchDevice('ontouchstart' in window || navigator.maxTouchPoints > 0)
    
    checkScrollButtons()
    const container = scrollContainerRef.current
    if (container) {
      // Throttled scroll handler for better performance
      let scrollTimeout: NodeJS.Timeout
      const handleScroll = () => {
        clearTimeout(scrollTimeout)
        scrollTimeout = setTimeout(checkScrollButtons, 10)
      }
      
      container.addEventListener('scroll', handleScroll, { passive: true })
      
      // Also check on resize
      const handleResize = () => {
        setTimeout(checkScrollButtons, 100)
      }
      window.addEventListener('resize', handleResize)
      
      return () => {
        container.removeEventListener('scroll', handleScroll)
        window.removeEventListener('resize', handleResize)
        clearTimeout(scrollTimeout)
      }
    }
  }, [flatCategories])

  // Auto-scroll to selected category on mount
  useEffect(() => {
    if (selectedCategoryId && flatCategories.length > 0) {
      setTimeout(() => scrollToSelected(selectedCategoryId), 200)
    }
  }, [selectedCategoryId, flatCategories.length])

  return (
    <div className="w-full relative">
      {/* Left scroll button */}
      {canScrollLeft && (
        <button
          onClick={scrollLeft}
          disabled={isScrolling}
          className={`
            absolute left-0 top-1/2 -translate-y-1/2 z-20 
            bg-background/90 backdrop-blur-md border border-border/50 
            rounded-full p-2.5 shadow-lg transition-all duration-200
            hover:bg-accent hover:scale-110 active:scale-95
            disabled:opacity-50 disabled:cursor-not-allowed
            ${styles.scrollButton}
            ${isScrolling ? 'animate-pulse' : ''}
          `}
          aria-label="Scroll left"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      )}

      {/* Right scroll button */}
      {canScrollRight && (
        <button
          onClick={scrollRight}
          disabled={isScrolling}
          className={`
            absolute right-0 top-1/2 -translate-y-1/2 z-20 
            bg-background/90 backdrop-blur-md border border-border/50 
            rounded-full p-2.5 shadow-lg transition-all duration-200
            hover:bg-accent hover:scale-110 active:scale-95
            disabled:opacity-50 disabled:cursor-not-allowed
            ${styles.scrollButton}
            ${isScrolling ? 'animate-pulse' : ''}
          `}
          aria-label="Scroll right"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      )}

      {/* Enhanced gradient hints */}
      {canScrollLeft && (
        <div className={`absolute left-0 top-0 bottom-0 w-16 pointer-events-none z-10 ${styles.gradientLeft}`} />
      )}
      {canScrollRight && (
        <div className={`absolute right-0 top-0 bottom-0 w-16 pointer-events-none z-10 ${styles.gradientRight}`} />
      )}
      
      <div 
        ref={scrollContainerRef}
        className={`flex overflow-x-auto pb-3 gap-3 px-1 ${styles.scrollContainer}`}
      >
        {/* All Products Chip */}
        <button
          onClick={() => handleCategorySelect(null)}
          data-category-id="all"
          className={`
            flex items-center gap-2 px-4 py-2.5 rounded-full whitespace-nowrap text-sm font-medium 
            transition-all duration-200 flex-shrink-0 shadow-sm
            ${styles.categoryChip}
            ${!selectedCategoryId 
              ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/25 scale-105 ring-2 ring-primary/20' 
              : 'bg-card border border-border hover:bg-accent hover:text-accent-foreground active:scale-95 hover:shadow-md'
            }
          `}
        >
          <Grid3X3 className="h-4 w-4" />
          {t('allProducts')}
        </button>
        
        {/* Category Chips */}
        {flatCategories.map((category) => {
          const IconComponent = categoryIcons[category.icon || 'grid'] || Grid3X3
          const isSelected = selectedCategoryId === category.id
          
          return (
            <button
              key={category.id}
              onClick={() => handleCategorySelect(category.id)}
              data-category-id={category.id}
              className={`
                flex items-center gap-2 px-4 py-2.5 rounded-full whitespace-nowrap text-sm font-medium 
                transition-all duration-200 flex-shrink-0 shadow-sm
                ${styles.categoryChip}
                ${isSelected 
                  ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/25 scale-105 ring-2 ring-primary/20' 
                  : 'bg-card border border-border hover:bg-accent hover:text-accent-foreground active:scale-95 hover:shadow-md'
                }
              `}
            >
              <IconComponent className="h-4 w-4" />
              <span>{category.name}</span>
              {category.level > 0 && (
                <span className="text-xs opacity-60 bg-black/10 dark:bg-white/10 px-1.5 py-0.5 rounded ml-1">
                  Sub
                </span>
              )}
            </button>
          )
        })}
        
        {/* Spacer to ensure last item is fully visible */}
        <div className="w-8 flex-shrink-0" />
      </div>

      {/* Enhanced scroll indicator */}
      {flatCategories.length > 3 && (
        <div className="flex justify-center mt-3 gap-1.5">
          <div className={`h-1 w-8 rounded-full transition-all duration-300 ${canScrollLeft ? 'bg-muted-foreground/30' : 'bg-primary/60'}`} />
          <div className={`h-1 w-2 rounded-full transition-all duration-300 ${(canScrollLeft && canScrollRight) ? 'bg-primary' : 'bg-muted-foreground/20'}`} />
          <div className={`h-1 w-8 rounded-full transition-all duration-300 ${canScrollRight ? 'bg-muted-foreground/30' : 'bg-primary/60'}`} />
        </div>
      )}
    </div>
  )
}

// Desktop Category Sidebar Component
function DesktopCategorySidebar({ 
  categories, 
  selectedCategoryId, 
  onCategorySelect, 
  t,
  className 
}: {
  categories: Category[]
  selectedCategoryId?: string
  onCategorySelect: (categoryId: string | null) => void
  t: any
  className: string
}) {
  const handleCategoryClick = (categoryId: string) => {
    if (selectedCategoryId === categoryId) {
      onCategorySelect(null)
    } else {
      onCategorySelect(categoryId)
    }
  }

  return (
    <Card className={`p-4 ${className}`}>
      <div className="space-y-2">
        <h3 className="font-semibold text-lg mb-4">{t('categories')}</h3>
        
        {/* Show All Products Button */}
        <Button
          variant={!selectedCategoryId ? "default" : "ghost"}
          className="w-full justify-start h-auto p-3"
          onClick={() => onCategorySelect(null)}
        >
          <Grid3X3 className="h-4 w-4 mr-3 flex-shrink-0" />
          <span className="text-left">{t('allProducts')}</span>
        </Button>

        {/* Category List */}
        <div className="space-y-1">
          {categories.map((category) => (
            <CategoryItem
              key={category.id}
              category={category}
              selectedCategoryId={selectedCategoryId}
              onCategoryClick={handleCategoryClick}
              level={0}
            />
          ))}
        </div>

        {categories.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <Grid3X3 className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">{t('states.noCategories')}</p>
          </div>
        )}
      </div>
    </Card>
  )
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
  const t = useTranslations('Catalog')

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

  if (loading) {
    return (
      <>
        {/* Mobile Loading */}
        <div className="lg:hidden">
          <div className="flex gap-3 pb-3">
            {[...Array(4)].map((_, i) => (
              <div 
                key={i} 
                className={`h-10 rounded-full flex-shrink-0 ${styles.loadingChip}`}
                style={{ width: `${80 + Math.random() * 40}px` }}
              />
            ))}
          </div>
        </div>
        
        {/* Desktop Loading */}
        <Card className={`p-4 ${className} hidden lg:block`}>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span className="ml-2 text-sm text-muted-foreground">
              {t('states.loadingCategories')}
            </span>
          </div>
        </Card>
      </>
    )
  }

  if (error) {
    return (
      <>
        {/* Mobile Error */}
        <div className="lg:hidden">
          <div className="text-center py-4">
            <p className="text-sm text-destructive mb-2">{t('states.errorLoadingCategories')}</p>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => window.location.reload()}
            >
              {t('actions.retry')}
            </Button>
          </div>
        </div>
        
        {/* Desktop Error */}
        <Card className={`p-4 ${className} hidden lg:block`}>
          <div className="text-center py-8">
            <p className="text-sm text-destructive mb-2">{t('states.errorLoadingCategories')}</p>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => window.location.reload()}
            >
              {t('actions.retry')}
            </Button>
          </div>
        </Card>
      </>
    )
  }

  return (
    <>
      {/* Mobile View - Horizontal Scrollable Chips */}
      <div className="lg:hidden">
        <MobileCategoryChips
          categories={categories}
          selectedCategoryId={selectedCategoryId}
          onCategorySelect={onCategorySelect}
          t={t}
        />
      </div>
      
      {/* Desktop View - Vertical Sidebar */}
      <div className="hidden lg:block">
        <DesktopCategorySidebar
          categories={categories}
          selectedCategoryId={selectedCategoryId}
          onCategorySelect={onCategorySelect}
          t={t}
          className={className}
        />
      </div>
    </>
  )
}