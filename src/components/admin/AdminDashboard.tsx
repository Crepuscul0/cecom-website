'use client';

import { useState } from 'react';
import { canModifyContent, signOut } from '@/lib/supabase';
import { useAdminData } from '@/hooks/useAdminData';
import { AdminHeader } from './AdminHeader';
import { AdminContent } from './AdminContent';
import { AdminLoading, AdminLogin, AdminAccessDenied } from './AdminStates';

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
    <div className="min-h-screen bg-background">
      <AdminHeader
        userProfile={userProfile}
        onSignOut={handleSignOut}
      />

      <AdminContent
        categories={categories}
        vendors={vendors}
        products={products}
        onRefresh={loadData}
      />
    </div>
  );
}