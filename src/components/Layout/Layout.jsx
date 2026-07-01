import { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import Header from './Header'
import AppSidebar, { SidebarProvider, SidebarInset } from './Sidebar'
import Onboarding from '../Onboarding'
import UpgradeCelebration from '../UpgradeCelebration'
import EngageWidget from '../EngageWidget'
import { useAuth } from '../../contexts/AuthContext'
import { isSupabaseConfigured } from '../../lib/supabase'

function LayoutInner({ children }) {
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

  useEffect(() => {
    const params = new URLSearchParams(location.search)
    if (params.get('checkout') === 'success') {
      const plan = params.get('plan') || 'pro'
      setUpgradePlan(plan)
      navigate('/', { replace: true })
    }
  }, [])

  return (
    <>
      <AppSidebar />
      <SidebarInset style={{ background: '#000000' }}>
        <Header />
        <main style={{ padding: '20px 24px', minHeight: 'calc(100vh - 56px)' }}>
          <div style={{ maxWidth: 1200, margin: '0 auto' }}>
            {children}
          </div>
        </main>
      </SidebarInset>
      {showOnboarding && <Onboarding onComplete={() => setShowOnboarding(false)} />}
      {upgradePlan && <UpgradeCelebration plan={upgradePlan} onClose={() => setUpgradePlan(null)} />}
      <EngageWidget />
    </>
  )
}

export default function Layout({ children }) {
  return (
    <SidebarProvider style={{ '--sidebar-width': '15rem', background: '#000000' }}>
      <LayoutInner>{children}</LayoutInner>
    </SidebarProvider>
  )
}
