"use client"

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { LoginForm } from '@/components/auth/LoginForm'
import { SignUpForm } from '@/components/auth/SignUpForm'

export default function AuthPage() {
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [message, setMessage] = useState('')
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const messageParam = searchParams.get('message')
    if (messageParam === 'pending_approval') {
      setMessage('Tu cuenta está pendiente de aprobación por un administrador.')
    }

    // Check if user is already logged in
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        router.push('/admin-panel')
      }
    }
    checkUser()
  }, [router, searchParams])

  const handleSuccess = () => {
    if (mode === 'login') {
      router.push('/admin-panel')
    } else {
      setMessage('Cuenta creada exitosamente. Esperando aprobación del administrador.')
      setMode('login')
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {message && (
          <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-md text-sm text-center">
            {message}
          </div>
        )}
        
        {mode === 'login' ? (
          <LoginForm 
            onSuccess={handleSuccess}
            onToggleMode={() => setMode('signup')}
          />
        ) : (
          <SignUpForm 
            onSuccess={handleSuccess}
            onToggleMode={() => setMode('login')}
          />
        )}
      </div>
    </div>
  )
}
