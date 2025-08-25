'use client';
import { canModifyContent, signOut } from '@/lib/supabase';
import { useAdminData } from '@/hooks/useAdminData';
import { AdminIntlProvider } from './AdminIntlProvider';
import { AdminContent } from './AdminContent';
import { AdminLoading, AdminAccessDenied } from './AdminStates';
import { ToastProvider } from '@/components/ui/toast';

export function AdminDashboard() {
  const {
    categories,
    vendors,
    products,
    loading,
    user,
    userProfile,
    checkAuth,
    loadData,
    setUser,
    setUserProfile
  } = useAdminData();

  // Auth is gated by AdminPanelLayout; if not authenticated, the layout redirects.

  const handleSignOut = async () => {
    // Clear development mode
    localStorage.removeItem('dev_user');

    await signOut();
    setUser(null);
    setUserProfile(null);
  };

  // Show loading state (also covers the brief moment before user is resolved)
  if (loading || !user) {
    return <AdminLoading />;
  }

  // At this point, user is authenticated by the parent layout

  // Check if user has permission to access admin
  if (userProfile && !canModifyContent(userProfile.role)) {
    return (
      <AdminAccessDenied
        userProfile={userProfile}
        onSignOut={handleSignOut}
      />
    );
  }

  return (
    <AdminIntlProvider>
      <ToastProvider>
        <div className="w-full h-full flex flex-col">
          {/* CMS header removed: no sign-out button or user identification in top bar */}

          <div className="flex-1 w-full">
            <AdminContent
              categories={categories}
              vendors={vendors}
              products={products}
              onRefresh={loadData}
            />
          </div>
        </div>
      </ToastProvider>
    </AdminIntlProvider>
  );
}