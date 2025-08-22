import { AdminPanelLayout } from '@/components/admin/AdminPanelLayout'
import { VPNsManagement } from '@/components/admin/VPNsManagement'

export const dynamic = 'force-dynamic'

export default function VPNsPage() {
  return (
    <AdminPanelLayout activeSection="vpns">
      <VPNsManagement />
    </AdminPanelLayout>
  )
}
