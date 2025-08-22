"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { supabase, getUserProfile, UserProfile, isAdmin, isEmployee } from '@/lib/supabase'
import { Users, Ticket, FileText, Wifi, Settings, LogOut, Menu, X } from 'lucide-react'
import { LanguageToggle } from '@/components/admin/LanguageToggle'
import { useAdminLocale } from '@/contexts/AdminLocaleContext'

interface AdminPanelLayoutProps {
  children: React.ReactNode
  activeSection: string
}

export function AdminPanelLayout({ children, activeSection }: AdminPanelLayoutProps) {
  const [user, setUser] = useState<any>(null)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const router = useRouter()
  const t = useTranslations('AdminPanel')
  const { locale, setLocale } = useAdminLocale()

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setUser(user)
        const profile = await getUserProfile(user.id)
        setUserProfile(profile)
        
        // Check if user is approved
        if (profile && profile.approval_status !== 'approved') {
          router.push('/auth?message=pending_approval')
          return
        }
      } else {
        router.push('/auth')
      }
      setLoading(false)
    }

    getUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') {
        router.push('/auth')
      }
    })

    return () => subscription.unsubscribe()
  }, [router])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!user || !userProfile) {
    return null
  }

  const navigationItems = [
    // Admin-only sections
    ...(isAdmin(userProfile.role) ? [
      { id: 'cms', label: t('navigation.cms'), icon: Settings, href: '/admin-panel/cms' },
      { id: 'users', label: t('navigation.users'), icon: Users, href: '/admin-panel/users' },
    ] : []),
    
    // Employee and Admin sections
    ...(isEmployee(userProfile.role) || isAdmin(userProfile.role) ? [
      { id: 'tickets', label: t('navigation.tickets'), icon: Ticket, href: '/admin-panel/tickets' },
      { id: 'cotizaciones', label: t('navigation.cotizaciones'), icon: FileText, href: '/admin-panel/cotizaciones' },
      { id: 'aplicaciones', label: t('navigation.aplicaciones'), icon: Settings, href: '/admin-panel/aplicaciones' },
      { id: 'vpns', label: t('navigation.vpns'), icon: Wifi, href: '/admin-panel/vpns' },
    ] : []),
  ]

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setSidebarOpen(false)} />
          <div className="fixed inset-y-0 left-0 z-50 w-64 bg-card shadow-lg">
            <SidebarContent 
              navigationItems={navigationItems}
              activeSection={activeSection}
              userProfile={userProfile}
              onSignOut={handleSignOut}
              onClose={() => setSidebarOpen(false)}
            />
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-64 lg:flex-col">
        <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-card px-6 pb-4">
          <SidebarContent 
            navigationItems={navigationItems}
            activeSection={activeSection}
            userProfile={userProfile}
            onSignOut={handleSignOut}
          />
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64 flex flex-col min-h-screen">
        {/* Top bar */}
        <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-border bg-card px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
          <button
            type="button"
            className="-m-2.5 p-2.5 text-muted-foreground lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </button>

          <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
            <div className="flex items-center gap-x-4 lg:gap-x-6">
              <h1 className="text-lg font-semibold text-foreground">
                {t('title')}
              </h1>
            </div>
            <div className="flex items-center gap-x-4 lg:gap-x-6 ml-auto">
              <LanguageToggle currentLocale={locale} onLocaleChange={setLocale} />
              <span className="text-sm text-muted-foreground">
                {userProfile.first_name} {userProfile.last_name}
              </span>
              <span className="inline-flex items-center rounded-md bg-primary/10 px-2 py-1 text-xs font-medium text-primary ring-1 ring-inset ring-primary/20">
                {userProfile.role === 'admin' ? t('navigation.users') : 
                 userProfile.role === 'employee' ? 'Empleado' : 'Usuario'}
              </span>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1 h-full">
          <div className="h-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}

interface SidebarContentProps {
  navigationItems: Array<{
    id: string
    label: string
    icon: any
    href: string
  }>
  activeSection: string
  userProfile: UserProfile
  onSignOut: () => void
  onClose?: () => void
}

function SidebarContent({ navigationItems, activeSection, userProfile, onSignOut, onClose }: SidebarContentProps) {
  const router = useRouter()

  const handleNavigation = (href: string) => {
    router.push(href)
    onClose?.()
  }

  return (
    <>
      <div className="flex h-16 shrink-0 items-center justify-between">
        <div className="flex items-center">
          <h2 className="text-lg font-semibold text-foreground">CECOM Admin</h2>
        </div>
        {onClose && (
          <button onClick={onClose} className="lg:hidden">
            <X className="h-6 w-6" />
          </button>
        )}
      </div>
      
      <nav className="flex flex-1 flex-col">
        <ul role="list" className="flex flex-1 flex-col gap-y-7">
          <li>
            <ul role="list" className="-mx-2 space-y-1">
              {navigationItems.map((item) => {
                const Icon = item.icon
                const isActive = activeSection === item.id
                
                return (
                  <li key={item.id}>
                    <button
                      onClick={() => handleNavigation(item.href)}
                      className={`
                        group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold w-full text-left
                        ${isActive 
                          ? 'bg-primary text-primary-foreground' 
                          : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                        }
                      `}
                    >
                      <Icon className="h-6 w-6 shrink-0" />
                      {item.label}
                    </button>
                  </li>
                )
              })}
            </ul>
          </li>
          
          <li className="mt-auto">
            <div className="border-t border-border pt-4">
              <div className="px-2 py-2 text-xs text-muted-foreground">
                <div>Usuario: {userProfile.email}</div>
                <div>Rol: {userProfile.role === 'admin' ? 'Administrador' : 
                           userProfile.role === 'employee' ? 'Empleado' : 'Usuario'}</div>
              </div>
              <button
                onClick={onSignOut}
                className="group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold text-muted-foreground hover:text-foreground hover:bg-muted w-full text-left"
              >
                <LogOut className="h-6 w-6 shrink-0" />
                Cerrar Sesión
              </button>
            </div>
          </li>
        </ul>
      </nav>
    </>
  )
}
