import { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import Header from './Header'
import Onboarding from '../Onboarding'
import UpgradeCelebration from '../UpgradeCelebration'
import EngageWidget from '../EngageWidget'
import { useAuth } from '../../contexts/AuthContext'
import { isSupabaseConfigured } from '../../lib/supabase'

export default function Layout({ children }) {
  const { user } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [upgradePlan, setUpgradePlan] = useState(null)

  useEffect(() => {
    if (!user || !isSupabaseConfigured) return
    const m = user.user_metadata || {}
    if (!m.first_name) setShowOnboarding(true)
  }, [user])

  // Detect ?checkout=success&plan= after Stripe redirect
  useEffect(() => {
    const params = new URLSearchParams(location.search)
    if (params.get('checkout') === 'success') {
      const plan = params.get('plan') || 'pro'
      setUpgradePlan(plan)
      // Clean URL without re-rendering the whole page
      navigate('/', { replace: true })
    }
  }, [])

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <Header />
      <main className="max-w-screen-xl mx-auto p-3 md:p-6">
        {children}
      </main>
      {showOnboarding && (
        <Onboarding onComplete={() => setShowOnboarding(false)} />
      )}
      {upgradePlan && (
        <UpgradeCelebration plan={upgradePlan} onClose={() => setUpgradePlan(null)} />
      )}
      <EngageWidget />
    </div>
  )
}
