'use client';

import { NextIntlClientProvider } from 'next-intl';
import { ReactNode, useEffect, useState } from 'react';

interface AdminIntlProviderProps {
  children: ReactNode;
}

export function AdminIntlProvider({ children }: AdminIntlProviderProps) {
  const [messages, setMessages] = useState<Record<string, any> | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Get the current locale from cookie or use default
    const getLocaleFromCookie = () => {
      if (typeof document !== 'undefined') {
        const match = document.cookie.match(new RegExp('(^| )NEXT_LOCALE=([^;]+)'));
        return match ? match[2] : 'en';
      }
      return 'en';
    };

    const locale = getLocaleFromCookie();
    
    // Fetch the messages for the current locale
    fetch(`/api/i18n?locale=${locale}`)
      .then(response => response.json())
      .then(data => {
        setMessages(data);
        setIsLoading(false);
      })
      .catch(error => {
        console.error('Failed to load messages:', error);
        // Fallback to just loading the component without translations
        setIsLoading(false);
      });
  }, []);

  if (isLoading || !messages) {
    // Simple loading state
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  return (
    <NextIntlClientProvider locale={messages.locale || 'en'} messages={messages}>
      {children}
    </NextIntlClientProvider>
  );
}
