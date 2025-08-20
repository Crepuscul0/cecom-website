"use client"

import { AdminPanelLayout } from '@/components/admin/AdminPanelLayout'
import { UsersManagement } from '@/components/admin/UsersManagement'

export default function UsersPage() {
  return (
    <AdminPanelLayout activeSection="users">
      <UsersManagement />
    </AdminPanelLayout>
  )
}
