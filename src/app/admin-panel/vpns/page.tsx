"use client"

import { AdminPanelLayout } from '@/components/admin/AdminPanelLayout'
import { VPNsManagement } from '@/components/admin/VPNsManagement'

export default function VPNsPage() {
  return (
    <AdminPanelLayout activeSection="vpns">
      <VPNsManagement />
    </AdminPanelLayout>
  )
}
