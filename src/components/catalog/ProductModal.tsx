'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { useTranslations } from 'next-intl'
// Using custom modal instead of Dialog component to avoid dependency issues
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  X, 
  ChevronLeft, 
  ChevronRight, 
  FileText, 
  ExternalLink, 
  Package,
  Building2,
  Tag
} from 'lucide-react'
import { Product, Vendor, Category, Media } from '@/lib/payload/types'

interface ProductModalProps {
  product: Product | null
  isOpen: boolean
  onClose: () => void
  onNavigate?: (direction: 'prev' | 'next') => void
  canNavigate?: {
    prev: boolean
    next: boolean
  }
}

export function ProductModal({ 
  product, 
  isOpen, 
  onClose, 
  onNavigate,
  canNavigate 
}: ProductModalProps) {
  const [imageLoading, setImageLoading] = useState(true)
  const [imageError, setImageError] = useState(false)
  const t = useTranslations('Catalog')

  // Reset image states when product changes
  useEffect(() => {
    if (product) {
      setImageLoading(true)
      setImageError(false)
    }
  }, [product])

  if (!product) return null

  // Type guards and data extraction
  const vendor = typeof product.vendor === 'object' ? product.vendor as Vendor : null
  const category = typeof product.category === 'object' ? product.category as Category : null
  const productImage = product.image as Media | undefined
  const vendorLogo = vendor?.logo as Media | undefined

  const handleImageLoad = () => {
    setImageLoading(false)
  }

  const handleImageError = () => {
    setImageLoading(false)
    setImageError(true)
  }

  const getImageUrl = (media: Media | undefined, fallback: string = '/placeholder-product.jpg') => {
    if (!media) return fallback
    return media.sizes?.tablet?.url || media.url || fallback
  }

  const getVendorLogoUrl = (media: Media | undefined) => {
    if (!media) return null
    return media.sizes?.thumbnail?.url || media.url
  }

  const renderRichTextContent = (content: any) => {
    if (typeof content === 'string') {
      return content
    }
    
    if (content?.root?.children) {
      return content.root.children
        .map((child: any) => {
          if (child.children) {
            return child.children
              .map((textNode: any) => textNode.text || '')
              .join('')
          }
          return ''
        })
        .join('\n')
    }
    
    return ''
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        {/* Backdrop */}
        <div 
          className="fixed inset-0 transition-opacity bg-background/80 backdrop-blur-sm" 
          onClick={onClose}
        ></div>
        
        {/* Modal */}
        <div className="inline-block w-full max-w-4xl p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-background border shadow-xl rounded-lg max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="flex flex-row items-center justify-between space-y-0 pb-4">
            <h2 className="text-xl font-bold pr-8">
              {product.name}
            </h2>
            
            <div className="flex items-center gap-2">
              {/* Navigation buttons */}
              {onNavigate && canNavigate && (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onNavigate('prev')}
                    disabled={!canNavigate.prev}
                  >
                    <ChevronLeft className="h-4 w-4" />
                    {t('modal.previousProduct')}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onNavigate('next')}
                    disabled={!canNavigate.next}
                  >
                    {t('modal.nextProduct')}
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </>
              )}
              
              {/* Close button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Product Image */}
          <div className="space-y-4">
            <div className="relative aspect-square overflow-hidden rounded-lg bg-muted">
              {!imageError ? (
                <Image
                  src={getImageUrl(productImage)}
                  alt={product.name || t('modal.productImageAlt')}
                  fill
                  className={`object-cover transition-opacity duration-300 ${
                    imageLoading ? 'opacity-0' : 'opacity-100'
                  }`}
                  onLoad={handleImageLoad}
                  onError={handleImageError}
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
              ) : (
                <div className="flex items-center justify-center h-full bg-muted">
                  <div className="text-center text-muted-foreground">
                    <Package className="h-16 w-16 mx-auto mb-4 opacity-50" />
                    <p>{t('modal.noImageAvailable')}</p>
                  </div>
                </div>
              )}
              
              {/* Loading overlay */}
              {imageLoading && !imageError && (
                <div className="absolute inset-0 flex items-center justify-center bg-muted">
                  <div className="animate-pulse">
                    <div className="h-8 w-8 bg-border rounded-full"></div>
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              {product.datasheet && (
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => {
                    const datasheetUrl = typeof product.datasheet === 'object' 
                      ? (product.datasheet as Media).url 
                      : product.datasheet
                    if (datasheetUrl) {
                      window.open(datasheetUrl, '_blank')
                    }
                  }}
                >
                  <FileText className="h-4 w-4 mr-2" />
                  {t('datasheet')}
                </Button>
              )}

              {vendor?.website && (
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => window.open(vendor.website, '_blank')}
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  {t('modal.visitWebsite')}
                </Button>
              )}
            </div>
          </div>

          {/* Product Details */}
          <div className="space-y-6">
            {/* Basic Info */}
            <div className="space-y-4">
              {/* Category and Vendor */}
              <div className="flex flex-wrap gap-2">
                {category && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <Tag className="h-3 w-3" />
                    {category.name}
                  </Badge>
                )}
                {vendor && (
                  <Badge variant="outline" className="flex items-center gap-1">
                    <Building2 className="h-3 w-3" />
                    {vendor.name}
                  </Badge>
                )}
              </div>

              {/* Vendor Logo */}
              {vendor && getVendorLogoUrl(vendorLogo) && (
                <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                  <Image
                    src={getVendorLogoUrl(vendorLogo)!}
                    alt={`${vendor.name} ${t('modal.logoAlt')}`}
                    width={40}
                    height={40}
                    className="object-contain"
                  />
                  <div>
                    <p className="font-medium">{vendor.name}</p>
                    {vendor.description && (
                      <p className="text-sm text-muted-foreground">
                        {vendor.description}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Description */}
            {product.description && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">{t('modal.description')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="prose prose-sm max-w-none">
                    <p className="text-muted-foreground leading-relaxed">
                      {renderRichTextContent(product.description)}
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Features */}
            {product.features && product.features.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">{t('features')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {product.features.map((feature, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0" />
                        <span className="text-sm">{feature.feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* Specifications placeholder */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">{t('specifications')}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  {t('modal.specificationsNote')}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
        </div>
      </div>
    </div>
  )
}