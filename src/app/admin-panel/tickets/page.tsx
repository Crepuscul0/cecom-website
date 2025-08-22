import { AdminPanelLayout } from '@/components/admin/AdminPanelLayout'
import { TicketsManagement } from '@/components/admin/TicketsManagement'

export const dynamic = 'force-dynamic'

export default function TicketsPage() {
  return (
    <AdminPanelLayout activeSection="tickets">
      <TicketsManagement />
    </AdminPanelLayout>
  )
}
