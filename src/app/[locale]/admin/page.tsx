import { redirect } from 'next/navigation';
import { AdminDashboard } from '@/components/admin/AdminDashboard';

export default function AdminPage() {
  // Simple auth check - in production you'd want proper authentication
  const isAuthenticated = true; // Replace with actual auth logic
  
  if (!isAuthenticated) {
    redirect('/login');
  }

  return (
    <div className="min-h-screen bg-background dark:bg-background">
      <AdminDashboard />
    </div>
  );
}