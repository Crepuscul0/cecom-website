'use client';

import { UserProfile } from '@/lib/supabase';
import { AuthModal } from '@/components/auth/AuthModal';
import { useTranslations } from 'next-intl';

interface AdminLoadingProps {}

export function AdminLoading({}: AdminLoadingProps) {
  // Try to use translations but fail silently with defaults if context is missing
  let loadingText = 'Loading...';
  try {
    const t = useTranslations('Admin');
    loadingText = t('status.loading');
  } catch (e) {
    // Fall back to default text if translations aren't available
  }
  
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-muted-foreground">{loadingText}</p>
      </div>
    </div>
  );
}

interface AdminLoginProps {
  showAuthModal: boolean;
  onShowAuthModal: (show: boolean) => void;
  onAuthSuccess: () => void;
}

export function AdminLogin({ 
  showAuthModal, 
  onShowAuthModal, 
  onAuthSuccess 
}: AdminLoginProps) {
  // Default texts in case translations aren't available
  let titleText = 'Admin Area';
  let loginRequiredText = 'Please log in to access the admin area.';
  let loginButtonText = 'Log In';
  
  try {
    const t = useTranslations('Admin');
    titleText = t('title');
    loginRequiredText = t('auth.loginRequired');
    loginButtonText = t('auth.loginButton');
  } catch (e) {
    // Fall back to defaults if translations aren't available
  }
  
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <div className="bg-card rounded-lg shadow-md p-8 max-w-md mx-auto">
          <h1 className="text-2xl font-bold text-foreground mb-4">{titleText}</h1>
          <p className="text-muted-foreground mb-6">
            {loginRequiredText}
          </p>
          <button
            onClick={() => onShowAuthModal(true)}
            className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700"
          >
            {loginButtonText}
          </button>
        </div>
      </div>
      
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => onShowAuthModal(false)}
        onSuccess={onAuthSuccess}
      />
    </div>
  );
}

interface AdminAccessDeniedProps {
  userProfile: UserProfile;
  onSignOut: () => void;
}

export function AdminAccessDenied({ userProfile, onSignOut }: AdminAccessDeniedProps) {
  // Default texts in case translations aren't available
  let accessDeniedText = 'Access Denied';
  let noPermissionsText = 'You do not have permission to access this area.';
  let currentRoleText = 'Your current role:';
  let signOutText = 'Sign Out';
  
  try {
    const t = useTranslations('Admin');
    accessDeniedText = t('auth.accessDenied');
    noPermissionsText = t('auth.noPermissions');
    currentRoleText = t('auth.currentRole');
    signOutText = t('auth.signOut');
  } catch (e) {
    // Fall back to defaults if translations aren't available
  }
  
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <div className="bg-card rounded-lg shadow-md p-8 max-w-md mx-auto">
          <h1 className="text-2xl font-bold text-foreground mb-4">{accessDeniedText}</h1>
          <p className="text-muted-foreground mb-6">
            {noPermissionsText}
            <br />
            {currentRoleText} <span className="font-medium">{userProfile.role}</span>
          </p>
          <button
            onClick={onSignOut}
            className="bg-red-600 text-white px-6 py-2 rounded-md hover:bg-red-700"
          >
            {signOutText}
          </button>
        </div>
      </div>
    </div>
  );
}