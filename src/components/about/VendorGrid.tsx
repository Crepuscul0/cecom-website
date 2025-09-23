'use client'

import { Logo } from '@/components/common/Logo'
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

export function VendorGrid({ vendors }: VendorGridProps) {
  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
      {vendors.map((vendor) => (
        <Card 
          key={vendor.id}
          className="group hover:shadow-xl transition-all duration-300 transform hover:scale-105 border-0 shadow-lg"
        >
          <CardHeader className="flex flex-col items-center p-6">
            <div className="w-full h-40 flex items-center justify-center mb-4">
              {vendor.logo ? (
                <Logo logo={vendor.logo.url} name={vendor.name} />
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
      ))}
    </div>
  )
}