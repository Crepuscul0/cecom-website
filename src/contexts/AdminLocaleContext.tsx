"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { NextIntlClientProvider } from 'next-intl'

interface AdminLocaleContextType {
  locale: string
  setLocale: (locale: string) => void
  messages: any
}

const AdminLocaleContext = createContext<AdminLocaleContextType | undefined>(undefined)

export function useAdminLocale() {
  const context = useContext(AdminLocaleContext)
  if (!context) {
    throw new Error('useAdminLocale must be used within AdminLocaleProvider')
  }
  return context
}

interface AdminLocaleProviderProps {
  children: ReactNode
  initialMessages: any
  initialLocale?: string
}

export function AdminLocaleProvider({ 
  children, 
  initialMessages, 
  initialLocale = 'en' 
}: AdminLocaleProviderProps) {
  const [locale, setLocaleState] = useState(initialLocale)
  const [messages, setMessages] = useState(initialMessages)

  const setLocale = async (newLocale: string) => {
    try {
      // Fetch messages for the new locale
      const response = await fetch(`/api/messages?locale=${newLocale}`)
      if (response.ok) {
        const newMessages = await response.json()
        setMessages(newMessages)
        setLocaleState(newLocale)
        // Store preference in localStorage
        localStorage.setItem('admin-locale', newLocale)
      }
    } catch (error) {
      console.error('Failed to load messages for locale:', newLocale, error)
    }
  }

  // Load saved locale preference on mount
  useEffect(() => {
    const savedLocale = localStorage.getItem('admin-locale')
    if (savedLocale && savedLocale !== locale) {
      setLocale(savedLocale)
    }
  }, [])

  return (
    <AdminLocaleContext.Provider value={{ locale, setLocale, messages }}>
      <NextIntlClientProvider messages={messages} locale={locale}>
        {children}
      </NextIntlClientProvider>
    </AdminLocaleContext.Provider>
  )
}
