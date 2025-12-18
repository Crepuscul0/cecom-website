"use client"

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'

function ResetPasswordContent() {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    // Listen for auth state changes (Implicit flow handles URL hash automatically)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'PASSWORD_RECOVERY') {
        // Valid recovery flow
        return
      }

      if (session) {
        // Valid session established
        return
      }
    })

    // Check if we already have a session
    const checkSession = async () => {
      // Give Supabase a moment to process the URL hash
      await new Promise(resolve => setTimeout(resolve, 500))

      const { data: { session }, error: sessionError } = await supabase.auth.getSession()

      if (sessionError || !session) {
        // If no session found after timeout, check if we're maybe just waiting for hash processing
        // But if we're here, likely the link is invalid or we need to wait more
        // For implicit flow, the hash is processed immediately by the client
        setError('Enlace de recuperación inválido o expirado.')
      }
    }

    checkSession()

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    // Validate passwords
    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres')
      setLoading(false)
      return
    }

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden')
      setLoading(false)
      return
    }

    try {
      const { error } = await supabase.auth.updateUser({
        password: password
      })

      if (error) {
        setError(error.message)
      } else {
        setSuccess(true)
        // Redirect to login after 2 seconds
        setTimeout(() => {
          router.push('/auth')
        }, 2000)
      }
    } catch (err) {
      setError('Error inesperado al actualizar la contraseña')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-[url('/background.svg')] bg-cover bg-center bg-no-repeat dark:brightness-90 dark:contrast-110 relative">
        <div
          className="absolute inset-0 z-0 bg-gradient-to-br from-background/70 via-background/60 to-background/70 dark:from-background/80 dark:via-background/70 dark:to-background/80"
          aria-hidden="true"
        />
        <div className="relative z-10 min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-md w-full">
            <div className="bg-background rounded-lg shadow-md p-8 text-center">
              <div className="text-green-600 mb-4">
                <svg className="h-16 w-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-foreground mb-2">¡Contraseña Actualizada!</h2>
              <p className="text-muted-foreground mb-4">
                Tu contraseña ha sido actualizada exitosamente.
              </p>
              <p className="text-sm text-muted-foreground">
                Redirigiendo al inicio de sesión...
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[url('/background.svg')] bg-cover bg-center bg-no-repeat dark:brightness-90 dark:contrast-110 relative">
      <div
        className="absolute inset-0 z-0 bg-gradient-to-br from-background/70 via-background/60 to-background/70 dark:from-background/80 dark:via-background/70 dark:to-background/80"
        aria-hidden="true"
      />
      <div className="relative z-10 min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full">
          <div className="bg-background rounded-lg shadow-md p-8">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-foreground">Restablecer Contraseña</h2>
              <p className="text-muted-foreground mt-2">Ingresa tu nueva contraseña</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-foreground mb-1">
                  Nueva Contraseña
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="w-full px-3 py-2 border border-border rounded-md bg-background dark:bg-[#0a1222] focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
                  placeholder="Mínimo 6 caracteres"
                />
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-foreground mb-1">
                  Confirmar Contraseña
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={6}
                  className="w-full px-3 py-2 border border-border rounded-md bg-background dark:bg-[#0a1222] focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
                  placeholder="Confirma tu contraseña"
                />
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Actualizando...' : 'Actualizar Contraseña'}
              </button>
            </form>

            <div className="mt-6 text-center">
              <button
                onClick={() => router.push('/auth')}
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                ← Volver al inicio de sesión
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Cargando...</div>}>
      <ResetPasswordContent />
    </Suspense>
  )
}
