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
    <Card className="group hover:shadow-xl transition-all duration-300 transform hover:scale-105 border-0 shadow-lg">
      <CardHeader className="flex flex-col items-center p-6">
        <div className="w-24 h-24 rounded-full overflow-hidden mb-4 bg-gradient-to-br from-muted to-muted group-hover:from-primary/10 group-hover:to-primary/20 transition-all duration-300">
          {image ? (
            <Image
              src={image.url}
              alt={image.alt || `${name} profile photo`}
              width={96}
              height={96}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-primary/30">
              <span className="text-2xl font-bold text-primary">
                {name.split(' ').map(n => n[0]).join('').toUpperCase()}
              </span>
            </div>
          )}
        </div>
        <h3 className="text-lg font-semibold text-foreground text-center">{name}</h3>
        <p className="text-sm font-medium text-primary text-center">{position}</p>
      </CardHeader>
      <CardContent className="px-6 pb-6">
        <p className="text-sm text-muted-foreground text-center leading-relaxed">{bio}</p>
      </CardContent>
    </Card>
  )
}