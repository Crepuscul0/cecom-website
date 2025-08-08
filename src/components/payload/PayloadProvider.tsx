'use client'

import React, { createContext, useContext, ReactNode } from 'react'

interface PayloadContextType {
  apiUrl: string
  locale: string
}

const PayloadContext = createContext<PayloadContextType | undefined>(undefined)

interface PayloadProviderProps {
  children: ReactNode
  locale?: string
}

export const PayloadProvider: React.FC<PayloadProviderProps> = ({
  children,
  locale = 'en',
}) => {
  const apiUrl = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'

  return (
    <PayloadContext.Provider value={{ apiUrl, locale }}>
      {children}
    </PayloadContext.Provider>
  )
}

export const usePayload = () => {
  const context = useContext(PayloadContext)
  if (context === undefined) {
    throw new Error('usePayload must be used within a PayloadProvider')
  }
  return context
}