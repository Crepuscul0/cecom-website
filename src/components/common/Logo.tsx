'use client';

import Image from 'next/image';

interface LogoProps {
  logo: string;
  name: string;
}

export function Logo({ logo, name }: LogoProps) {
  const isSvg = logo.toLowerCase().endsWith('.svg');
  
  return (
    <div className="relative w-full h-40 bg-gradient-to-br from-muted to-accent rounded-lg overflow-hidden flex items-center justify-center p-4 group-hover:from-primary/10 group-hover:to-primary/20 transition-all duration-300">
      <div className="relative h-full w-full">
        <Image
          src={logo}
          alt={name}
          fill
          className={`object-contain bg-transparent transition-all duration-300 ${
            isSvg ? 'dark:brightness-0 dark:invert' : ''
          }`}
          sizes="(min-width: 1024px) 25vw, 50vw"
        />
      </div>
    </div>
  );
}
