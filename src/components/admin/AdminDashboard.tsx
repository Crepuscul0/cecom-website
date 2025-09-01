'use client';
import { useEffect } from 'react';
import { canModifyContent, signOut } from '@/lib/supabase';
import { useAdminData } from '@/hooks/useAdminData';
import { AdminContent } from './AdminContent';
import { AdminLoading, AdminAccessDenied } from './AdminStates';
import { ToastProvider } from '@/components/ui/toast';
import { useTranslations } from 'next-intl';

export function AdminDashboard() {
  const t = useTranslations('AdminPanel');
  
  const {
    categories,
    vendors,
    products,
    loading,
    user,
    userProfile,
    loadData,
    setUser,
    setUserProfile
  } = useAdminData();

  // Handle sign out
  const handleSignOut = async () => {
    try {
      // Clear development mode
      localStorage.removeItem('dev_user');
      await signOut();
      setUser(null);
      setUserProfile(null);
    } catch (error) {
      console.error('Error during sign out:', error);
    }
  };

  // Show loading state (also covers the brief moment before user is resolved)
  if (loading || !user) {
    return <AdminLoading />;
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
    <ToastProvider>
      <div className="min-h-screen bg-background">
        {loading ? (
          <AdminLoading />
        ) : !user || !userProfile ? (
          <AdminAccessDenied 
            userProfile={null} 
            onSignOut={handleSignOut} 
          />
        ) : (
          <AdminContent
            categories={categories}
            vendors={vendors}
            products={products}
            onRefresh={loadData}
          />
        )}
      </div>
    </ToastProvider>
  );
}