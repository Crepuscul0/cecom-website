'use client'

import Image from 'next/image'
import { Card, CardContent, CardHeader } from '@/components/ui/card'

interface TeamMemberProps {
  name: string
  position: string
  bio: string
  image?: {
    url: string
    alt?: string
  }
}

export function TeamMember({ name, position, bio, image }: TeamMemberProps) {
  return (
    <Card className="group hover:shadow-xl transition-all duration-300 transform hover:scale-105 bg-white border-0 shadow-lg">
      <CardHeader className="flex flex-col items-center p-6">
        <div className="w-24 h-24 rounded-full overflow-hidden mb-4 bg-gradient-to-br from-gray-50 to-gray-100 group-hover:from-blue-50 group-hover:to-blue-100 transition-all duration-300">
          {image ? (
            <Image
              src={image.url}
              alt={image.alt || `${name} profile photo`}
              width={96}
              height={96}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-100 to-blue-200">
              <span className="text-2xl font-bold text-blue-600">
                {name.split(' ').map(n => n[0]).join('').toUpperCase()}
              </span>
            </div>
          )}
        </div>
        <h3 className="text-lg font-semibold text-gray-900 text-center">{name}</h3>
        <p className="text-sm font-medium text-blue-600 text-center">{position}</p>
      </CardHeader>
      <CardContent className="px-6 pb-6">
        <p className="text-sm text-gray-600 text-center leading-relaxed">{bio}</p>
      </CardContent>
    </Card>
  )
}