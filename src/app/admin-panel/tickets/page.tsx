"use client"

import { AdminPanelLayout } from '@/components/admin/AdminPanelLayout'
import { TicketsManagement } from '@/components/admin/TicketsManagement'

export default function TicketsPage() {
  return (
    <AdminPanelLayout activeSection="tickets">
      <TicketsManagement />
    </AdminPanelLayout>
  )
}
