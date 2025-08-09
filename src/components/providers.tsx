"use client";

import { ThemeProvider } from "next-themes";
import { NextIntlClientProvider } from "next-intl";
import Header from "@/components/header";

export function Providers({ children, messages, locale, timeZone, now }: { children: React.ReactNode; messages: any; locale: string; timeZone?: string; now?: Date }) {
  return (
    <NextIntlClientProvider messages={messages} locale={locale} timeZone={timeZone} now={now}>
      <ThemeProvider 
        attribute="class" 
        defaultTheme="dark" 
        enableSystem={false}
        disableTransitionOnChange

      >
        <Header />
        {children}
      </ThemeProvider>
    </NextIntlClientProvider>
  );
}