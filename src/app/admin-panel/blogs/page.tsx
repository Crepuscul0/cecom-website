import { AdminPanelLayout } from '@/components/admin/AdminPanelLayout'
import { BlogManagement } from '@/components/admin/BlogManagement'

export const dynamic = 'force-dynamic'

export default function BlogsPage() {
  return (
    <AdminPanelLayout activeSection="blogs">
      <BlogManagement />
    </AdminPanelLayout>
  )
}
