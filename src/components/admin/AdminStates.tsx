'use client';

import { UserProfile } from '@/lib/supabase';
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

interface AdminAccessDeniedProps {
  userProfile?: UserProfile | null;
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
  
  const renderContent = () => {
    if (!userProfile) {
      return (
        <div className="mb-6">
          <p className="text-muted-foreground">
            {noPermissionsText}
          </p>
        </div>
      );
    }

    return (
      <>
        <p className="text-muted-foreground mb-6">{noPermissionsText}</p>
        <div className="mb-6 p-4 bg-muted/50 rounded-md text-left">
          <p className="text-sm text-muted-foreground">
            {currentRoleText}
          </p>
          <p className="font-medium text-foreground">
            {userProfile.role}
          </p>
        </div>
      </>
    );
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="bg-card p-8 rounded-lg shadow-md max-w-md w-full text-center">
        <div className="text-destructive mb-4">
          <svg
            className="h-12 w-12 mx-auto"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-foreground mb-2">
          {accessDeniedText}
        </h2>
        
        {renderContent()}
        
        <button
          onClick={onSignOut}
          className="w-full bg-destructive text-destructive-foreground hover:bg-destructive/90 px-4 py-2 rounded-md font-medium transition-colors"
        >
          {signOutText}
        </button>
      </div>
    </div>
  );
}