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

export function VendorGrid({ vendors }: VendorGridProps) {
  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
      {vendors.map((vendor) => (
        <Card 
          key={vendor.id}
          className="group hover:shadow-xl transition-all duration-300 transform hover:scale-105 bg-white border-0 shadow-lg"
        >
          <CardHeader className="flex flex-col items-center p-6">
            <div className="w-full h-16 flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 group-hover:from-blue-50 group-hover:to-blue-100 rounded-lg transition-all duration-300 mb-4">
              {vendor.logo ? (
                <Image
                  src={vendor.logo.url}
                  alt={vendor.logo.alt || `${vendor.name} logo`}
                  width={80}
                  height={48}
                  className="max-h-12 max-w-full object-contain filter grayscale group-hover:grayscale-0 transition-all duration-300"
                />
              ) : (
                <div className="text-xs font-semibold text-gray-400 text-center px-2">
                  {vendor.name}
                </div>
              )}
            </div>
            <CardTitle className="text-center text-sm font-semibold text-gray-700">
              {vendor.name}
            </CardTitle>
          </CardHeader>
        </Card>
      ))}
    </div>
  )
}