import { getMessages } from 'next-intl/server'
import { AdminLocaleProvider } from '@/contexts/AdminLocaleContext'

export default async function AdminPanelLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Default to English for admin panel
  const locale = 'en'
  const messages = await getMessages({ locale })

  return (
    <AdminLocaleProvider initialMessages={messages} initialLocale={locale}>
      {children}
    </AdminLocaleProvider>
  )
}
