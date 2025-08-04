"use client";

import { ThemeProvider } from "next-themes";
import { NextIntlClientProvider } from "next-intl";
import Header from "@/components/header";
import { useEffect, useState } from "react";

export function Providers({ children, messages, locale }: { children: React.ReactNode; messages: any; locale: string }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <NextIntlClientProvider messages={messages} locale={locale}>
        <div className="bg-white text-gray-900">
          <Header />
          {children}
        </div>
      </NextIntlClientProvider>
    );
  }

  return (
    <NextIntlClientProvider messages={messages} locale={locale}>
      <ThemeProvider 
        attribute="class" 
        defaultTheme="light" 
        enableSystem={false}
        disableTransitionOnChange
      >
        <Header />
        {children}
      </ThemeProvider>
    </NextIntlClientProvider>
  );
}