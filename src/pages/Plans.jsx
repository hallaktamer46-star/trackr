import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Check, Zap, Loader2, Crown, Rocket } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useApplications } from '../contexts/ApplicationContext'
import { apiFetch } from '../lib/api'

const PLANS = [
  {
    key: 'free',
    name: 'Free',
    price: '$0',
    period: 'forever',
    icon: Zap,
    accent: '#8a919f',
    description: 'Get started tracking your job search.',
    features: [
      'Up to 10 applications',
      'Kanban pipeline',
      'Follow-up reminders',
      'Basic analytics',
      'Community feed',
      'Job board access',
    ],
    cta: 'Current plan',
    disabled: true,
  },
  {
    key: 'pro',
    name: 'Pro',
    price: '$15',
    period: 'per month',
    icon: Crown,
    accent: '#a3c9ff',
    highlight: true,
    description: 'Everything you need to land your next role faster.',
    features: [
      'Unlimited applications',
      'All AI tools',
      'CV Builder (build from scratch)',
      'CV & Cover Letter AI review',
      'Interview prep & coaching',
      'Salary & market intelligence',
      'Company research briefs',
      'LinkedIn profile optimiser',
      'Priority support',
    ],
    cta: 'Upgrade to Pro',
  },
  {
    key: 'apex',
    name: 'Apex',
    price: '$29',
    period: 'per month',
    icon: Rocket,
    accent: '#4edea3',
    description: 'For serious candidates who want an unfair advantage.',
    features: [
      'Everything in Pro',
      'Offer Negotiation Simulator',
      'AI job matching from board',
      'Email reminders to your inbox',
      'Exportable pipeline (PDF / CSV)',
      'Public shareable profile',
      'Chrome extension (1-click add)',
      'Resume hosting & public link',
      'Dedicated account support',
    ],
    cta: 'Upgrade to Apex',
    badge: 'Best value',
  },
]

export default function Plans() {
  const { user } = useAuth()
  const { isPaidUser, isApexUser } = useApplications()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(null)
  const [error, setError] = useState(null)

  const handleUpgrade = async (planKey) => {
    if (!user) return
    setLoading(planKey); setError(null)
    try {
      const res = await apiFetch('/api/stripe/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, email: user.email, plan: planKey }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      window.location.href = data.url
    } catch (err) {
      setError(err.message || 'Could not open checkout.')
      setLoading(null)
    }
  }

  return (
    <div className="max-w-5xl mx-auto" style={{ fontFamily: 'Geist, Inter, sans-serif' }}>

      {/* Header */}
      <div className="text-center mb-12 pt-4">
        <p style={{ fontFamily: 'Geist Mono, monospace', fontSize: 10, fontWeight: 600, letterSpacing: '0.1em', color: '#a3c9ff', textTransform: 'uppercase', marginBottom: 8 }}>
          Pricing
        </p>
        <h1 style={{ fontSize: 36, fontWeight: 700, letterSpacing: '-0.04em', color: '#e2e2e8', lineHeight: 1.1, marginBottom: 12 }}>
          Invest in your career
        </h1>
        <p style={{ fontSize: 15, color: '#8a919f', maxWidth: 420, margin: '0 auto' }}>
          One job offer pays for years of Trackr. Pick the plan that matches where you are in your search.
        </p>
      </div>

      {error && (
        <p className="text-center text-xs mb-6" style={{ color: '#ffb4ab', fontFamily: 'Geist Mono, monospace' }}>{error}</p>
      )}

      {/* Plan cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-px" style={{ background: 'rgba(48,54,61,0.6)' }}>
        {PLANS.map(plan => {
          const Icon = plan.icon
          const isCurrentFree = plan.key === 'free' && !isPaidUser
          const isCurrentPro  = plan.key === 'pro'  && isPaidUser && !isApexUser
          const isCurrentApex = plan.key === 'apex' && isApexUser

          const isCurrent = isCurrentFree || isCurrentPro || isCurrentApex

          return (
            <div
              key={plan.key}
              style={{
                background: plan.highlight ? `linear-gradient(180deg, #0c1d35 0%, #0d1117 100%)` : '#0d1117',
                padding: '28px 24px',
                position: 'relative',
                borderTop: plan.highlight ? `2px solid ${plan.accent}` : '2px solid transparent',
              }}
            >
              {/* Badge */}
              {plan.badge && (
                <span style={{
                  position: 'absolute', top: -1, right: 24,
                  fontFamily: 'Geist Mono, monospace', fontSize: 8, fontWeight: 700,
                  letterSpacing: '0.08em', textTransform: 'uppercase',
                  background: plan.accent, color: '#0d1117',
                  padding: '3px 8px',
                }}>
                  {plan.badge}
                </span>
              )}

              {/* Icon + name */}
              <div className="flex items-center gap-3 mb-4">
                <div style={{
                  width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: `${plan.accent}14`, border: `0.5px solid ${plan.accent}30`,
                }}>
                  <Icon size={16} style={{ color: plan.accent }} />
                </div>
                <div>
                  <p style={{ fontFamily: 'Geist Mono, monospace', fontSize: 11, fontWeight: 700, color: plan.accent, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                    {plan.name}
                  </p>
                </div>
              </div>

              {/* Price */}
              <div className="mb-2 flex items-end gap-2">
                <span style={{ fontFamily: 'Geist Mono, monospace', fontSize: 40, fontWeight: 700, letterSpacing: '-0.05em', color: '#e2e2e8', lineHeight: 1 }}>
                  {plan.price}
                </span>
                <span style={{ fontFamily: 'Geist Mono, monospace', fontSize: 11, color: '#8a919f', marginBottom: 4 }}>
                  {plan.period}
                </span>
              </div>

              <p style={{ fontSize: 12, color: '#8a919f', marginBottom: 24, lineHeight: 1.5 }}>
                {plan.description}
              </p>

              {/* Features */}
              <ul className="space-y-2.5 mb-8">
                {plan.features.map(f => (
                  <li key={f} className="flex items-start gap-2.5">
                    <Check size={13} style={{ color: plan.accent, marginTop: 1, flexShrink: 0 }} />
                    <span style={{ fontSize: 12, color: '#c0c7d5', lineHeight: 1.4 }}>{f}</span>
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <button
                onClick={() => !isCurrent && !plan.disabled && handleUpgrade(plan.key)}
                disabled={plan.disabled || isCurrent || loading === plan.key}
                className="w-full flex items-center justify-center gap-2 transition-all hover:brightness-110 disabled:opacity-40"
                style={{
                  padding: '11px 0',
                  background: isCurrent || plan.disabled
                    ? 'rgba(138,145,159,0.1)'
                    : plan.key === 'apex'
                      ? 'linear-gradient(90deg, #4edea3, #a3c9ff)'
                      : plan.accent === '#a3c9ff' ? '#1493ff' : `${plan.accent}22`,
                  border: `0.5px solid ${isCurrent || plan.disabled ? 'rgba(138,145,159,0.2)' : plan.accent}`,
                  color: isCurrent || plan.disabled ? '#8a919f' : plan.key === 'apex' ? '#0d1117' : plan.key === 'pro' ? '#fff' : plan.accent,
                  fontFamily: 'Geist Mono, monospace',
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                  cursor: isCurrent || plan.disabled ? 'default' : 'pointer',
                }}
              >
                {loading === plan.key
                  ? <><Loader2 size={13} className="animate-spin" /> Opening…</>
                  : isCurrent ? 'Current plan' : plan.cta
                }
              </button>
            </div>
          )
        })}
      </div>

      {/* Footer note */}
      <p className="text-center mt-8" style={{ fontFamily: 'Geist Mono, monospace', fontSize: 10, color: '#404753', letterSpacing: '0.05em' }}>
        All plans include SSL encryption · Cancel anytime · No hidden fees
      </p>
    </div>
  )
}
