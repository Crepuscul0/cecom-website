'use client'

import Image from 'next/image'
import { Card, CardHeader, CardTitle } from '@/components/ui/card'

interface Vendor {
  id: string
  name: string
  logo?: {
    url: string
    alt?: string
  }
  website?: string
}

interface VendorGridProps {
  vendors: Vendor[]
}

// Static logo mapping for vendors
const vendorLogos: Record<string, string> = {
  'watchguard': '/logos/watchguard.svg',
  'extreme networks': '/logos/extreme.svg',
  'hp': '/logos/hp.svg',
  'lenovo': '/logos/lenovo.svg',
  'panduit': '/logos/panduit.svg',
  'vertiv': '/logos/vertiv.svg',
  '3cx': '/logos/3cx.svg',
  'eset': '/logos/eset.svg',
  'axis': '/logos/axis.svg',
  'cambium': '/logos/cambium.svg',
  'cambium networks': '/logos/cambium.svg',
  'dahua': '/logos/dahua.svg',
  'weboost': '/logos/weboost.svg',
  'avaya': '/logos/avaya.svg',
}

function getVendorLogo(vendorName: string, logoUrl?: string): string | null {
  // If logo URL is provided, use it
  if (logoUrl) return logoUrl

  // Otherwise, try to find a static logo by vendor name
  const normalizedName = vendorName.toLowerCase().trim()
  return vendorLogos[normalizedName] || null
}

export function VendorGrid({ vendors }: VendorGridProps) {
  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
      {vendors.map((vendor) => {
        const logoPath = getVendorLogo(vendor.name, vendor.logo?.url)

        return (
          <Card
            key={vendor.id}
            className="group hover:shadow-xl transition-all duration-300 transform hover:scale-105 border-0 shadow-lg"
          >
            <CardHeader className="flex flex-col items-center p-6">
              <div className="w-full h-40 flex items-center justify-center mb-4 bg-gradient-to-br from-muted to-accent rounded-lg overflow-hidden p-4 group-hover:from-primary/10 group-hover:to-primary/20 transition-all duration-300">
                {logoPath ? (
                  <div className="relative w-full h-full">
                    <Image
                      src={logoPath}
                      alt={`${vendor.name} logo`}
                      fill
                      className="object-contain dark:brightness-0 dark:invert transition-all duration-300"
                      sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    />
                  </div>
                ) : (
                  <div className="text-xs font-semibold text-muted-foreground text-center px-2">
                    {vendor.name}
                  </div>
                )}
              </div>
              <CardTitle className="text-center text-sm font-semibold text-foreground">
                {vendor.name}
              </CardTitle>
            </CardHeader>
          </Card>
        )
      })}
    </div>
  )
}