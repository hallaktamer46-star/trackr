import { useState, useEffect } from 'react'
import Header from './Header'
import Onboarding from '../Onboarding'
import { useAuth } from '../../contexts/AuthContext'
import { isSupabaseConfigured } from '../../lib/supabase'

export default function Layout({ children }) {
  const { user } = useAuth()
  const [showOnboarding, setShowOnboarding] = useState(false)

  useEffect(() => {
    if (!user || !isSupabaseConfigured) return
    const m = user.user_metadata || {}
    if (!m.first_name) setShowOnboarding(true)
  }, [user])

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <Header />
      <main className="max-w-screen-xl mx-auto p-3 md:p-6">
        {children}
      </main>
      {showOnboarding && (
        <Onboarding onComplete={() => setShowOnboarding(false)} />
      )}
    </div>
  )
}
