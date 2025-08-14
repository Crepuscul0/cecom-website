'use client'

import { useState } from 'react'
import Image from 'next/image'
import { useTranslations } from 'next-intl'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Eye, FileText, ExternalLink } from 'lucide-react'
import { Product, Vendor, Category, Media } from '@/lib/payload/types'

interface ProductCardProps {
  product: Product
  onViewDetails: (product: Product) => void
  className?: string
}

export function ProductCard({ product, onViewDetails, className = '' }: ProductCardProps) {
  const [imageLoading, setImageLoading] = useState(true)
  const [imageError, setImageError] = useState(false)
  const t = useTranslations('Catalog')

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

  const handleViewDetails = () => {
    onViewDetails(product)
  }

  const getImageUrl = (media: Media | undefined, fallback: string = '/placeholder-product.jpg') => {
    if (!media) return fallback
    return media.sizes?.card?.url || media.url || fallback
  }

  const getVendorLogoUrl = (media: Media | undefined) => {
    if (!media) return null
    return media.sizes?.thumbnail?.url || media.url
  }

  return (
    <Card className={`group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 ${className}`}>
      <CardContent className="p-0">
        {/* Product Image */}
        <div className="relative aspect-square overflow-hidden rounded-t-lg bg-muted">
          {!imageError ? (
            <Image
              src={getImageUrl(productImage)}
              alt={product.name || 'Product image'}
              fill
              className={`object-cover transition-all duration-300 group-hover:scale-105 ${
                imageLoading ? 'opacity-0' : 'opacity-100'
              }`}
              onLoad={handleImageLoad}
              onError={handleImageError}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : (
            <div className="flex items-center justify-center h-full bg-muted">
              <div className="text-center text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No image</p>
              </div>
            </div>
          )}
          
          {/* Loading overlay */}
          {imageLoading && !imageError && (
            <div className="absolute inset-0 flex items-center justify-center bg-muted">
              <div className="animate-pulse">
                <div className="h-4 w-4 bg-border rounded-full"></div>
              </div>
            </div>
          )}

          {/* Category badge */}
          {category && (
            <div className="absolute top-2 left-2">
              <Badge variant="secondary" className="text-xs">
                {category.name}
              </Badge>
            </div>
          )}

          {/* Vendor logo */}
            {vendor && getVendorLogoUrl(vendorLogo) && (
            <div className="absolute top-2 right-2 bg-background rounded-full p-1 shadow-sm border">
              <Image
                src={getVendorLogoUrl(vendorLogo)!}
                alt={vendor.name}
                width={24}
                height={24}
                className="object-contain"
              />
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="p-4">
          <div className="space-y-2">
            {/* Product Name */}
            <h3 className="font-semibold text-lg line-clamp-2 group-hover:text-primary transition-colors">
              {product.name}
            </h3>

            {/* Vendor Name */}
            {vendor && (
              <p className="text-sm text-muted-foreground font-medium">
                {vendor.name}
              </p>
            )}

            {/* Product Description */}
            {product.description && (
              <div className="text-sm text-muted-foreground line-clamp-3">
                {typeof product.description === 'string' 
                  ? product.description 
                  : product.description?.root?.children?.[0]?.children?.[0]?.text || ''
                }
              </div>
            )}

            {/* Features Preview */}
            {product.features && Array.isArray(product.features) && product.features.length > 0 && (
              <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  {t('features')}
                </p>
                <div className="flex flex-wrap gap-1">
                  {product.features.slice(0, 3).map((feature, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {typeof feature === 'string' ? feature : feature.feature || ''}
                    </Badge>
                  ))}
                  {product.features.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{product.features.length - 3} more
                    </Badge>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0">
        <div className="flex gap-2 w-full">
          <Button 
            onClick={handleViewDetails}
            className="flex-1"
            size="sm"
          >
            <Eye className="h-4 w-4 mr-2" />
            {t('actions.viewDetails')}
          </Button>
          
          {product.datasheet && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => {
                const datasheetUrl = typeof product.datasheet === 'object' 
                  ? (product.datasheet as Media).url 
                  : product.datasheet
                if (datasheetUrl) {
                  window.open(datasheetUrl, '_blank')
                }
              }}
            >
              <FileText className="h-4 w-4" />
            </Button>
          )}

          {vendor?.website && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => window.open(vendor.website, '_blank')}
            >
              <ExternalLink className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  )
}