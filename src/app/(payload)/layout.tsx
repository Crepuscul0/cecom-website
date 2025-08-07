/* THIS FILE WAS GENERATED AUTOMATICALLY BY PAYLOAD. */
import type { Metadata } from 'next'

import config from '../../../payload.config'
import { RootLayout } from '@payloadcms/next/layouts'

import './custom.css'

type Args = {
  children: React.ReactNode
}

export const metadata: Metadata = {
  title: 'CECOM Admin',
  description: 'CECOM Website Content Management System',
}

const Layout = ({ children }: Args) => (
  <RootLayout config={config}>{children}</RootLayout>
)

export default Layout