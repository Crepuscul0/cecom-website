"use client"

import { useState } from 'react'
import { Globe } from 'lucide-react'

interface LanguageToggleProps {
  currentLocale: string
  onLocaleChange: (locale: string) => void
}

export function LanguageToggle({ currentLocale, onLocaleChange }: LanguageToggleProps) {
  const [isOpen, setIsOpen] = useState(false)

  const languages = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'es', name: 'Español', flag: '🇩🇴' }
  ]

  const currentLanguage = languages.find(lang => lang.code === currentLocale) || languages[0]

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-md bg-card border border-border hover:bg-accent transition-colors"
      >
        <Globe className="h-4 w-4" />
        <span className="text-sm font-medium">{currentLanguage.flag} {currentLanguage.code.toUpperCase()}</span>
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-1 bg-card border border-border rounded-md shadow-lg z-50 min-w-[140px]">
          {languages.map((language) => (
            <button
              key={language.code}
              onClick={() => {
                onLocaleChange(language.code)
                setIsOpen(false)
              }}
              className={`w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-accent transition-colors first:rounded-t-md last:rounded-b-md ${
                currentLocale === language.code ? 'bg-accent' : ''
              }`}
            >
              <span>{language.flag}</span>
              <span>{language.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
