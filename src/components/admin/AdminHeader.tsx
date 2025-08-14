import { UserProfile } from '@/lib/supabase';

interface AdminHeaderProps {
  userProfile: UserProfile | null;
  onSignOut: () => void;
}

export function AdminHeader({ userProfile, onSignOut }: AdminHeaderProps) {
  return (
    <header className="bg-card shadow-sm border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center">
            <h1 className="text-2xl font-bold text-foreground">CECOM CMS</h1>
            <span className="ml-3 px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
              Activo
            </span>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-sm text-muted-foreground">
              <span className="block">
                {userProfile?.first_name} {userProfile?.last_name}
              </span>
              <span className="text-xs capitalize">
                {userProfile?.role}
              </span>
            </div>
            <button
              onClick={onSignOut}
              className="bg-red-600 text-white px-4 py-2 rounded-md text-sm hover:bg-red-700"
            >
              Cerrar Sesión
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}