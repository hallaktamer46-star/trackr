import { createContext, useContext, useEffect, useState } from 'react'
import { supabase, isSupabaseConfigured } from '../lib/supabase'

const AuthContext = createContext(null)

// Demo user for when Supabase is not configured
const DEMO_USER = { id: 'demo-user', email: 'demo@trackr.app' }

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isSupabaseConfigured) {
      // Fall back to demo mode — auto-sign in
      const saved = localStorage.getItem('trackr_demo_user')
      setUser(saved ? JSON.parse(saved) : null)
      setLoading(false)
      return
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  const signUp = async (email, password) => {
    if (!isSupabaseConfigured) {
      const u = { ...DEMO_USER, email }
      localStorage.setItem('trackr_demo_user', JSON.stringify(u))
      setUser(u)
      return { error: null }
    }
    return supabase.auth.signUp({ email, password })
  }

  const signIn = async (email, password) => {
    if (!isSupabaseConfigured) {
      const u = { ...DEMO_USER, email }
      localStorage.setItem('trackr_demo_user', JSON.stringify(u))
      setUser(u)
      return { error: null }
    }
    return supabase.auth.signInWithPassword({ email, password })
  }

  const signOut = async () => {
    if (!isSupabaseConfigured) {
      localStorage.removeItem('trackr_demo_user')
      setUser(null)
      return
    }
    await supabase.auth.signOut()
  }

  return (
    <AuthContext.Provider value={{ user, loading, signUp, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
