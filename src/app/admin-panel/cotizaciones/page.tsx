"use client"

import { AdminPanelLayout } from '@/components/admin/AdminPanelLayout'
import { CotizacionesManagement } from '@/components/admin/CotizacionesManagement'

export default function CotizacionesPage() {
  return (
    <AdminPanelLayout activeSection="cotizaciones">
      <CotizacionesManagement />
    </AdminPanelLayout>
  )
}
