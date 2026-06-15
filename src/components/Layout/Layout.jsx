import { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import Header from './Header'
import Sidebar, { SIDEBAR_W } from './Sidebar'
import Onboarding from '../Onboarding'
import UpgradeCelebration from '../UpgradeCelebration'
import EngageWidget from '../EngageWidget'
import { useAuth } from '../../contexts/AuthContext'
import { isSupabaseConfigured } from '../../lib/supabase'
import { SidebarProvider, useSidebar } from '../../contexts/SidebarContext'

function LayoutInner({ children }) {
  const { user } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const { flyoutWidth } = useSidebar()
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
    <div style={{ minHeight: '100vh', background: '#0d1117' }}>
      <Header />
      <Sidebar />
      <main style={{
        marginLeft: SIDEBAR_W + flyoutWidth,
        transition: 'margin-left 0.22s cubic-bezier(0.22,1,0.36,1)',
        padding: '20px 24px',
        minHeight: 'calc(100vh - 56px)',
      }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          {children}
        </div>
      </main>
      {showOnboarding && <Onboarding onComplete={() => setShowOnboarding(false)} />}
      {upgradePlan && <UpgradeCelebration plan={upgradePlan} onClose={() => setUpgradePlan(null)} />}
      <EngageWidget />
    </div>
  )
}

export default function Layout({ children }) {
  return (
    <SidebarProvider>
      <LayoutInner>{children}</LayoutInner>
    </SidebarProvider>
  )
}
