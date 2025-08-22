import { AdminPanelLayout } from '@/components/admin/AdminPanelLayout'
import { AplicacionesManagement } from '@/components/admin/AplicacionesManagement'

export const dynamic = 'force-dynamic'

export default function AplicacionesPage() {
  return (
    <AdminPanelLayout activeSection="aplicaciones">
      <AplicacionesManagement />
    </AdminPanelLayout>
  )
}
