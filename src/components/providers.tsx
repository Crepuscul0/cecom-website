"use client";

import { ThemeProvider } from "next-themes";
import { NextIntlClientProvider } from "next-intl";
import Header from "@/components/header";

export function Providers({ children, messages, locale }: { children: React.ReactNode; messages: any; locale: string }) {
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