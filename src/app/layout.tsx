import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'CECOM - Technology Solutions',
  description: 'Professional technology solutions for businesses in the Dominican Republic',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html>
      <body>{children}</body>
    </html>
  )
}