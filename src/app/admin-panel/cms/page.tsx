"use client"

import { AdminPanelLayout } from '@/components/admin/AdminPanelLayout'
import { AdminDashboard } from '@/components/admin/AdminDashboard'

export default function CMSPage() {
  return (
    <AdminPanelLayout activeSection="cms">
      <AdminDashboard />
    </AdminPanelLayout>
  )
}
