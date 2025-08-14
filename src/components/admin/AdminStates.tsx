import { UserProfile } from '@/lib/supabase';
import { AuthModal } from '@/components/auth/AuthModal';
import { useTranslations } from 'next-intl';

interface AdminLoadingProps {}

export function AdminLoading({}: AdminLoadingProps) {
  const t = useTranslations('Admin');
  
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-muted-foreground">{t('status.loading')}</p>
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
  const t = useTranslations('Admin');
  
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <div className="bg-card rounded-lg shadow-md p-8 max-w-md mx-auto">
          <h1 className="text-2xl font-bold text-foreground mb-4">{t('title')}</h1>
          <p className="text-muted-foreground mb-6">
            {t('auth.loginRequired')}
          </p>
          <button
            onClick={() => onShowAuthModal(true)}
            className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700"
          >
            {t('auth.loginButton')}
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
  const t = useTranslations('Admin');
  
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <div className="bg-card rounded-lg shadow-md p-8 max-w-md mx-auto">
          <h1 className="text-2xl font-bold text-foreground mb-4">{t('auth.accessDenied')}</h1>
          <p className="text-muted-foreground mb-6">
            {t('auth.noPermissions')}
            <br />
            {t('auth.currentRole')} <span className="font-medium">{userProfile.role}</span>
          </p>
          <button
            onClick={onSignOut}
            className="bg-red-600 text-white px-6 py-2 rounded-md hover:bg-red-700"
          >
            {t('auth.signOut')}
          </button>
        </div>
      </div>
    </div>
  );
}