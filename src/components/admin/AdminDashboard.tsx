'use client';

import { useState } from 'react';
import { canModifyContent, signOut } from '@/lib/supabase';
import { useAdminData } from '@/hooks/useAdminData';
import { AdminHeader } from './AdminHeader';
import { AdminIntlProvider } from './AdminIntlProvider';
import { AdminContent } from './AdminContent';
import { AdminLoading, AdminLogin, AdminAccessDenied } from './AdminStates';
import { ToastProvider } from '@/components/ui/toast';

export function AdminDashboard() {
  const [showAuthModal, setShowAuthModal] = useState(false);
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

  const handleAuthSuccess = () => {
    checkAuth();
  };

  const handleSignOut = async () => {
    // Clear development mode
    localStorage.removeItem('dev_user');

    await signOut();
    setUser(null);
    setUserProfile(null);
  };

  // Show loading state
  if (loading) {
    return <AdminLoading />;
  }

  // Show login if user is not authenticated
  if (!user) {
    return (
      <AdminLogin
        showAuthModal={showAuthModal}
        onShowAuthModal={setShowAuthModal}
        onAuthSuccess={handleAuthSuccess}
      />
    );
  }

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
          <AdminHeader
            userProfile={userProfile}
            onSignOut={handleSignOut}
          />

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