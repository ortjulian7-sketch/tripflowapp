import type { Session } from '@supabase/supabase-js'
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { supabase } from '@/lib/supabase'
import { traducirErrorAuth } from './authErrors'

interface AuthContextValue {
  session: Session | null
  loading: boolean
  signUp: (
    email: string,
    password: string,
  ) => Promise<{ error: string | null; userId: string | null }>
  signIn: (email: string, password: string) => Promise<{ error: string | null }>
  signOut: () => Promise<void>
  resetPassword: (email: string) => Promise<{ error: string | null }>
  updatePassword: (newPassword: string) => Promise<{ error: string | null }>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setLoading(false)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession)
    })

    return () => subscription.unsubscribe()
  }, [])

  async function signUp(email: string, password: string) {
    const { data, error } = await supabase.auth.signUp({ email, password })
    if (error) return { error: traducirErrorAuth(error.message), userId: null }
    return { error: null, userId: data.user?.id ?? null }
  }

  async function signIn(email: string, password: string) {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    return { error: error ? traducirErrorAuth(error.message) : null }
  }

  async function signOut() {
    await supabase.auth.signOut()
  }

  async function resetPassword(email: string) {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/recuperar-contrasena/confirmar`,
    })
    return { error: error ? traducirErrorAuth(error.message) : null }
  }

  async function updatePassword(newPassword: string) {
    const { error } = await supabase.auth.updateUser({ password: newPassword })
    return { error: error ? traducirErrorAuth(error.message) : null }
  }

  return (
    <AuthContext.Provider
      value={{ session, loading, signUp, signIn, signOut, resetPassword, updatePassword }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth debe usarse dentro de AuthProvider')
  }
  return context
}
